import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SubkategoriPeralatanService } from './subkategori-peralatan.service';
import { CreateSubkategoriPeralatanDto } from './dto/create-subkategori-peralatan.dto';
import { UpdateSubkategoriPeralatanDto } from './dto/update-subkategori-peralatan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('subkategori-peralatan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubkategoriPeralatanController {
    constructor(private readonly subkategoriPeralatanService: SubkategoriPeralatanService) {}

    @Post()
    @Roles('admin')
    create(@Body() createSubkategoriPeralatanDto: CreateSubkategoriPeralatanDto) {
        return this.subkategoriPeralatanService.create(createSubkategoriPeralatanDto);
    }

    @Get()
    findAll() {
        return this.subkategoriPeralatanService.findAll();
    }

    @Get('kategori/:kategoriId')
    findByKategoriOlahraga(@Param('kategoriId') kategoriId: string) {
        return this.subkategoriPeralatanService.findByKategoriOlahraga(kategoriId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.subkategoriPeralatanService.findOne(id);
    }

    @Patch(':id')
    @Roles('admin', 'petugas')
    update(@Param('id') id: string, @Body() updateSubkategoriPeralatanDto: UpdateSubkategoriPeralatanDto) {
        return this.subkategoriPeralatanService.update(id, updateSubkategoriPeralatanDto);
    }

    @Delete(':id')
    @Roles('admin')
    remove(@Param('id') id: string) {
        return this.subkategoriPeralatanService.remove(id);
    }
}
