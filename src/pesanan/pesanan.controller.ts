import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { PesananService } from './pesanan.service';
import { CreatePesananDto } from './dto/create-pesanan.dto';
import { UpdatePesananDto } from './dto/update-pesanan.dto';
import { PesananDto } from './dto/pesanan.dto';
import { CreatePesananItemDto } from './dto/create-pesanan-item.dto';
import { UpdatePesananItemDto } from './dto/update-pesanan-item.dto';
import { PesananItemDto } from './dto/pesanan-item.dto';
import { Pesanan } from './entities/pesanan.entity';
import { PesananItem } from './entities/pesanan-item.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Controller('pesanan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PesananController {
  constructor(
    private readonly pesananService: PesananService,
  ) {}

  @Roles('user')
  @Post()
  async create(
    @Body() createPesananDto: CreatePesananDto,
  ): Promise<PesananDto> {
    try {
      const pesanan = await this.pesananService.create(
        createPesananDto,
      );
      return new PesananDto(pesanan);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles('admin')
  @Get()
  async findAll(): Promise<PesananDto[]> {
    try {
      const pesanans = await this.pesananService.findAll();
      return pesanans.map((pesanan) => new PesananDto(pesanan));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles('admin', 'user')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PesananDto> {
    try {
      const pesanan = await this.pesananService.findOne(id);
      return new PesananDto(pesanan);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Roles('admin', 'user')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePesananDto: UpdatePesananDto,
  ): Promise<PesananDto> {
    try {
      const pesanan = await this.pesananService.update(
        id,
        updatePesananDto,
      );
      return new PesananDto(pesanan);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.pesananService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  // Pesanan Item endpoints
  @Roles('admin', 'user')
  @Post('item')
  async createItem(
    @Body() createPesananItemDto: CreatePesananItemDto,
  ): Promise<PesananItemDto> {
    try {
      const pesananItem = await this.pesananService.createItem(
        createPesananItemDto,
      );
      return new PesananItemDto(pesananItem);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles('admin')
  @Get('item')
  async findAllItems(): Promise<PesananItemDto[]> {
    try {
      const pesananItems = await this.pesananService.findAllItems();
      return pesananItems.map((item) => new PesananItemDto(item));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles('admin', 'user')
  @Get('item/:id')
  async findOneItem(@Param('id') id: string): Promise<PesananItemDto> {
    try {
      const pesananItem = await this.pesananService.findOneItem(id);
      return new PesananItemDto(pesananItem);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Roles('admin', 'user')
  @Put('item/:id')
  async updateItem(
    @Param('id') id: string,
    @Body() updatePesananItemDto: UpdatePesananItemDto,
  ): Promise<PesananItemDto> {
    try {
      const pesananItem = await this.pesananService.updateItem(
        id,
        updatePesananItemDto,
      );
      return new PesananItemDto(pesananItem);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Roles('admin')
  @Delete('item/:id')
  async removeItem(@Param('id') id: string): Promise<void> {
    try {
      await this.pesananService.removeItem(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}