import { IsString, IsNotEmpty } from 'class-validator';

export class EtaRequestDto {
  @IsString()
  @IsNotEmpty()
  kota: string;

  @IsString()
  @IsNotEmpty()
  provinsi: string;
}
