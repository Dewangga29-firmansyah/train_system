import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JadwalService } from './jadwal.service';
import { CreateJadwalDto } from './dto/create-jadwal.dto';
import { UpdateJadwalDto } from './dto/update-jadwal.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { SearchJadwalDto } from './dto/search-jadwal.dto';

@Controller('jadwal')
export class JadwalController {
  constructor(private jadwalService: JadwalService) {}

  @Get()
  findAllJadwal() {
    return this.jadwalService.findAllJadwal();
  }

  @Get('search')
  searchJadwal(@Query() dto: SearchJadwalDto) {
    return this.jadwalService.searchJadwal(dto);
  }

  @Get(':id')
  findOneJadwal(@Param('id') id: string) {
    return this.jadwalService.findOneJadwal(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  createJadwal(@Body() dto: CreateJadwalDto) {
    return this.jadwalService.createJadwal(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateJadwal(@Param('id') id: string, @Body() dto: UpdateJadwalDto) {
    return this.jadwalService.updateJadwal(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  removeJadwal(@Param('id') id: string) {
    return this.jadwalService.removeJadwal(id);
  }
}
