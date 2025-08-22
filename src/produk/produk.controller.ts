import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ProdukService } from './produk.service';
import { CreateProdukDto } from './dto/create-produk.dto';
import { UpdateProdukDto } from './dto/update-produk.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProdukDto } from './dto/produk.dto';

@Controller('produk')
export class ProdukController {
  constructor(private readonly produkService: ProdukService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('petugas')
  async create(@Body() createProdukDto: CreateProdukDto): Promise<ProdukDto> {
    try {
      const produk = await this.produkService.create(createProdukDto);
      return new ProdukDto(produk);
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

  @Get('kategori/:kategoriId')
  async findByKategori(@Param('kategoriId') kategoriId: string): Promise<ProdukDto[]> {
    try {
      const produks = await this.produkService.findByKategori(kategoriId);
      return produks.map((produk) => new ProdukDto(produk));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('subkategori/:subkategoriId')
  async findBySubkategori(@Param('subkategoriId') subkategoriId: string): Promise<ProdukDto[]> {
    try {
      const produks = await this.produkService.findBySubkategori(subkategoriId);
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('petugas')
  async update(@Param('id') id: string, @Body() updateProdukDto: UpdateProdukDto): Promise<ProdukDto> {
    try {
      const produk = await this.produkService.update(id, updateProdukDto);
      return new ProdukDto(produk);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
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
}
