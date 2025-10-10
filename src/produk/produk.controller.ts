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
  UseInterceptors,
  UploadedFiles,
  
} from '@nestjs/common';
import { ProdukService } from './produk.service';
import { CreateProdukDto } from './dto/create-produk.dto';
import { UpdateProdukDto } from './dto/update-produk.dto';
import { CreateProdukVarianDto } from './dto/create-produk-varian.dto';
import { UpdateProdukVarianDto } from './dto/update-produk-varian.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProdukDto } from './dto/produk.dto';
import { ProdukVarianDto } from './dto/produk-varian.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';


@Controller('produk')
export class ProdukController {
  constructor(private readonly produkService: ProdukService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('petugas')
  @UseInterceptors(
    FilesInterceptor('gambar', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @Body() createProdukDto: CreateProdukDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ProdukDto> {
    if (files && files.length > 0) {
      createProdukDto.gambar = files.map(
        (file) => `${process.env.BASE_URL}/uploads/${file.filename}`,
      );
    }

    const produk = await this.produkService.create(createProdukDto);
    return new ProdukDto(await this.produkService.findOne(produk.id));
  }
  @Post(':produkId/varian')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('petugas')
  async createVarian(
    @Param('produkId') produkId: string,
    @Body() createVarianDto: CreateProdukVarianDto,
  ): Promise<ProdukVarianDto> {
    try {
      const varianDto = { ...createVarianDto, produk_id: produkId };
      const varian = await this.produkService.createVarian(varianDto);
      return new ProdukVarianDto(varian);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(): Promise<ProdukDto[]> {
    try {
      const produks = await this.produkService.findAll();
      return produks.map((produk) => new ProdukDto(produk));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('kategori/:id')
  async findByKategori(@Param('id') id: string): Promise<ProdukDto[]> {
    try {
      const produks = await this.produkService.findByKategori(id);
      return produks.map((produk) => new ProdukDto(produk));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('subkategori/:subkategoriId')
  async findBySubkategori(
    @Param('subkategoriId') subkategoriId: string,
  ): Promise<ProdukDto[]> {
    try {
      const produks = await this.produkService.findBySubkategori(subkategoriId);
      return produks.map((produk) => new ProdukDto(produk));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('brand/:brandId')
  async findByBrand(@Param('brandId') brandId: string): Promise<ProdukDto[]> {
    try {
      const produks = await this.produkService.findByBrand(brandId);
      return produks.map((produk) => new ProdukDto(produk));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProdukDto> {
    try {
      const produk = await this.produkService.findOne(id);
      return new ProdukDto(produk);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get(':produkId/varian')
  async findVarianByProduk(
    @Param('produkId') produkId: string,
  ): Promise<ProdukVarianDto[]> {
    try {
      const varians = await this.produkService.findVarianByProduk(produkId);
      return varians.map((varian) => new ProdukVarianDto(varian));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('varian/:varianId')
  async findVarianById(
    @Param('varianId') varianId: string,
  ): Promise<ProdukVarianDto> {
    try {
      const varian = await this.produkService.findVarianById(varianId);
      return new ProdukVarianDto(varian);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('petugas')
  @UseInterceptors(
    FilesInterceptor('gambar', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProdukDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ProdukDto> {

    if (files && files.length > 0) {

      const existingProduk = await this.produkService.findOne(id);
      const existingGambar = existingProduk.gambar || [];

      const validExistingGambar = existingGambar.filter(
        (gambar) =>
          typeof gambar === 'string' &&
          gambar &&
          (gambar.startsWith('http://') ||
            gambar.startsWith('https://') ||
            gambar.startsWith('/')),
      );

      const newGambarUrls = files.map(
        (file) => `${process.env.BASE_URL}/uploads/${file.filename}`,
      );

      dto.gambar = [...validExistingGambar, ...newGambarUrls];
    }

    const produk = await this.produkService.update(id, dto);
    return new ProdukDto(await this.produkService.findOne(produk.id));
  }

  @Patch('varian/:varianId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('petugas')
  async updateVarian(
    @Param('varianId') varianId: string,
    @Body() updateVarianDto: UpdateProdukVarianDto,
  ): Promise<ProdukVarianDto> {
    try {
      const varian = await this.produkService.updateVarian(
        varianId,
        updateVarianDto,
      );
      return new ProdukVarianDto(varian);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id/gambar/:gambarUrl')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('petugas')
  async deleteGambar(
    @Param('id') id: string,
    @Param('gambarUrl') gambarUrl: string,
  ): Promise<ProdukDto> {

    const decodedUrl = decodeURIComponent(gambarUrl);

    const fs = require('fs');
    const path = require('path');
    const filePath = path.join('./uploads', path.basename(decodedUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const produk = await this.produkService.findOne(id);
    produk.gambar = produk.gambar.filter(
      (g) => path.basename(g) !== path.basename(decodedUrl),
    );
    await this.produkService.update(id, { gambar: produk.gambar });

    return new ProdukDto(produk);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('petugas')
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.produkService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete('varian/:varianId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('petugas')
  async removeVarian(@Param('varianId') varianId: string): Promise<void> {
    try {
      await this.produkService.removeVarian(varianId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
