import { IsUUID, IsInt, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  produkId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}
