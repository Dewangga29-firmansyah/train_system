import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PelangganService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    nik: string;
    nama: string;
    alamat: string;
    telp: string;
    userId: string;
  }) {
    return this.prisma.pelanggan.create({
      data,
    });
  }

  findAll() {
    return this.prisma.pelanggan.findMany({
      include: {
        user: true,
      },
    });
  }

  async findOne(id: string) {
    const pelanggan = await this.prisma.pelanggan.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!pelanggan) {
      throw new NotFoundException('Pelanggan tidak ditemukan');
    }

    return pelanggan;
  }

  async findByUserId(userId: string) {
    const pelanggan = await this.prisma.pelanggan.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!pelanggan) {
      throw new NotFoundException('Pelanggan tidak ditemukan');
    }

    return pelanggan;
  }

  async updateByUserId(
    userId: string,
    data: {
      nama?: string;
      alamat?: string;
      telp?: string;
    },
  ) {
    const pelanggan = await this.prisma.pelanggan.findUnique({
      where: { userId },
    });

    if (!pelanggan) {
      throw new NotFoundException('Pelanggan tidak ditemukan');
    }

    return this.prisma.pelanggan.update({
      where: { id: pelanggan.id },
      data,
    });
  }

  async update(
    id: string,
    data: {
      nama?: string;
      alamat?: string;
      telp?: string;
    },
  ) {
    await this.findOne(id);

    return this.prisma.pelanggan.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.pelanggan.delete({
      where: { id },
    });
  }
}
