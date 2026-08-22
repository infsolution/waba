import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../config/prisma.service';
import { Aes256GcmService } from '../../common/encryption/aes-256-gcm.service';
import { CreateTemplateDto, ListTemplatesQuery } from './dto/templates.dto';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    private readonly aesService: Aes256GcmService,
  ) {}

  private async getTokenForWaba(wabaId: string): Promise<string> {
    const encryptionKey = this.configService.get<string>('encryption.key');
    const account = await this.prismaService.whatsappAccount.findUnique({
      where: { wabaId },
    });

    if (!account) {
      throw new BadRequestException('WABA não encontrado');
    }

    return this.aesService.decrypt(
      account.userAccessToken,
      encryptionKey,
      account.tokenIv,
      account.tokenAuthTag,
    );
  }

  async list(wabaId: string, query: ListTemplatesQuery) {
    const graphApiVersion = this.configService.get<string>('meta.graphApiVersion') || 'v21.0';
    const accessToken = await this.getTokenForWaba(wabaId);

    try {
      const response = await this.httpService
        .get(`https://graph.facebook.com/${graphApiVersion}/${wabaId}/message_templates`, {
          params: {
            access_token: accessToken,
            fields: query.fields || 'name,language,status,category',
          },
        })
        .toPromise();

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error?.response?.data?.error?.message || 'Erro ao listar templates';
      const status = error?.response?.status || HttpStatus.BAD_GATEWAY;
      throw new HttpException(message, status);
    }
  }

  async create(wabaId: string, dto: CreateTemplateDto) {
    const graphApiVersion = this.configService.get<string>('meta.graphApiVersion') || 'v21.0';
    const accessToken = await this.getTokenForWaba(wabaId);

    if (!dto.name || !dto.language || !dto.category) {
      throw new BadRequestException('Campos obrigatórios: name, language, category');
    }

    const payload: any = {
      name: dto.name,
      language: dto.language,
      category: dto.category,
    };

    if (dto.components_format) {
      payload.components = dto.components_format;
    }

    try {
      const response = await this.httpService
        .post(
          `https://graph.facebook.com/${graphApiVersion}/${wabaId}/message_templates`,
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
      const message = error?.response?.data?.error?.message || 'Erro ao criar template';
      const status = error?.response?.status || HttpStatus.BAD_GATEWAY;
      throw new HttpException(message, status);
    }
  }
}
