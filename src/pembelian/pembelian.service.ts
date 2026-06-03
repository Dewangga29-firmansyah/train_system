import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePembelianDto } from './dto/create-pembelian.dto';

import * as QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

import { randomUUID } from 'crypto';

@Injectable()
export class PembelianService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePembelianDto) {
    return this.prisma.$transaction(async (tx) => {
      // 🔥 cek pelanggan
      const pelanggan = await tx.pelanggan.findFirst({
        where: { userId },
      });

      if (!pelanggan) {
        throw new NotFoundException(
          'Profil pelanggan belum dibuat',
        );
      }

      // 🔥 cek jadwal
      const jadwal = await tx.jadwal.findUnique({
        where: { id: dto.jadwalId },
      });

      if (!jadwal) {
        throw new NotFoundException(
          'Jadwal tidak ditemukan',
        );
      }

      // 🔥 create pembelian
      const pembelian = await tx.pembelian.create({
        data: {
          kodeBooking: `TRX-${randomUUID()}`,
          pelangganId: pelanggan.id,
          jadwalId: dto.jadwalId,
          total: Number(jadwal.harga) * dto.penumpang.length,
          status: 'PENDING',
        },
      });

      // 🔥 loop penumpang
      for (const p of dto.penumpang) {
        const kursi = await tx.kursi.findUnique({
          where: { id: p.kursiId },
        });

        if (!kursi) {
          throw new NotFoundException(
            `Kursi ${p.kursiId} tidak ditemukan`,
          );
        }

        if (!kursi.gerbongId) {
          throw new BadRequestException(
            'Gerbong tidak ditemukan di kursi',
          );
        }

        // 🔥 cek kursi sudah dipakai atau belum
        const used = await tx.detailPembelian.findFirst({
          where: {
            kursiId: p.kursiId,
            jadwalId: dto.jadwalId,
          },
        });

        if (used) {
          throw new BadRequestException(
            `Kursi ${p.kursiId} sudah dipakai`,
          );
        }

        await tx.detailPembelian.create({
          data: {
            pembelianId: pembelian.id,
            jadwalId: dto.jadwalId,
            kursiId: p.kursiId,
            namaPenumpang: p.namaPenumpang,
            gerbongId: kursi.gerbongId,
          },
        });
      }

      // 🔥 create payment
      await tx.payment.create({
        data: {
          pembelianId: pembelian.id,
        },
      });

      return {
        id: pembelian.id,
        kodeBooking: pembelian.kodeBooking,
      };
    });
  }

  async findMine(userId: string) {
    const pelanggan = await this.prisma.pelanggan.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!pelanggan) return [];

    return this.prisma.pembelian.findMany({
      where: {
        pelangganId: pelanggan.id,
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
        createdAt: 'desc',
      },
    });
  }

  async findOneMine(userId: string, id: string) {
    const pelanggan = await this.prisma.pelanggan.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!pelanggan) {
      throw new NotFoundException(
        'Profil pelanggan belum dibuat',
      );
    }

    const data = await this.prisma.pembelian.findFirst({
      where: {
        id,
        pelangganId: pelanggan.id,
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
          },
        },
        payment: true,
      },
    });

    if (!data) {
      throw new NotFoundException(
        'Pembelian tidak ditemukan',
      );
    }

    return data;
  }

  async confirmPayment(userId: string, id: string) {
    await this.findOneMine(userId, id);

    const payment = await this.prisma.payment.findUnique({
      where: { pembelianId: id },
    });

    if (!payment) {
      throw new NotFoundException('Payment tidak ditemukan');
    }

    if (payment.paidAt) {
      throw new BadRequestException(
        'Payment sudah dibayar',
      );
    }

    await this.prisma.payment.update({
      where: { pembelianId: id },
      data: {
        paidAt: new Date(),
      },
    });

    return this.prisma.pembelian.update({
      where: { id },
      data: {
        status: 'PAID',
      },
    });
  }

  async generateTiketPdf(
    userId: string,
    id: string,
    res: Response,
  ) {
    const data = await this.findOneMine(userId, id);

    const qr = await QRCode.toDataURL(data.kodeBooking);

    const doc = new PDFDocument();

    res.setHeader(
      'Content-Type',
      'application/pdf',
    );

    doc.pipe(res);

    doc.fontSize(14).text(
      `Kode Booking: ${data.kodeBooking}`,
    );

    doc.moveDown();

    doc.image(Buffer.from(qr.split(',')[1], 'base64'), {
      width: 150,
    });

    doc.end();
  }

  findAll() {
    return this.prisma.pembelian.findMany({
      include: {
        pelanggan: true,
      },
    });
  }
}