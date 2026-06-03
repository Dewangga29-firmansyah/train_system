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
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 100).fill('#08152d');
    doc.fillColor('#00ffff').fontSize(24).font('Helvetica-Bold').text('RAIL', 50, 40, { continued: true });
    doc.fillColor('#ffffff').text('TICKET');
    doc.fillColor('#8fb5df').fontSize(10).font('Helvetica').text('Official Train E-Ticket', 50, 70);

    // QR Code on top right
    doc.image(Buffer.from(qr.split(',')[1], 'base64'), doc.page.width - 150, 15, { width: 70 });

    doc.moveDown(4);

    // Info Box
    doc.fillColor('#000000').fontSize(16).font('Helvetica-Bold').text('INFORMASI PERJALANAN', 50);
    doc.moveDown(0.5);
    
    // Line separator
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#e2e8f0');
    doc.moveDown(1);

    doc.fontSize(12).font('Helvetica');
    const startY = doc.y;
    
    doc.font('Helvetica-Bold').text('Kode Booking:', 50, startY);
    doc.font('Helvetica').text(data.kodeBooking, 150, startY);

    doc.font('Helvetica-Bold').text('Status Tiket:', 50, startY + 20);
    doc.fillColor(data.status === 'PAID' ? '#10b981' : '#f59e0b').text(data.status, 150, startY + 20);
    doc.fillColor('#000000');

    doc.font('Helvetica-Bold').text('Kereta:', 50, startY + 40);
    doc.font('Helvetica').text(data.jadwal.kereta.nama, 150, startY + 40);

    doc.font('Helvetica-Bold').text('Rute:', 50, startY + 60);
    doc.font('Helvetica').text(`${data.jadwal.asal} - ${data.jadwal.tujuan}`, 150, startY + 60);

    doc.font('Helvetica-Bold').text('Berangkat:', 50, startY + 80);
    doc.font('Helvetica').text(new Date(data.jadwal.tanggalBerangkat).toLocaleString('id-ID'), 150, startY + 80);

    doc.moveDown(2);

    // Passengers
    doc.fontSize(16).font('Helvetica-Bold').text('DAFTAR PENUMPANG', 50, doc.y + 40);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#e2e8f0');
    doc.moveDown(1);

    data.detail.forEach((p, idx) => {
      doc.rect(50, doc.y, doc.page.width - 100, 30).fill(idx % 2 === 0 ? '#f8fafc' : '#ffffff');
      doc.fillColor('#000000');
      doc.font('Helvetica-Bold').fontSize(12).text(p.namaPenumpang, 60, doc.y + 10, { continued: true });
      doc.font('Helvetica').text(`    |    Kursi: ${p.kursi?.label || '-'}`);
      doc.moveDown(1);
    });

    doc.moveDown(2);

    // Total
    doc.rect(50, doc.y, doc.page.width - 100, 40).fill('#08152d');
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('TOTAL PEMBAYARAN', 70, doc.y + 12, { continued: true });
    doc.fillColor('#00ffff').text(`Rp ${data.total.toNumber().toLocaleString('id-ID')}`, { align: 'right' });
    
    // Footer
    doc.fillColor('#64748b').fontSize(10).font('Helvetica');
    doc.text('Terima kasih telah menggunakan layanan RailTicket.', 50, doc.page.height - 70, { align: 'center' });
    doc.text('Harap tunjukkan E-Ticket ini (digital atau cetak) kepada petugas saat boarding.', { align: 'center' });

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