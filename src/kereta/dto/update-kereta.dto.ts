import { PartialType } from '@nestjs/mapped-types';
import { CreateKeretaDto } from './create-kereta.dto';

export class UpdateKeretaDto extends PartialType(CreateKeretaDto) {}
