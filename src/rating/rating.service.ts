import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { User } from 'src/users/entities/user.entity/user.entity';
import { Produk } from 'src/produk/entities/produk.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
  ) {}

  async create(createRatingDto: CreateRatingDto) {
    const rating = this.ratingRepo.create({
      rating: createRatingDto.rating,
      user: { id: createRatingDto.userId } as User,
      produk: { id: createRatingDto.produkId } as Produk,
    });
    return this.ratingRepo.save(rating);
  }

  async update(id: string, updateRatingDto: UpdateRatingDto) {
    const rating = await this.ratingRepo.findOne({ where: { id } });
    if (!rating) throw new NotFoundException('Rating not found');

    if (updateRatingDto.rating !== undefined) {
      rating.rating = updateRatingDto.rating;
    }

    return this.ratingRepo.save(rating);
  }

  async delete(id: string) {
    const rating = await this.ratingRepo.findOne({ where: { id } });
    if (!rating) throw new NotFoundException('Rating not found');
    return this.ratingRepo.remove(rating);
  }

  async getByProduct(produkId: string) {
    return this.ratingRepo.find({
      where: { produk: { id: produkId } },
      relations: ['user'],
    });
  }

  async getByUser(userId: string) {
    return this.ratingRepo.find({
      where: { user: { id: userId } },
      relations: ['produk'],
    });
  }

  async calculateAvgRating(produkId: string): Promise<number> {
    const ratings = await this.ratingRepo.find({
      where: { produk: { id: produkId } },
    });
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratings.length;
  }
}
