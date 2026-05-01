import { Module } from '@nestjs/common';
import { PelangganService } from './pelanggan.service';
import { PelangganController } from './pelanggan.controller';

@Module({
  providers: [PelangganService],
  controllers: [PelangganController],
  exports: [PelangganService],
})
export class PelangganModule {}
