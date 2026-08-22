import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ExchangeCodeDto } from './dto/exchange-code.dto';
import { PrismaService } from '../../config/prisma.service';
import { Aes256GcmService } from '../../common/encryption/aes-256-gcm.service';
export declare class MetaAuthService {
    private readonly configService;
    private readonly httpService;
    private readonly prismaService;
    private readonly aesService;
    constructor(configService: ConfigService, httpService: HttpService, prismaService: PrismaService, aesService: Aes256GcmService);
    exchangeCode(dto: ExchangeCodeDto): Promise<{
        success: boolean;
        waba_id: string;
        phone_numbers: any;
    }>;
}
