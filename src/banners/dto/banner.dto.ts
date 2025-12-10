import { Banner, LinkType } from '../entities/banner.entity';

export class BannerDto {
  id: string;
  title: string | null;
  image_url: string | null;
  link_type: LinkType;
  link_value: string;
  is_active: boolean;
  start_date: Date | null;
  end_date: Date | null;
  created_at: Date;
  updated_at: Date;

  constructor(banner: Banner) {
    this.id = banner.id;
    this.title = banner.title ?? null;
    this.image_url = banner.image_url ?? null;
    this.link_type = banner.link_type;
    this.link_value = banner.link_value;
    this.is_active = banner.is_active;
    this.start_date = banner.start_date ?? null;
    this.end_date = banner.end_date ?? null;
    this.created_at = banner.created_at;
    this.updated_at = banner.updated_at;
  }
}
