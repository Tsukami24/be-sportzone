import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsBoolean,
  IsDateString,
  Length,
  IsUrl,
} from 'class-validator';
import { LinkType } from '../entities/banner.entity';

export class CreateBannerDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  image_url?: string;

  @IsEnum(LinkType, {
    message: 'link_type must be product, brand, or category',
  })
  @IsNotEmpty()
  link_type: LinkType;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  link_value: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}
