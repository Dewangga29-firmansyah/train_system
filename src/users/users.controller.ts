import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common'

import { UsersService } from './users.service'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async create(
    @Body()
    body: {
      username: string;
      password: string;
      role: 'ADMIN' | 'PELANGGAN';
    },
  ) {
    return this.usersService.create(body);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id')
    id: string,
  ) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id')
    id: string,

    @Body()
    body: {
      username?: string;
      password?: string;
    },
  ) {
    return this.usersService.update(id, body);
  }

  @Delete(':id')
  async remove(
    @Param('id')
    id: string,
  ) {
    return this.usersService.remove(id);
  }

  @Post('bootstrap-admin')
  async bootstrapAdmin(
    @Body()
    body: {
      username: string;
      password: string;
      nama: string;
      alamat: string;
      telp: string;
    },
  ) {
    return this.usersService.bootstrapAdmin(body);
  }
}