import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Get,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  create(@Body() createRatingDto: CreateRatingDto) {
    return this.ratingService.create(createRatingDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRatingDto: UpdateRatingDto) {
    return this.ratingService.update(id, updateRatingDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.ratingService.delete(id);
  }

  @Get('product/:produkId')
  getByProduct(@Param('produkId') produkId: string) {
    return this.ratingService.getByProduct(produkId);
  }

  @Get('user/:userId')
  getByUser(@Param('userId') userId: string) {
    return this.ratingService.getByUser(userId);
  }

  @Get('product/:produkId/average')
  async calculateAvgRating(@Param('produkId') produkId: string) {
    const avg = await this.ratingService.calculateAvgRating(produkId);
    return { averageRating: avg };
  }
}
