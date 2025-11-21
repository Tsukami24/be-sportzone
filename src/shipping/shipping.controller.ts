import { Controller, Post, Body } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { EtaRequestDto } from './dto/eta-request.dto';
import { EtaResponseDto } from './dto/eta-response.dto';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('eta')
  calculateEta(@Body() etaRequestDto: EtaRequestDto): EtaResponseDto {
    return this.shippingService.calculateEta(etaRequestDto);
  }
}
