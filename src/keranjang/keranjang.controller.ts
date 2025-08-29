import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, HttpException, HttpStatus } from '@nestjs/common';
import { KeranjangService } from './keranjang.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { KeranjangDto } from './dto/keranjang.dto';

@Controller('keranjang')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('customer')
export class KeranjangController {
	constructor(private readonly service: KeranjangService) {}

	@Get()
	async getCart(@Req() req): Promise<KeranjangDto> {
		const cart = await this.service.getCart(req.user.userId || req.user.sub);
		return new KeranjangDto(cart);
	}

	@Post('items')
	async addItem(@Req() req, @Body() dto: AddItemDto): Promise<KeranjangDto> {
		try {
			const cart = await this.service.addItem(req.user.userId || req.user.sub, dto);
			return new KeranjangDto(cart);
		} catch (error: any) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
		}
	}

	@Patch('items/:id')
	async updateItem(@Req() req, @Param('id') id: string, @Body() dto: UpdateItemDto): Promise<KeranjangDto> {
		const cart = await this.service.updateItem(req.user.userId || req.user.sub, id, dto);
		return new KeranjangDto(cart);
	}

	@Delete('items/:id')
	async removeItem(@Req() req, @Param('id') id: string): Promise<KeranjangDto> {
		const cart = await this.service.removeItem(req.user.userId || req.user.sub, id);
		return new KeranjangDto(cart);
	}

	@Delete('clear')
	async clear(@Req() req): Promise<KeranjangDto> {
		const cart = await this.service.clear(req.user.userId || req.user.sub);
		return new KeranjangDto(cart);
	}
}
