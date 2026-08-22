import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Get,
} from '@nestjs/common';
import { Request } from 'express';
import { ComplianceService } from './compliance.service';

@Controller()
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('compliance/data-deletion')
  @HttpCode(HttpStatus.OK)
  dataDeletion(@Req() req: Request) {
    return this.complianceService.dataDeletion(req);
  }

  @Post('compliance/deauthorize')
  @HttpCode(HttpStatus.OK)
  deauthorize(@Req() req: Request) {
    return this.complianceService.deauthorize(req);
  }

  @Get('compliance/test')
  testRoute() {
    console.log('Rota de teste');
    return 'Rota de teste';
  }
}
