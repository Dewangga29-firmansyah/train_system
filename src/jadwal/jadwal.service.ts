import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJadwalDto } from './dto/create-jadwal.dto';
import { UpdateJadwalDto } from './dto/update-jadwal.dto';
import { SearchJadwalDto } from './dto/search-jadwal.dto';

@Injectable()
export class JadwalService {
  constructor(private prisma: PrismaService) {}

  async createJadwal(dto: CreateJadwalDto) {
    return this.prisma.jadwal.create({
      data: {
        ...dto,
        tanggalBerangkat: new Date(dto.tanggalBerangkat),
        tanggalTiba: new Date(dto.tanggalTiba),
      },
    });
  }

  async updateJadwal(id: string, dto: UpdateJadwalDto) {
    return this.prisma.jadwal.update({
      where: { id },
      data: {
        ...dto,
        tanggalBerangkat: dto.tanggalBerangkat
          ? new Date(dto.tanggalBerangkat)
          : undefined,
        tanggalTiba: dto.tanggalTiba ? new Date(dto.tanggalTiba) : undefined,
      },
    });
  }

  async searchJadwal(dto: SearchJadwalDto) {
    return this.prisma.jadwal.findMany({
      where: {
        asal: {
          contains: dto.asal,
        },
        tujuan: {
          contains: dto.tujuan,
        },
        tanggalBerangkat: {
          gte: new Date(dto.start),
          lte: new Date(dto.end),
        },
      },
      include: {
        kereta: {
          include: {
            gerbong: true,
          },
        },
      },
      orderBy: {
        tanggalBerangkat: 'asc',
      },
    });
  }

  async findAllJadwal() {
    return this.prisma.jadwal.findMany({
      include: {
        kereta: true,
      },
    });
  }

  async findOneJadwal(id: string) {
  const data =
    await this.prisma.jadwal.findUnique({
      where: {
        id,
      },

      include: {
        kereta: {
          include: {
            gerbong: {
              include: {
                kursi: {
                  orderBy: [
                    {
                      row: 'asc',
                    },
                    {
                      seat: 'asc',
                    },
                  ],
                },
              },
            },
          },
        },
      },
    })

  if (!data) {
    throw new NotFoundException(
      'Jadwal tidak ditemukan'
    )
  }

  return data
}

  async removeJadwal(id: string) {
    return this.prisma.jadwal.delete({
      where: { id },
    });
  }
}
