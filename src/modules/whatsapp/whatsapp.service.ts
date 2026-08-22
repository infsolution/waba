import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../config/prisma.service';
import { Aes256GcmService } from '../../common/encryption/aes-256-gcm.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class WhatsappService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    private readonly aesService: Aes256GcmService,
  ) {}

  async sendMessage(phoneNumberId: string, dto: SendMessageDto) {
    const graphApiVersion = this.configService.get<string>('meta.graphApiVersion') || 'v21.0';
    const encryptionKey = this.configService.get<string>('encryption.key');

    const account = await this.prismaService.whatsappAccount.findFirst({
      where: {
        phoneNumbers: {
          path: ['id'],
          equals: phoneNumberId,
        } as any,
      },
    });

    if (!account) {
      throw new BadRequestException('Phone number ID não encontrado nas contas vinculadas');
    }

    const accessToken = this.aesService.decrypt(
      account.userAccessToken,
      encryptionKey,
      account.tokenIv,
      account.tokenAuthTag,
    );

    const isOutside24h = dto._24h_window === false;
    if (dto.type !== 'template' && isOutside24h) {
      throw new BadRequestException(
        'Mensagens fora da janela de 24h devem usar templates. Use o tipo template ou garanta que está dentro da janela.',
      );
    }

    const payload: any = { ...dto };
    delete payload._24h_window;

    try {
      const response = await this.httpService
        .post(
          `https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        )
        .toPromise();

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error?.response?.data?.error?.message || 'Erro ao enviar mensagem para Meta';
      const status = error?.response?.status || HttpStatus.BAD_GATEWAY;
      throw new HttpException(message, status);
    }
  }
}
