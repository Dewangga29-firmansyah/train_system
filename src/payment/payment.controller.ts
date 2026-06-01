import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Payment')

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get(':pembelianId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PELANGGAN')
  getByPembelian(@Param('pembelianId') pembelianId: string) {
    return this.paymentService.getByPembelian(pembelianId);
  }

  @Post(':pembelianId/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PELANGGAN')
  confirm(@Param('pembelianId') pembelianId: string) {
    return this.paymentService.confirm(pembelianId);
  }
}
