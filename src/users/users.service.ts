import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(
    data: {
      username: string;
      password: string;
      role: 'ADMIN' | 'PELANGGAN';
    },
  ) {
    const username =
      data.username.trim();

    const exist =
      await this.prisma.user.findUnique({
        where: {
          username,
        },
      });

    if (exist) {
      throw new BadRequestException(
        'Username sudah digunakan',
      );
    }

    const hashed =
      await bcrypt.hash(
        data.password,
        10,
      );

    return this.prisma.user.create({
      data: {
        username,

        password: hashed,

        role: data.role,

        ...(data.role === 'ADMIN'
          ? {
              petugas: {
                create: {
                  nama: username,
                  alamat: '-',
                  telp: '-',
                },
              },
            }
          : {
              pelanggan: {
  create: {
    nik: `AUTO-${Date.now()}`,
    nama: username,
    alamat: '-',
    telp: '-',
  },
},
            }),
      },

      include: {
        pelanggan: true,
        petugas: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        pelanggan: true,
        petugas: true,
      },
    });
  }

  async findOne(
    id: string,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id,
        },

        include: {
          pelanggan: true,
          petugas: true,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User tidak ditemukan',
      );
    }

    return user;
  }

  async findByUsername(
    username: string,
  ) {
    return this.prisma.user.findUnique({
      where: {
        username,
      },

      include: {
        pelanggan: true,
        petugas: true,
      },
    });
  }

  async update(
    id: string,
    data: {
      username?: string;
      password?: string;
    },
  ) {
    await this.findOne(id);

    if (data.password) {
      data.password =
        await bcrypt.hash(
          data.password,
          10,
        );
    }

    return this.prisma.user.update({
      where: {
        id,
      },

      data,
    });
  }

  async remove(
    id: string,
  ) {
    await this.findOne(id);

    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async bootstrapAdmin(
    data: {
      username: string;
      password: string;
      nama: string;
      alamat: string;
      telp: string;
    },
  ) {
    const admin =
      await this.prisma.user.findFirst({
        where: {
          role: 'ADMIN',
        },
      });

    if (admin) {
      throw new BadRequestException(
        'Admin sudah ada',
      );
    }

    const hashed =
      await bcrypt.hash(
        data.password,
        10,
      );

    return this.prisma.user.create({
      data: {
        username: data.username,

        password: hashed,

        role: 'ADMIN',

        petugas: {
          create: {
            nama: data.nama,
            alamat: data.alamat,
            telp: data.telp,
          },
        },
      },

      include: {
        petugas: true,
      },
    });
  }
}