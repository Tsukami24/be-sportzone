import { PartialType } from '@nestjs/mapped-types';
import { CreatePesananDto } from './create-pesanan.dto';

export class UpdatePesananDto extends PartialType(CreatePesananDto) {}
