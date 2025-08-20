import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubkategoriPeralatan } from './entities/subkategori-peralatan.entity';
import { CreateSubkategoriPeralatanDto } from './dto/create-subkategori-peralatan.dto';
import { UpdateSubkategoriPeralatanDto } from './dto/update-subkategori-peralatan.dto';
import { KategoriOlahraga } from '../kategori-olahraga/entities/kategori-olahraga.entity/kategori-olahraga.entity';

@Injectable()
export class SubkategoriPeralatanService {
    constructor(
        @InjectRepository(SubkategoriPeralatan)
        private subkategoriPeralatanRepository: Repository<SubkategoriPeralatan>,
        @InjectRepository(KategoriOlahraga)
        private kategoriOlahragaRepository: Repository<KategoriOlahraga>,
    ) {}

    async create(createSubkategoriPeralatanDto: CreateSubkategoriPeralatanDto): Promise<SubkategoriPeralatan> {
        // Validasi kategori olahraga exists
        const kategoriOlahraga = await this.kategoriOlahragaRepository.findOne({
            where: { id: createSubkategoriPeralatanDto.kategori_olahraga_id }
        });

        if (!kategoriOlahraga) {
            throw new BadRequestException('Kategori olahraga tidak ditemukan');
        }

        const subkategoriPeralatan = this.subkategoriPeralatanRepository.create(createSubkategoriPeralatanDto);
        return await this.subkategoriPeralatanRepository.save(subkategoriPeralatan);
    }

    async findAll(): Promise<SubkategoriPeralatan[]> {
        return await this.subkategoriPeralatanRepository.find({
            relations: ['kategoriOlahraga'],
            order: { created_at: 'DESC' }
        });
    }

    async findOne(id: string): Promise<SubkategoriPeralatan> {
        const subkategoriPeralatan = await this.subkategoriPeralatanRepository.findOne({
            where: { id },
            relations: ['kategoriOlahraga']
        });

        if (!subkategoriPeralatan) {
            throw new NotFoundException('Subkategori peralatan tidak ditemukan');
        }

        return subkategoriPeralatan;
    }

    async findByKategoriOlahraga(kategoriOlahragaId: string): Promise<SubkategoriPeralatan[]> {
        return await this.subkategoriPeralatanRepository.find({
            where: { kategori_olahraga_id: kategoriOlahragaId },
            relations: ['kategoriOlahraga'],
            order: { nama: 'ASC' }
        });
    }

    async update(id: string, updateSubkategoriPeralatanDto: UpdateSubkategoriPeralatanDto): Promise<SubkategoriPeralatan> {
        const subkategoriPeralatan = await this.findOne(id);

        if (updateSubkategoriPeralatanDto.kategori_olahraga_id) {
            // Validasi kategori olahraga exists jika diupdate
            const kategoriOlahraga = await this.kategoriOlahragaRepository.findOne({
                where: { id: updateSubkategoriPeralatanDto.kategori_olahraga_id }
            });

            if (!kategoriOlahraga) {
                throw new BadRequestException('Kategori olahraga tidak ditemukan');
            }
        }

        Object.assign(subkategoriPeralatan, updateSubkategoriPeralatanDto);
        return await this.subkategoriPeralatanRepository.save(subkategoriPeralatan);
    }

    async remove(id: string): Promise<void> {
        const subkategoriPeralatan = await this.findOne(id);
        await this.subkategoriPeralatanRepository.remove(subkategoriPeralatan);
    }
}
