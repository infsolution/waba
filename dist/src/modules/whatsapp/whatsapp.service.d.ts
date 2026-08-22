import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../config/prisma.service';
import { Aes256GcmService } from '../../common/encryption/aes-256-gcm.service';
import { SendMessageDto } from './dto/send-message.dto';
export declare class WhatsappService {
    private readonly configService;
    private readonly httpService;
    private readonly prismaService;
    private readonly aesService;
    constructor(configService: ConfigService, httpService: HttpService, prismaService: PrismaService, aesService: Aes256GcmService);
    sendMessage(phoneNumberId: string, dto: SendMessageDto): Promise<{
        success: boolean;
        data: any;
    }>;
}
