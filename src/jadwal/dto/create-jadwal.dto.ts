import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateJadwalDto {
  @IsString()
  @IsNotEmpty()
  asal!: string;

  @IsString()
  @IsNotEmpty()
  tujuan!: string;

  @IsDateString()
  tanggalBerangkat!: string;

  @IsDateString()
  tanggalTiba!: string;

  @IsNumber()
  harga!: number;

  @IsString()
  @IsNotEmpty()
  keretaId!: string;
}
