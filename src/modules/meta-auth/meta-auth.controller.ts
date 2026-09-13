import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ExchangeCodeDto } from './dto/exchange-code.dto';
import { MetaAuthService } from './meta-auth.service';

@Controller()
export class MetaAuthController {
  constructor(private readonly metaAuthService: MetaAuthService) {}

  @Post('auth/exchange-code')
  @HttpCode(HttpStatus.OK)
  exchangeCode(@Body() dto: ExchangeCodeDto) {
    return this.metaAuthService.exchangeCode(dto);
  }
}
