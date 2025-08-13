import { PartialType } from '@nestjs/mapped-types';
import { CreateKategoriOlahragaDto } from './create-kategori-olahraga.dto';

export class UpdateKategoriOlahragaDto extends PartialType(CreateKategoriOlahragaDto) {}