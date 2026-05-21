import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { PelangganService } from 'src/pelanggan/pelanggan.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly pelangganService: PelangganService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByUsername(dto.username);

    if (existing) {
      throw new ConflictException('Username sudah digunakan');
    }

    const user = await this.usersService.create({
      username: dto.username,
      password: dto.password,
      role: (dto.role === 'ADMIN' ? 'ADMIN' : 'PELANGGAN'),
    });

    await this.pelangganService.create({
      nik: dto.nik,
      nama: dto.nama,
      alamat: dto.alamat,
      telp: dto.telp,
      userId: user.id,
    });

    return {
      message: 'Register berhasil',
      user,
    };
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Password salah');
    }

    return user;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      message: 'Login berhasil',
      access_token: this.jwtService.sign(payload),
    };
  }
}
