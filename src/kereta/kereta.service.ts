import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'

import { PrismaService } from 'src/prisma/prisma.service'

import {
  Prisma,
} from '@prisma/client'

import { CreateKeretaDto } from './dto/create-kereta.dto'
import { UpdateKeretaDto } from './dto/update-kereta.dto'
import { CreateGerbongDto } from './dto/create-gerbong.dto'
import { CreateKursiDto } from './dto/create-kursi.dto'

@Injectable()
export class KeretaService {
  constructor(
    private prisma: PrismaService
  ) {}

  async createKereta(
    dto: CreateKeretaDto
  ) {
    return this.prisma.kereta.create({
      data: dto,
    })
  }

  async findAllKereta() {
    return this.prisma.kereta.findMany({
      include: {
        gerbong: {
          include: {
            kursi: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async findOneKereta(
    id: string
  ) {
    const kereta =
      await this.prisma.kereta.findUnique(
        {
          where: {
            id,
          },

          include: {
            gerbong: {
              include: {
                kursi: true,
              },
            },
          },
        }
      )

    if (!kereta) {
      throw new NotFoundException(
        'Kereta tidak ditemukan'
      )
    }

    return kereta
  }

  async updateKereta(
    id: string,
    dto: UpdateKeretaDto
  ) {
    await this.findOneKereta(
      id
    )

    return this.prisma.kereta.update(
      {
        where: {
          id,
        },

        data: dto,
      }
    )
  }

  async removeKereta(
    id: string
  ) {
    await this.findOneKereta(
      id
    )

    return this.prisma.kereta.delete(
      {
        where: {
          id,
        },
      }
    )
  }

  async createGerbong(
    dto: CreateGerbongDto
  ) {
    const train =
      await this.prisma.kereta.findUnique(
        {
          where: {
            id:
              dto.keretaId,
          },
        }
      )

    if (!train) {
      throw new NotFoundException(
        'Kereta tidak ditemukan'
      )
    }

    return this.prisma.gerbong.create(
      {
        data: dto,
      }
    )
  }

  async createKursi(
    dto: CreateKursiDto
  ) {
    const exist =
      await this.prisma.gerbong.findUnique(
        {
          where: {
            id:
              dto.gerbongId,
          },
        }
      )

    if (!exist) {
      throw new NotFoundException(
        'Gerbong tidak ditemukan'
      )
    }

    return this.prisma.kursi.create(
      {
        data: dto,
      }
    )
  }

  async findKursiByGerbong(
    gerbongId: string
  ) {
    return this.prisma.kursi.findMany(
      {
        where: {
          gerbongId,
        },

        orderBy: [
          {
            row:
              'asc',
          },

          {
            seat:
              'asc',
          },
        ],
      }
    )
  }

  async generateKursi(
    gerbongId: string
  ) {
    const gerbong =
      await this.prisma.gerbong.findUnique(
        {
          where: {
            id:
              gerbongId,
          },
        }
      )

    if (!gerbong) {
      throw new NotFoundException(
        'Gerbong tidak ditemukan'
      )
    }

    const existing =
      await this.prisma.kursi.count(
        {
          where: {
            gerbongId,
          },
        }
      )

    if (existing > 0) {
      return {
        message:
          'Kursi sudah pernah digenerate',

        total:
          existing,
      }
    }

    const seats =
      gerbong.kelas ===
      'EKSEKUTIF'
        ? [
            'A',
            'B',
            'C',
            'D',
          ]
        : [
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
          ]

    const totalRow =
      gerbong.kelas ===
      'EKSEKUTIF'
        ? 10
        : 15

    const data: Prisma.KursiCreateManyInput[] =
      []

    for (
      let row = 1;
      row <= totalRow;
      row++
    ) {
      for (const seat of seats) {
        data.push({
          row,

          seat,

          label:
            `${row}${seat}`,

          gerbongId,
        })
      }
    }

    await this.prisma.kursi.createMany(
      {
        data,
      }
    )

    return {
      message:
        'Generate kursi berhasil',

      total:
        data.length,
    }
  }
}
