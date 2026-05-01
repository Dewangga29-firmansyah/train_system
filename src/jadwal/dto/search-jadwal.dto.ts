import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class SearchJadwalDto {
  @IsString()
  @IsNotEmpty()
  asal!: string;

  @IsString()
  @IsNotEmpty()
  tujuan!: string;

  @IsDateString()
  start!: string;

  @IsDateString()
  end!: string;
}
