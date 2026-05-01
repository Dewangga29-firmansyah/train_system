import { IsNotEmpty, IsString } from 'class-validator';

export class CreateKeretaDto {
  @IsString()
  @IsNotEmpty()
  nama!: string;
}
