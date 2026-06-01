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
} from '@nestjs/common'

import express from 'express'

import { PembelianService } from './pembelian.service'

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'

import { RolesGuard } from 'src/auth/guard/roles.guard'

import { Roles } from 'src/auth/decorators/roles.decorator'

import { CreatePembelianDto } from './dto/create-pembelian.dto'

@Controller('pembelian')
export class PembelianController {
  constructor(
    private readonly pembelianService: PembelianService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: any,
    @Body() dto: CreatePembelianDto,
  ) {
    return this.pembelianService.create(
      req.user.sub,
      dto,
    )
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  mine(
    @Req() req: any,
  ) {
    return this.pembelianService.findMine(
      req.user.sub,
    )
  }

  @Get('mine/:id')
  @UseGuards(JwtAuthGuard)
  detail(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.pembelianService.findOneMine(
      req.user.sub,
      id,
    )
  }

  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard)
  confirm(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.pembelianService.confirmPayment(
      req.user.sub,
      id,
    )
  }

  @Get(':id/tiket')
  @UseGuards(JwtAuthGuard)
  tiket(
    @Req() req: any,
    @Param('id') id: string,
    @Res() res: express.Response,
  ) {
    return this.pembelianService.generateTiketPdf(
      req.user.sub,
      id,
      res,
    )
  }

  @Get()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  findAll() {
    return this.pembelianService.findAll()
  }
}