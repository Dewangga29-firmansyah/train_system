import {
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaService } from 'src/prisma/prisma.service'
import { CreatePembelianDto } from './dto/create-pembelian.dto'

import * as QRCode from 'qrcode'
import PDFDocument from 'pdfkit'
import { Response } from 'express'

@Injectable()
export class PembelianService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    dto: CreatePembelianDto,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const pelanggan =
          await tx.pelanggan.findFirst({
            where: {
              userId,
            },
          })

        if (!pelanggan) {
          throw new NotFoundException(
            'Profil pelanggan belum dibuat',
          )
        }

        const jadwal =
          await tx.jadwal.findUnique({
            where: {
              id: dto.jadwalId,
            },
          })

        if (!jadwal) {
          throw new NotFoundException(
            'Jadwal tidak ditemukan',
          )
        }

        const pembelian =
          await tx.pembelian.create({
            data: {
              kodeBooking:
                `TRX-${Date.now()}`,

              pelangganId:
                pelanggan.id,

              jadwalId:
                dto.jadwalId,

              total:
                Number(
                  jadwal.harga,
                ) *
                dto.penumpang.length,

              status:
                'PENDING',
            },
          })

        const kursi =
          await tx.kursi.findMany({
            where: {
              id: {
                in:
                  dto.penumpang.map(
                    (p) =>
                      p.kursiId,
                  ),
              },
            },
          })

        await tx.detailPembelian.createMany({
          data:
            dto.penumpang.map(
              (p) => ({
                pembelianId:
                  pembelian.id,

                jadwalId:
                  dto.jadwalId,

                kursiId:
                  p.kursiId,

                namaPenumpang:
                  p.namaPenumpang,

                gerbongId:
                  kursi.find(
                    (k) =>
                      k.id ===
                      p.kursiId,
                  )!.gerbongId,
              }),
            ),
        })

        await tx.payment.create({
          data: {
            pembelianId:
              pembelian.id,
          },
        })

        return {
          id:
            pembelian.id,
        }
      },
    )
  }

  async findMine(
    userId: string,
  ) {
    const pelanggan =
      await this.prisma.pelanggan.findFirst({
        where: {
          userId,
        },

        select: {
          id: true,
        },
      })

    if (!pelanggan) {
      return []
    }

    return this.prisma.pembelian.findMany({
      where: {
        pelangganId:
          pelanggan.id,

        detail: {
          some: {},
        },
      },

      include: {
        jadwal: {
          include: {
            kereta: true,
          },
        },

        detail: {
          include: {
            kursi: true,
            gerbong: true,
          },
        },

        payment: true,
      },

      orderBy: {
        createdAt:
          'desc',
      },
    })
  }

  async findOneMine(
    userId: string,
    id: string,
  ) {
    const pelanggan =
      await this.prisma.pelanggan.findFirst({
        where: {
          userId,
        },
      })

    if (!pelanggan) {
      throw new NotFoundException(
        'Pelanggan tidak ditemukan',
      )
    }

    const pembelian =
      await this.prisma.pembelian.findFirst({
        where: {
          id,
          pelangganId:
            pelanggan.id,
        },

        include: {
          payment: true,

          detail: {
            include: {
              kursi: true,
              gerbong: true,
            },
          },

          jadwal: {
            include: {
              kereta: true,
            },
          },
        },
      })

    if (!pembelian) {
      throw new NotFoundException(
        'Pembelian tidak ditemukan',
      )
    }

    return pembelian
  }

  async findOneMine(
    userId: string,
    id: string,
  ) {
    const pelanggan =
      await this.prisma.pelanggan.findFirst({
        where: { userId },
        select: { id: true },
      })

    if (!pelanggan) {
      throw new NotFoundException('Profil pelanggan belum dibuat')
    }

    const data =
      await this.prisma.pembelian.findFirst({
        where: {
          id,
          pelangganId: pelanggan.id,
        },
        include: {
          jadwal: { include: { kereta: true } },
          detail: { include: { kursi: true } },
          payment: true,
        },
      })

    if (!data) {
      throw new NotFoundException('Pembelian tidak ditemukan')
    }

    return data
  }

  async confirmPayment(
    userId: string,
    id: string,
  ) {
    await this.findOneMine(
      userId,
      id,
    )

    await this.prisma.payment.update({
      where: {
        pembelianId:
          id,
      },

      data: {
        paidAt:
          new Date(),
      },
    })

    return this.prisma.pembelian.update({
      where: {
        id,
      },

      data: {
        status:
          'PAID',
      },
    })
  }

  async generateTiketPdf(
    userId: string,
    id: string,
    res: Response,
  ) {
    const data =
      await this.findOneMine(
        userId,
        id,
      )

    const qr =
      await QRCode.toDataURL(
        data.kodeBooking,
      )

    const doc =
      new PDFDocument()

    res.setHeader(
      'Content-Type',
      'application/pdf',
    )

    doc.pipe(res)

    doc.text(
      `Kode Booking: ${data.kodeBooking}`,
    )

    doc.image(
      Buffer.from(
        qr.split(',')[1],
        'base64',
      ),
    )

    doc.end()
  }

  findAll() {
    return this.prisma.pembelian.findMany({
      include: {
        pelanggan: true,
      },
    })
  }
}