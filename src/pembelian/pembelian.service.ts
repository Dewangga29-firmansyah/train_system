import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePembelianDto } from './dto/create-pembelian.dto';
import * as QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class PembelianService {
  constructor(private prisma: PrismaService) { }

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
            (p) =>
              p.kursiId,
          )

        const kursi =
          await tx.kursi.findMany({
            where: {
              id: {
                in: kursiIds,
              },
            },
          })

        if (
          kursi.length !==
          kursiIds.length
        ) {
          throw new BadRequestException(
            'Ada kursi tidak valid',
          )
        }

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
                dto
                  .penumpang
                  .length,

              status:
                'PENDING',
            },
          })

        await tx.detailPembelian.createMany(
          {
            data:
              dto.penumpang.map(
                (
                  p,
                ) => {
                  const seat =
                    kursi.find(
                      (
                        k,
                      ) =>
                        k.id ===
                        p.kursiId,
                    )!

                  return {
                    pembelianId:
                      pembelian.id,

                    jadwalId:
                      dto.jadwalId,

                    kursiId:
                      p.kursiId,

                    gerbongId:
                      seat.gerbongId,

                    namaPenumpang:
                      p.namaPenumpang,
                  }
                },
              ),
          },
        )

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

  async confirmPayment(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const data = await tx.pembelian.findUnique({
        where: { id },
      });

      if (!data) {
        throw new NotFoundException('Pembelian tidak ditemukan');
      }

      await tx.payment.update({
        where: { pembelianId: id },
        data: {
          paidAt: new Date(),
        },
      });

      return tx.pembelian.update({
        where: { id },
        data: {
          status: 'PAID',
        },
      });
    });
  }

  async cancelPembelian(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const data = await tx.pembelian.findUnique({
        where: { id },
        include: { jadwal: true },
      });

      if (!data) {
        throw new NotFoundException('Pembelian tidak ditemukan');
      }

      if (data.status !== 'PAID') {
        throw new BadRequestException('Hanya tiket PAID yang bisa dibatalkan');
      }

      const now = new Date();
      const batas = new Date(data.jadwal.tanggalBerangkat);
      batas.setHours(batas.getHours() - 2);

      if (now >= batas) {
        throw new BadRequestException('Refund ditutup (H-2 jam)');
      }

      await tx.payment.update({
        where: { pembelianId: id },
        data: {
          refundedAt: new Date(),
        },
      });

      return tx.pembelian.update({
        where: { id },
        data: {
          status: 'CANCELED',
        },
      });
    });
  }

  async getTiket(id: string) {
    const data = await this.prisma.pembelian.findUnique({
      where: { id },
      include: {
        pelanggan: true,
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
        payment: true,
      },
    });

    if (!data) {
      throw new NotFoundException('Pembelian tidak ditemukan');
    }

    if (data.status !== 'PAID') {
      throw new BadRequestException('Tiket belum tersedia');
    }

    return data;
  }

  async generateTiketPdf(id: string, res: Response) {
    const data = await this.getTiket(id);

    const qrData = JSON.stringify({
      kodeBooking: data.kodeBooking,
      id: data.id,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const qrImage = await QRCode.toDataURL(qrData);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=tiket-${data.kodeBooking}.pdf`,
    );

    doc.pipe(res);

    doc.fontSize(20).text('TIKET KERETA', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Kode Booking: ${data.kodeBooking}`);
    doc.text(`Nama: ${data.pelanggan.nama}`);
    doc.text(`Kereta: ${data.jadwal.kereta.nama}`);
    doc.text(`Asal: ${data.jadwal.asal}`);
    doc.text(`Tujuan: ${data.jadwal.tujuan}`);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    doc.text(`Tanggal: ${data.jadwal.tanggalBerangkat}`);

    doc.moveDown();

    data.detail.forEach((d, i) => {
      doc.text(
        `Penumpang ${i + 1}: ${d.namaPenumpang} - ${d.kursi.label} (${d.gerbong.nama})`,
      );
    });

    doc.moveDown();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const qrBuffer = Buffer.from(qrImage.split(',')[1], 'base64');

    doc.image(qrBuffer, {
      fit: [150, 150],
      align: 'center',
    });

    doc.end();
  }

  findAll() {
    return this.prisma.pembelian.findMany({
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

      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async findOne(id: string) {
    const data =
      await this.prisma.pembelian.findUnique({
        where: {
          id,
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
              kereta: {
                include: {
                  gerbong: true,
                },
              },
            },
          },
        },
      })

    if (!data) {
      throw new NotFoundException(
        'Pembelian anda tidak ditemukan',
      )
    }

    return data
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

      payment: true,
    },

    orderBy: {
      createdAt:
        'desc',
    },
  })
}
}
