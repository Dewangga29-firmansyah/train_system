import { IsEnum } from 'class-validator';
import { Kelas } from '@prisma/client';

export class GenerateKursiDto {
  @IsEnum(Kelas)
  kelas!: Kelas;
}
