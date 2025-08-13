import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { KategoriOlahragaService } from './kategori-olahraga.service';
import { CreateKategoriOlahragaDto } from './dto/create-kategori-olahraga.dto';
import { UpdateKategoriOlahragaDto } from './dto/update-kategori-olahraga.dto';
import { KategoriOlahragaDto } from './dto/kategori-olahraga.dto';
import { KategoriOlahraga } from './entities/kategori-olahraga.entity/kategori-olahraga.entity';

@Controller('kategori-olahraga')
export class KategoriOlahragaController {
  constructor(private readonly kategoriOlahragaService: KategoriOlahragaService) {}

  @Post()
  async create(@Body() createKategoriOlahragaDto: CreateKategoriOlahragaDto): Promise<KategoriOlahragaDto> {
    try {
      const kategori = await this.kategoriOlahragaService.create(createKategoriOlahragaDto);
      return new KategoriOlahragaDto(kategori);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(): Promise<KategoriOlahragaDto[]> {
    try {
      const kategoris = await this.kategoriOlahragaService.findAll();
      return kategoris.map(kategori => new KategoriOlahragaDto(kategori));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<KategoriOlahragaDto> {
    try {
      const kategori = await this.kategoriOlahragaService.findOne(id);
      return new KategoriOlahragaDto(kategori);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateKategoriOlahragaDto: UpdateKategoriOlahragaDto,
  ): Promise<KategoriOlahragaDto> {
    try {
      const kategori = await this.kategoriOlahragaService.update(id, updateKategoriOlahragaDto);
      return new KategoriOlahragaDto(kategori);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.kategoriOlahragaService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}