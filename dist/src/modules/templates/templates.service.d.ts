import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../config/prisma.service';
import { Aes256GcmService } from '../../common/encryption/aes-256-gcm.service';
import { CreateTemplateDto, ListTemplatesQuery } from './dto/templates.dto';
export declare class TemplatesService {
    private readonly configService;
    private readonly httpService;
    private readonly prismaService;
    private readonly aesService;
    constructor(configService: ConfigService, httpService: HttpService, prismaService: PrismaService, aesService: Aes256GcmService);
    private getTokenForWaba;
    list(wabaId: string, query: ListTemplatesQuery): Promise<{
        success: boolean;
        data: any;
    }>;
    create(wabaId: string, dto: CreateTemplateDto): Promise<{
        success: boolean;
        data: any;
    }>;
}
