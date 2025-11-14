import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Put,
  Body,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { UsersService } from './users.service';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @Get('customers')
  async findAllCustomers() {
    try {
      return await this.usersService.findAllCustomers();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles('admin')
  @Delete(':id')
  async removeCustomer(@Param('id') id: string) {
    try {
      return await this.usersService.removeCustomer(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Roles('customer')
  @Put('profile/:id')
  async updateCustomerProfile(
    @Body() dto: UpdateCustomerProfileDto,
    @Param('id') id: string,
  ) {
    try {
      return await this.usersService.updateCustomerProfile(id, dto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
