import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  Patch,
  Res,
<<<<<<< HEAD
} from '@nestjs/common'

import express from 'express'

import { ApiBearerAuth } from '@nestjs/swagger'
import { ApiTags } from '@nestjs/swagger'

import { PembelianService } from './pembelian.service'

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'

import { RolesGuard } from 'src/auth/guard/roles.guard'

import { Roles } from 'src/auth/decorators/roles.decorator'

import { CreatePembelianDto } from './dto/create-pembelian.dto'
=======
} from '@nestjs/common';
import { PembelianService } from './pembelian.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreatePembelianDto } from './dto/create-pembelian.dto';
import express from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
>>>>>>> 5c8674b (sync)

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@ApiTags('Pembelian')
@Controller('pembelian')
export class PembelianController {
  constructor(
    private readonly pembelianService: PembelianService,
  ) {}

  @Post()
  create(
    @Req() req: any,
    @Body() dto: CreatePembelianDto,
  ) {
    return this.pembelianService.create(
      req.user.sub,
      dto,
    );
  }

  @Get('mine')
  mine(
    @Req() req: any,
  ) {
    return this.pembelianService.findMine(
      req.user.sub,
    );
  }

  @Get('mine/:id')
  detail(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.pembelianService.findOneMine(
      req.user.sub,
      id,
    );
  }

  @Patch(':id/confirm')
  confirm(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.pembelianService.confirmPayment(
      req.user.sub,
      id,
    );
  }

  @Get(':id/tiket')
  tiket(
    @Req() req: any,
    @Param('id') id: string,
    @Res() res: express.Response,
  ) {
    return this.pembelianService.generateTiketPdf(
      req.user.sub,
      id,
      res,
    );
  }

  @Get()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  findAll() {
    return this.pembelianService.findAll();
  }
}