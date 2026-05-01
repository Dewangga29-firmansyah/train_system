import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateKursiDto {
  @IsNumber()
  row!: number;

  @IsString()
  @IsNotEmpty()
  seat!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsNotEmpty()
  gerbongId!: string;
}
