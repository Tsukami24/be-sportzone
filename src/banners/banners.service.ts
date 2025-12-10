import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
  ) {}

  async checkExpiredBanners(): Promise<void> {
    const now = new Date();
    await this.bannerRepo
      .createQueryBuilder()
      .update(Banner)
      .set({ is_active: false })
      .where('end_date < :now', { now })
      .andWhere('is_active = :active', { active: true })
      .execute();
  }

  async create(dto: CreateBannerDto): Promise<Banner> {
    const banner = this.bannerRepo.create({
      title: dto.title?.trim() || null,
      image_url: dto.image_url?.trim?.() || null,
      link_type: dto.link_type,
      link_value: dto.link_value.trim(),
      is_active: dto.is_active ?? true,
      start_date: dto.start_date ? new Date(dto.start_date) : null,
      end_date: dto.end_date ? new Date(dto.end_date) : null,
    });

    if (
      banner.start_date &&
      banner.end_date &&
      banner.start_date >= banner.end_date
    ) {
      throw new BadRequestException('end_date must be after start_date');
    }

    try {
      return await this.bannerRepo.save(banner);
    } catch {
      throw new BadRequestException('Failed to create banner');
    }
  }

  async findActive(): Promise<Banner[]> {
    const now = new Date();

    const banners = await this.bannerRepo.find({
      where: { is_active: true },
      order: { created_at: 'DESC' },
    });

    return banners.filter((banner) => {
      const notStarted = banner.start_date && new Date(banner.start_date) > now;
      const expired = banner.end_date && new Date(banner.end_date) < now;

      return !notStarted && !expired;
    });
  }

  async findAll(): Promise<Banner[]> {
    return this.bannerRepo.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string): Promise<Banner> {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner tidak ditemukan');
    return banner;
  }

  async update(id: string, dto: UpdateBannerDto): Promise<Banner> {
    const banner = await this.findOne(id);

    if (dto.title !== undefined) {
      banner.title = dto.title?.trim() || null;
    }
    if (dto.image_url !== undefined) {
      banner.image_url = dto.image_url?.trim?.() || null;
    }
    if (dto.link_type !== undefined) {
      banner.link_type = dto.link_type;
    }
    if (dto.link_value !== undefined) {
      banner.link_value = dto.link_value.trim();
    }
    if (dto.is_active !== undefined) {
      banner.is_active = dto.is_active;
    }
    if (dto.start_date !== undefined) {
      banner.start_date = dto.start_date ? new Date(dto.start_date) : null;
    }
    if (dto.end_date !== undefined) {
      banner.end_date = dto.end_date ? new Date(dto.end_date) : null;
    }

    if (
      banner.start_date &&
      banner.end_date &&
      banner.start_date >= banner.end_date
    ) {
      throw new BadRequestException('end_date must be after start_date');
    }

    try {
      return await this.bannerRepo.save(banner);
    } catch {
      throw new BadRequestException('Failed to update banner');
    }
  }

  async remove(id: string): Promise<void> {
    const banner = await this.findOne(id);
    await this.bannerRepo.remove(banner);
  }
}
