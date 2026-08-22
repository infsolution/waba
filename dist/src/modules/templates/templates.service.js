"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const prisma_service_1 = require("../../config/prisma.service");
const aes_256_gcm_service_1 = require("../../common/encryption/aes-256-gcm.service");
let TemplatesService = class TemplatesService {
    constructor(configService, httpService, prismaService, aesService) {
        this.configService = configService;
        this.httpService = httpService;
        this.prismaService = prismaService;
        this.aesService = aesService;
    }
    async getTokenForWaba(wabaId) {
        const encryptionKey = this.configService.get('encryption.key');
        const account = await this.prismaService.whatsappAccount.findUnique({
            where: { wabaId },
        });
        if (!account) {
            throw new common_1.BadRequestException('WABA não encontrado');
        }
        return this.aesService.decrypt(account.userAccessToken, encryptionKey, account.tokenIv, account.tokenAuthTag);
    }
    async list(wabaId, query) {
        const graphApiVersion = this.configService.get('meta.graphApiVersion') || 'v21.0';
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
        }
        catch (error) {
            const message = error?.response?.data?.error?.message || 'Erro ao listar templates';
            const status = error?.response?.status || common_1.HttpStatus.BAD_GATEWAY;
            throw new common_1.HttpException(message, status);
        }
    }
    async create(wabaId, dto) {
        const graphApiVersion = this.configService.get('meta.graphApiVersion') || 'v21.0';
        const accessToken = await this.getTokenForWaba(wabaId);
        if (!dto.name || !dto.language || !dto.category) {
            throw new common_1.BadRequestException('Campos obrigatórios: name, language, category');
        }
        const payload = {
            name: dto.name,
            language: dto.language,
            category: dto.category,
        };
        if (dto.components_format) {
            payload.components = dto.components_format;
        }
        try {
            const response = await this.httpService
                .post(`https://graph.facebook.com/${graphApiVersion}/${wabaId}/message_templates`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            })
                .toPromise();
            return {
                success: true,
                data: response.data,
            };
        }
        catch (error) {
            const message = error?.response?.data?.error?.message || 'Erro ao criar template';
            const status = error?.response?.status || common_1.HttpStatus.BAD_GATEWAY;
            throw new common_1.HttpException(message, status);
        }
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService,
        prisma_service_1.PrismaService,
        aes_256_gcm_service_1.Aes256GcmService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map