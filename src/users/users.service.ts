import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    username: string;
    password: string;
    role: 'ADMIN' | 'PELANGGAN';
  }) {
    const exist = await this.prisma.user.findUnique({
      where: { username: data.username },
    });

    if (exist) throw new BadRequestException('Username already exists');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        password: hashedPassword,
        role: data.role,
      },
    });

    if (data.role === 'ADMIN') {
      await this.prisma.petugas.create({
        data: {
          nama: data.username,
          alamat: '-',
          telp: '-',
          userId: user.id,
        },
      });
    }

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        pelanggan: true,
        petugas: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        pelanggan: true,
        petugas: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async update(
    id: string,
    data: {
      username?: string;
      password?: string;
    },
  ) {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    if (data.password) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async bootstrapAdmin(data: {
    username: string;
    password: string;
    nama: string;
    alamat: string;
    telp: string;
  }) {
    const adminExist = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (adminExist) {
      throw new BadRequestException('Admin sudah ada');
    }

    const username = data.username.trim();
    const password = data.password.trim();

    const exist = await this.prisma.user.findUnique({
      where: { username },
    });

    if (exist) {
      throw new BadRequestException('Username sudah digunakan');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashed = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        username,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
