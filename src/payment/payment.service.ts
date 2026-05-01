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
      const pembelian = await tx.pembelian.findUnique({
        where: { id: pembelianId },
      });

      if (!pembelian) {
        throw new NotFoundException('Pembelian tidak ditemukan');
      }

      if (pembelian.status === 'PAID') {
        throw new BadRequestException('Sudah dibayar');
      }

      const payment = await tx.payment.update({
        where: { pembelianId },
        data: {
          paidAt: new Date(),
        },
      });

      await tx.pembelian.update({
        where: { id: pembelianId },
        data: {
          status: 'PAID',
        },
      });

      return payment;
    });
  }
}
