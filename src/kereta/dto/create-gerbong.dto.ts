import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Kelas } from '@prisma/client';

export class CreateGerbongDto {
  @IsString()
  @IsNotEmpty()
  nama!: string;

  @IsNumber()
  kuota!: number;

  @IsEnum(Kelas)
  kelas!: Kelas;

  @IsString()
  @IsNotEmpty()
  keretaId!: string;
}
