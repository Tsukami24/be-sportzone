import { PartialType } from '@nestjs/mapped-types';
import { CreateSubkategoriPeralatanDto } from './create-subkategori-peralatan.dto';

export class UpdateSubkategoriPeralatanDto extends PartialType(CreateSubkategoriPeralatanDto) {}
