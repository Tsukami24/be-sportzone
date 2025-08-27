import { PartialType } from '@nestjs/mapped-types';
import { CreateProdukVarianDto } from './create-produk-varian.dto';

export class UpdateProdukVarianDto extends PartialType(CreateProdukVarianDto) {}