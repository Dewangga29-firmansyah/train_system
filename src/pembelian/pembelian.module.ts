import { Module } from '@nestjs/common';
import { PembelianService } from './pembelian.service';
import { PembelianController } from './pembelian.controller';

@Module({
  providers: [PembelianService],
  controllers: [PembelianController],
  exports: [PembelianService],
})
export class PembelianModule {}
