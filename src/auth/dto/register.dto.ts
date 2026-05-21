import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  nik!: string;

  @IsString()
  @IsNotEmpty()
  nama!: string;

  @IsString()
  @IsNotEmpty()
  alamat!: string;

  @IsString()
  @IsNotEmpty()
  telp!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  role?: string;
}
