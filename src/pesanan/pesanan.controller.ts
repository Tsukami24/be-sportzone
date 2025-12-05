import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
  Req,
  HttpStatus,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { PesananService } from './pesanan.service';
import { CreatePesananDto } from './dto/create-pesanan.dto';
import { PesananDto } from './dto/pesanan.dto';
import { CreatePesananItemDto } from './dto/create-pesanan-item.dto';
import { UpdatePesananItemDto } from './dto/update-pesanan-item.dto';
import { PesananItemDto } from './dto/pesanan-item.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { UpdateStatusPesananDto } from './dto/update-status-pesanan.dto';

@Controller('pesanan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PesananController {
  constructor(private readonly pesananService: PesananService) {}

  @Roles('customer')
  @Get('history')
  async getHistory(@Req() req) {
    return this.pesananService.findByUser(req.user.sub || req.user.userId);
  }

  @Roles('customer')
  @Post()
  async create(
    @Body() createPesananDto: CreatePesananDto,
  ): Promise<PesananDto> {
    try {
      const pesanan = await this.pesananService.create(createPesananDto);
      return new PesananDto(pesanan);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles('admin', 'petugas')
  @Get()
  async findAll(): Promise<PesananDto[]> {
    try {
      const pesanans = await this.pesananService.findAll();
      return pesanans.map((pesanan) => new PesananDto(pesanan));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles('admin')
  @Get('export/excel')
  async exportToExcel(@Res() res: Response) {
    try {
      const buffer = await this.pesananService.exportToExcel();
      const filename = `data-pesanan-${new Date().toISOString().split('T')[0]}.xlsx`;

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );

      return res.send(buffer);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles('admin', 'customer', 'petugas')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PesananDto> {
    try {
      const pesanan = await this.pesananService.findOne(id);
      return new PesananDto(pesanan);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Roles('petugas')
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusPesananDto,
    @Req() req,
  ): Promise<PesananDto> {
    try {
      const pesanan = await this.pesananService.updateStatus(
        id,
        updateStatusDto.status,
        req.user.role || 'customer',
        req.user.sub || req.user.userId,
      );
      return new PesananDto(pesanan);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles('petugas', 'customer')
  @Put(':id/cancel')
  async cancelOrder(@Param('id') id: string, @Req() req): Promise<PesananDto> {
    try {
      const pesanan = await this.pesananService.cancelOrder(
        id,
        req.user.role?.name || 'customer',
        req.user.sub || req.user.userId,
      );
      return new PesananDto(pesanan);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
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

  @Roles('admin', 'customer')
  @Post('item')
  async createItem(
    @Body() createPesananItemDto: CreatePesananItemDto,
  ): Promise<PesananItemDto> {
    try {
      const pesananItem =
        await this.pesananService.createItem(createPesananItemDto);
      return new PesananItemDto(pesananItem);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles('admin', 'petugas')
  @Get('item')
  async findAllItems(): Promise<PesananItemDto[]> {
    try {
      const pesananItems = await this.pesananService.findAllItems();
      return pesananItems.map((item) => new PesananItemDto(item));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles('admin', 'customer', 'petugas')
  @Get('item/:id')
  async findOneItem(@Param('id') id: string): Promise<PesananItemDto> {
    try {
      const pesananItem = await this.pesananService.findOneItem(id);
      return new PesananItemDto(pesananItem);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Roles('admin', 'customer')
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
