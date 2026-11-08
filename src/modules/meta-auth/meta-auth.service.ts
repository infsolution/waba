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
    const graphApiVersion =
      this.configService.get<string>('meta.graphApiVersion') || 'v21.0';

    if (!appId || !appSecret) {
      throw new HttpException(
        'APP_ID e APP_SECRET são obrigatórios',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      console.log(
        '[DEBUG] appId:',
        appId,
        '| secret existe?',
        !!appSecret,
        '| code inicio:',
        dto.code?.substring(0, 8),
      );
      console.log('ANTES DO TOKEN');
      // PASSO 1: code -> short-lived user token
      // Aqui é GET, com `code`, NÃO é fb_exchange_token
      const shortTokenRes = await this.httpService
        .get(
          `https://graph.facebook.com/${graphApiVersion}/oauth/access_token`,
          {
            params: {
              client_id: appId,
              client_secret: appSecret,
              code: dto.code,
            },
          },
        )
        .toPromise();
      console.log('DEPOIS DO TOKEN - NÃO CHEGA AQUI');
      const shortLivedToken = shortTokenRes.data.access_token;
      if (!shortLivedToken) {
        throw new HttpException(
          'Token de acesso não retornado pelo Meta',
          HttpStatus.BAD_GATEWAY,
        );
      }
      console.log('Token da meta' + shortLivedToken.substring(0, 8));
      // PASSO 2: short-lived -> long-lived (AQUI sim usa fb_exchange_token)
      const longTokenRes = await this.httpService
        .get(
          `https://graph.facebook.com/${graphApiVersion}/oauth/access_token`,
          {
            params: {
              grant_type: 'fb_exchange_token',
              client_id: appId,
              client_secret: appSecret,
              fb_exchange_token: shortLivedToken, // aqui vai TOKEN, não code
            },
          },
        )
        .toPromise();

      const accessToken = longTokenRes.data.access_token;
      console.log('Access Token da meta' + accessToken.substring(0, 8));
      /// PASSO 3: descobrir o WABA real
      let wabaId = dto.waba_id;

      console.log('WABA ID ' + wabaId);
      if (!wabaId) {
        // 1. Lista os businesses do usuário - SEM o campo de WABA aqui
        const businessesRes = await this.httpService
          .get(`https://graph.facebook.com/${graphApiVersion}/me/businesses`, {
            params: {
              fields: 'id,name',
              access_token: accessToken,
            },
          })
          .toPromise();
        const businesses = businessesRes.data?.data || [];
        console.log('[exchangeCode] businesses:', JSON.stringify(businesses));
        // 2. Para cada business, busca os WABAs no EDGE correto
        for (const business of businesses) {
          const ownedRes = await this.httpService
            .get(
              `https://graph.facebook.com/${graphApiVersion}/${business.id}/owned_whatsapp_business_accounts`,
              {
                params: { access_token: accessToken },
              },
            )
            .toPromise();
          const wabas = ownedRes.data?.data || [];
          if (wabas.length > 0) {
            wabaId = wabas[0].id;
            break;
          }
        }
      }

      if (!wabaId) {
        console.log('NAO TEM WABA ID ' + wabaId);
        throw new HttpException(
          'Nenhuma conta WhatsApp encontrada após signup',
          HttpStatus.BAD_GATEWAY,
        );
      }

      // PASSO 4: buscar os números desse WABA
      console.log('PASSO 4 ');
      const wabaRes = await this.httpService
        .get(`https://graph.facebook.com/${graphApiVersion}/${wabaId}`, {
          params: {
            fields:
              'id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status}',
            access_token: accessToken,
          },
        })
        .toPromise();

      const phoneNumbers = wabaRes.data.phone_numbers?.data || [];
      const phoneNumberId = phoneNumbers[0]?.id || null;
      console.log('DATA FONE ' + phoneNumbers);
      const encrypted = this.aesService.encrypt(
        accessToken,
        this.configService.get<string>('encryption.key'),
      );
      console.log('ENCRYPT ');

      await this.prismaService.whatsappAccount.upsert({
        where: { wabaId },
        update: {
          userAccessToken: encrypted.ciphertext,
          tokenIv: encrypted.iv,
          tokenAuthTag: encrypted.authTag,
          phoneNumbers: phoneNumbers as any,
        },
        create: {
          wabaId,
          userAccessToken: encrypted.ciphertext,
          tokenIv: encrypted.iv,
          tokenAuthTag: encrypted.authTag,
          phoneNumbers: phoneNumbers as any,
        },
      });
      console.log('POS ENCRYPT');

      return {
        success: true,
        waba_id: wabaId,
        phone_number_id: phoneNumberId, // agora seu frontend recebe o que ele espera
        phone_numbers: phoneNumbers,
      };
    } catch (error) {
      const message =
        error?.response?.data?.error?.message || 'Erro ao comunicar com Meta';
      // Loga o erro FULL no backend pra não ficar cego de novo
      console.log(
        '[exchangeCode] Meta error:',
        JSON.stringify(error?.response?.data, null, 2),
      );
      throw new HttpException(message, HttpStatus.BAD_GATEWAY);
    }
  }
}
