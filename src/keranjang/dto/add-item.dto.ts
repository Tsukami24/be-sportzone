import { IsUUID, IsInt, Min, IsOptional } from 'class-validator';

export class AddItemDto {
	@IsUUID()
	produk_id: string;

	@IsOptional()
	@IsUUID()
	produk_varian_id?: string;

	@IsInt()
	@Min(1)
	kuantitas: number;
}
