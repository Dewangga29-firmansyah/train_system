import { IsNotEmpty, IsString } from 'class-validator';

export class PembelianIdDto {
  @IsString()
  @IsNotEmpty()
  pembelianId!: string;
}