import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'

import { Response } from 'express'

import { PembelianService } from './pembelian.service'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'

@Controller('pembelian')
@UseGuards(JwtAuthGuard)
export class PembelianController {
  constructor(
    private readonly service: PembelianService,
  ) {}

  @Post()
  create(
    @Req() req,
    @Body() dto,
  ) {
    return this.service.create(
      req.user.sub,
      dto,
    )
  }

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.service.findOne(
      id,
    )
  }

  @Post(':id/confirm')
  confirm(
    @Param('id')
    id: string,
  ) {
    return this.service.confirmPayment(
      id,
    )
  }

  @Get(':id/pdf')
  async pdf(
    @Param('id')
    id: string,

    @Res()
    res: Response,
  ) {
    return this.service.generateTiketPdf(
      id,
      res,
    )
  }
}
