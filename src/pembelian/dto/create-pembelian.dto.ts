import {
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

import { Type } from 'class-transformer';

class PenumpangDto {
  @IsString()
  @IsNotEmpty()
  namaPenumpang!: string;

  @IsString()
  @IsNotEmpty()
  kursiId!: string;
}

export class CreatePembelianDto {
  @IsString()
  @IsNotEmpty()
  jadwalId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PenumpangDto)
  penumpang!: PenumpangDto[];
}