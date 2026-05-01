import { Module } from '@nestjs/common';
import { KeretaController } from './kereta.controller';
import { KeretaService } from './kereta.service';

@Module({
  controllers: [KeretaController],
  providers: [KeretaService],
  exports: [KeretaService],
})
export class KeretaModule {}
