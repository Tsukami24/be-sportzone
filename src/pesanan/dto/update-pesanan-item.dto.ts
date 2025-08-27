import { PartialType } from '@nestjs/mapped-types';
import { CreatePesananItemDto } from './create-pesanan-item.dto';

export class UpdatePesananItemDto extends PartialType(CreatePesananItemDto) {}