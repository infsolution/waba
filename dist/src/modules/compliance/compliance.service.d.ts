import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
export declare class ComplianceService {
    private readonly configService;
    private readonly confirmationBaseUrl;
    constructor(configService: ConfigService);
    dataDeletion(req: Request): {
        url: string;
    };
    deauthorize(req: Request): {
        url: string;
    };
}
