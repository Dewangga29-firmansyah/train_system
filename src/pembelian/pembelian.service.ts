import {
  Injectable,
  BadRequestException,
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

        const kursiIds =
          dto.penumpang.map(
            (v) => v.kursiId,
          )

        const booked =
          await tx.detailPembelian.findMany({
            where: {
              jadwalId:
                dto.jadwalId,

              kursiId: {
                in: kursiIds,
              },
            },
          })

        if (
          booked.length
        ) {
          throw new BadRequestException(
            'Kursi sudah dibooking',
          )
        }

        const kursi =
          await tx.kursi.findMany({
            where: {
              id: {
                in: kursiIds,
              },
            },
          })

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

        await tx.detailPembelian.createMany({
          data:
            dto.penumpang.map(
              (p) => ({
                pembelianId:
                  pembelian.id,

                kursiId:
                  p.kursiId,

                jadwalId:
                  dto.jadwalId,

                namaPenumpang:
                  p.namaPenumpang,

                gerbongId:
                  kursi.find(
                    (k) =>
                      k.id ===
                      p.kursiId,
                  )!
                    .gerbongId,
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

          message:
            'Pemesanan berhasil',
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
      })

    if (!pelanggan) {
      return []
    }

    return this.prisma.pembelian.findMany({
      where: {
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

    const data =
      await this.prisma.pembelian.findFirst({
        where: {
          id,

          pelangganId:
            pelanggan?.id,
        },

        include: {
          pelanggan: true,

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

    if (!data) {
      throw new NotFoundException(
        'Tiket bukan milik anda',
      )
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

  async cancelPembelian(
    userId: string,
    id: string,
  ) {
    await this.findOneMine(
      userId,
      id,
    )

    return this.prisma.pembelian.update({
      where: {
        id,
      },

      data: {
        status:
          'CANCELED',
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

    doc.pipe(
      res,
    )

    doc
      .fontSize(24)
      .text(
        'TIKET KERETA',
      )

    doc.moveDown()

    doc.text(
      data.kodeBooking,
    )

    doc.text(
      data.jadwal.asal,
    )

    doc.text(
      data.jadwal.tujuan,
    )

    doc.image(
      Buffer.from(
        qr.split(
          ',',
        )[1],
        'base64',
      ),
      {
        fit: [
          180,
          180,
        ],
      },
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