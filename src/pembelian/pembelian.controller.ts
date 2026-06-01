import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'

import express from 'express'

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guard/roles.guard'
import { Roles } from 'src/auth/decorators/roles.decorator'

import { PembelianService } from './pembelian.service'
import { CreatePembelianDto } from './dto/create-pembelian.dto'

@Controller(
  'pembelian',
)
export class PembelianController {
  constructor(
    private service: PembelianService,
  ) {}

  @Post()
  @UseGuards(
    JwtAuthGuard,
  )
  create(
    @Req() req: any,
    @Body()
    dto: CreatePembelianDto,
  ) {
    return this.service.create(
      req.user.sub,
      dto,
    )
  }

  @Get('mine')
  @UseGuards(
    JwtAuthGuard,
  )
  mine(
    @Req() req: any,
  ) {
    return this.service.findMine(
      req.user.sub,
    )
  }

  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
  )
  findOne(
    @Req() req: any,
    @Param('id')
    id: string,
  ) {
    return this.service.findOneMine(
      req.user.sub,
      id,
    )
  }

  @Patch(':id/confirm')
  @UseGuards(
    JwtAuthGuard,
  )
  confirm(
    @Req() req: any,
    @Param('id')
    id: string,
  ) {
    return this.service.confirmPayment(
      req.user.sub,
      id,
    )
  }

  @Patch(':id/cancel')
  @UseGuards(
    JwtAuthGuard,
  )
  cancel(
    @Req() req: any,
    @Param('id')
    id: string,
  ) {
    return this.service.cancelPembelian(
      req.user.sub,
      id,
    )
  }

  @Get(':id/tiket')
  @UseGuards(
    JwtAuthGuard,
  )
  tiket(
    @Req() req: any,
    @Param('id')
    id: string,

    @Res()
    res: express.Response,
  ) {
    return this.service.generateTiketPdf(
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
  @Roles(
    'ADMIN',
  )
  all() {
    return this.service.findAll()
  }
}