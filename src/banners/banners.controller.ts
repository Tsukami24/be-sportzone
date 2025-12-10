import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerDto } from './dto/banner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  async findActive(): Promise<BannerDto[]> {
    const banners = await this.bannersService.findActive();
    return banners.map((b) => new BannerDto(b));
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(): Promise<BannerDto[]> {
    const banners = await this.bannersService.findAll();
    return banners.map((b) => new BannerDto(b));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BannerDto> {
    const banner = await this.bannersService.findOne(id);
    return new BannerDto(banner);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/banner',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @Body() dto: CreateBannerDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BannerDto> {
    try {
      if (file) {
        dto.image_url = `${process.env.BASE_URL}/uploads/banner/${file.filename}`;
      }
      const banner = await this.bannersService.create(dto);
      return new BannerDto(banner);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create banner';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/banner',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BannerDto> {
    try {
      if (file) {
        dto.image_url = `${process.env.BASE_URL}/uploads/banner/${file.filename}`;
      }
      const banner = await this.bannersService.update(id, dto);
      return new BannerDto(banner);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update banner';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.bannersService.remove(id);
  }
}
