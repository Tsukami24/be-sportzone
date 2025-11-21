import { Injectable } from '@nestjs/common';
import { EtaRequestDto } from './dto/eta-request.dto';
import { EtaResponseDto } from './dto/eta-response.dto';

@Injectable()
export class ShippingService {
  private readonly STORE_CITY = 'Depok';
  private readonly STORE_PROVINCE = 'Jawa Barat';
  private readonly HANDLING_TIME = 1;

  calculateEta(etaRequestDto: EtaRequestDto): EtaResponseDto {
    const { kota, provinsi } = etaRequestDto;

    const normalizedKota = kota.trim().toLowerCase();
    const normalizedProvinsi = provinsi.trim().toLowerCase();
    const normalizedStoreCity = this.STORE_CITY.toLowerCase();
    const normalizedStoreProvince = this.STORE_PROVINCE.toLowerCase();

    let shippingMin = 0;
    let shippingMax = 0;

    if (normalizedKota === normalizedStoreCity) {
      shippingMin = 1;
      shippingMax = 2;
    } else if (normalizedProvinsi === normalizedStoreProvince) {
      shippingMin = 2;
      shippingMax = 4;
    } else {
      shippingMin = 3;
      shippingMax = 7;
    }

    return {
      min: this.HANDLING_TIME + shippingMin,
      max: this.HANDLING_TIME + shippingMax,
    };
  }
}
