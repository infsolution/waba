import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ExchangeCodeDto } from './dto/exchange-code.dto';
import { PrismaService } from '../../config/prisma.service';
import { Aes256GcmService } from '../../common/encryption/aes-256-gcm.service';
import * as crypto from 'crypto';

@Injectable()
export class MetaAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    private readonly aesService: Aes256GcmService,
  ) {}

  async exchangeCode(dto: ExchangeCodeDto) {
    const appId = this.configService.get<string>('meta.appId');
    const appSecret = this.configService.get<string>('meta.appSecret');
    const graphApiVersion = this.configService.get<string>('meta.graphApiVersion') || 'v21.0';

    if (!appId || !appSecret) {
      throw new HttpException('APP_ID e APP_SECRET são obrigatórios', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const accessTokenUrl = `https://graph.facebook.com/${graphApiVersion}/oauth/access_token`;
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: dto.code,
    });

    try {
      const tokenResponse = await this.httpService
        .post(accessTokenUrl, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        .toPromise();

      const accessToken = tokenResponse.data.access_token;

      if (!accessToken) {
        throw new HttpException('Token de acesso não retornado pelo Meta', HttpStatus.BAD_GATEWAY);
      }

      const wabaId = dto.waba_id;
      let phoneNumbers = null;

      if (wabaId) {
        const wabaResponse = await this.httpService
          .get(`https://graph.facebook.com/${graphApiVersion}/${wabaId}`, {
            params: {
              fields: 'phone_numbers',
              access_token: accessToken,
            },
          })
          .toPromise();

        phoneNumbers = wabaResponse.data.phone_numbers || null;
      }

      const encrypted = this.aesService.encrypt(accessToken, this.configService.get<string>('encryption.key'));

      await this.prismaService.whatsappAccount.upsert({
        where: { wabaId: wabaId || crypto.randomUUID() },
        update: {
          userAccessToken: encrypted.ciphertext,
          tokenIv: encrypted.iv,
          tokenAuthTag: encrypted.authTag,
          phoneNumbers: phoneNumbers as any,
        },
        create: {
          wabaId: wabaId || crypto.randomUUID(),
          userAccessToken: encrypted.ciphertext,
          tokenIv: encrypted.iv,
          tokenAuthTag: encrypted.authTag,
          phoneNumbers: phoneNumbers as any,
        },
      });

      return {
        success: true,
        waba_id: wabaId,
        phone_numbers: phoneNumbers,
      };
    } catch (error) {
      const message = error?.response?.data?.error?.message || 'Erro ao comunicar com Meta';
      throw new HttpException(message, HttpStatus.BAD_GATEWAY);
    }
  }
}
