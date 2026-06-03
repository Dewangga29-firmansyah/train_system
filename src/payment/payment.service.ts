import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async getByPembelian(pembelianId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { pembelianId },
      include: {
        pembelian: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment tidak ditemukan');
    }

    return payment;
  }

  async confirm(pembelianId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. cek pembelian
      const pembelian = await tx.pembelian.findUnique({
        where: { id: pembelianId },
      });

      if (!pembelian) {
        throw new NotFoundException('Pembelian tidak ditemukan');
      }

      if (pembelian.status === 'PAID') {
        throw new BadRequestException('Pembelian sudah dibayar');
      }

      // 2. cek payment
      const payment = await tx.payment.findUnique({
        where: { pembelianId },
      });

      if (!payment) {
        throw new NotFoundException('Data payment tidak ditemukan');
      }

      if (payment.paidAt) {
        throw new BadRequestException('Payment sudah dikonfirmasi');
      }

      // 3. update payment
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id }, // lebih aman pakai ID
        data: {
          paidAt: new Date(),
        },
      });

      // 4. update pembelian
      await tx.pembelian.update({
        where: { id: pembelianId },
        data: {
          status: 'PAID',
        },
      });

      return updatedPayment;
    });
  }
}