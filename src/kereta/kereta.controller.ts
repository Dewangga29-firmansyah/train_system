import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { KeretaService } from './kereta.service';
import { CreateKeretaDto } from './dto/create-kereta.dto';
import { UpdateKeretaDto } from './dto/update-kereta.dto';
import { CreateGerbongDto } from './dto/create-gerbong.dto';
import { CreateKursiDto } from './dto/create-kursi.dto';

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('kereta')
export class KeretaController {
  constructor(private readonly keretaService: KeretaService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateKeretaDto) {
    return this.keretaService.createKereta(dto);
  }

  @Get()
  findAll() {
    return this.keretaService.findAllKereta();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.keretaService.findOneKereta(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateKeretaDto) {
    return this.keretaService.updateKereta(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.keretaService.removeKereta(id);
  }

  @Post('gerbong')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createGerbong(@Body() dto: CreateGerbongDto) {
    return this.keretaService.createGerbong(dto);
  }

  @Post('kursi')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createKursi(@Body() dto: CreateKursiDto) {
    return this.keretaService.createKursi(dto);
  }

  @Get('kursi/:gerbongId')
  findKursi(@Param('gerbongId') gerbongId: string) {
    return this.keretaService.findKursiByGerbong(gerbongId);
  }

  @Post('generate-kursi/:gerbongId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  generateKursi(@Param('gerbongId') gerbongId: string) {
    return this.keretaService.generateKursi(gerbongId);
  }
}
