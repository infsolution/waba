import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ComplianceService {
  private readonly confirmationBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.confirmationBaseUrl = this.configService.get<string>('COMPLIANCE_CONFIRMATION_URL', 'https://example.com/compliance/confirmation');
  }

  dataDeletion(req: Request) {
    const signedRequest = req.body?.signed_request as string | undefined;
    if (!signedRequest) {
      throw new HttpException('signed_request é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const confirmationUrl = `${this.confirmationBaseUrl}?type=data-deletion&user_id=${Date.now()}`;
    return {
      url: confirmationUrl,
    };
  }

  deauthorize(req: Request) {
    const signedRequest = req.body?.signed_request as string | undefined;
    if (!signedRequest) {
      throw new HttpException('signed_request é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const confirmationUrl = `${this.confirmationBaseUrl}?type=deauthorize&user_id=${Date.now()}`;
    return {
      url: confirmationUrl,
    };
  }
}
