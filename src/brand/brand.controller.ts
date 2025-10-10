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
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandDto } from './dto/brand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

// Melihat Semua Brand
  @Get()
  async findAll(): Promise<BrandDto[]> {
    const list = await this.brandService.findAll();
    return list.map((b) => new BrandDto(b));
  }

  // Melihat Produk berdasarkan brand
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BrandDto> {
    const brand = await this.brandService.findOne(id);
    return new BrandDto(brand);
  }

  // Membuat data brand
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/brands',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @Body() dto: CreateBrandDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BrandDto> {
    try {
      if (file) {
        dto.logo = `${process.env.BASE_URL}/uploads/brands/${file.filename}`;
      }
      const brand = await this.brandService.create(dto);
      return new BrandDto(brand);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Mengupdate data brand 
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/brands',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BrandDto> {
    try {
      if (file) {
        dto.logo = `${process.env.BASE_URL}/uploads/brands/${file.filename}`;
      }
      const brand = await this.brandService.update(id, dto);
      return new BrandDto(brand);
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Menghapus data brand
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.brandService.remove(id);
  }
}


