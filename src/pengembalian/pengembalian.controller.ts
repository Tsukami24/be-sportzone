import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PengembalianService } from './pengembalian.service';
import { CreatePengembalianDto } from './dto/create-pengembalian.dto';
import { UpdatePengembalianDto } from './dto/update-pengembalian.dto';
import { PengembalianDto } from './dto/pengembalian.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';

@Controller('pengembalian')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PengembalianController {
  constructor(private readonly pengembalianService: PengembalianService) {}

  @Roles('customer')
  @Post()
  @UseInterceptors(
    FileInterceptor('bukti_foto', {
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
    @Body() createPengembalianDto: CreatePengembalianDto,
    @Req() req,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<PengembalianDto> {
    try {
      if (file) {
        createPengembalianDto.bukti_foto = `${process.env.BASE_URL}/uploads/${file.filename}`;
      }
      const userId = req.user.sub || req.user.userId;
      const pengembalian = await this.pengembalianService.create(
        createPengembalianDto,
        userId,
      );
      return new PengembalianDto(pengembalian);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles('admin', 'petugas')
  @Get()
  async findAll(): Promise<PengembalianDto[]> {
    try {
      const pengembalians = await this.pengembalianService.findAll();
      return pengembalians.map((p) => new PengembalianDto(p));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles('customer')
  @Get('user')
  async findByUser(@Req() req): Promise<PengembalianDto[]> {
    try {
      const userId = req.user.sub || req.user.userId;
      const pengembalians = await this.pengembalianService.findByUser(userId);
      return pengembalians.map((p) => new PengembalianDto(p));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles('admin', 'petugas', 'customer')
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PengembalianDto> {
    try {
      const pengembalian = await this.pengembalianService.findOne(id);
      return new PengembalianDto(pengembalian);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Roles('admin')
  @Put(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body('catatan_admin') catatanAdmin: string,
    @Req() req,
  ): Promise<PengembalianDto> {
    try {
      const adminId = req.user.sub || req.user.userId;
      const pengembalian = await this.pengembalianService.approve(
        id,
        adminId,
        catatanAdmin,
      );
      return new PengembalianDto(pengembalian);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles('admin')
  @Put(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body('catatan_admin') catatanAdmin: string,
    @Req() req,
  ): Promise<PengembalianDto> {
    try {
      const adminId = req.user.sub || req.user.userId;
      const pengembalian = await this.pengembalianService.reject(
        id,
        adminId,
        catatanAdmin,
      );
      return new PengembalianDto(pengembalian);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Roles('admin')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePengembalianDto: UpdatePengembalianDto,
  ): Promise<PengembalianDto> {
    try {
      const pengembalian = await this.pengembalianService.update(
        id,
        updatePengembalianDto,
      );
      return new PengembalianDto(pengembalian);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.pengembalianService.remove(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Roles('admin', 'petugas')
  @Get('produk-rusak/all')
  async findAllProdukRusak() {
    try {
      return await this.pengembalianService.findAllProdukRusak();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles('admin', 'petugas')
  @Get('produk-rusak/:pengembalianId')
  async findProdukRusakByPengembalian(
    @Param('pengembalianId') pengembalianId: string,
  ) {
    try {
      return await this.pengembalianService.findProdukRusakByPengembalian(
        pengembalianId,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
