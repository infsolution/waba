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
exports.MetaAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const prisma_service_1 = require("../../config/prisma.service");
const aes_256_gcm_service_1 = require("../../common/encryption/aes-256-gcm.service");
const crypto = require("crypto");
let MetaAuthService = class MetaAuthService {
    constructor(configService, httpService, prismaService, aesService) {
        this.configService = configService;
        this.httpService = httpService;
        this.prismaService = prismaService;
        this.aesService = aesService;
    }
    async exchangeCode(dto) {
        const appId = this.configService.get('meta.appId');
        const appSecret = this.configService.get('meta.appSecret');
        const graphApiVersion = this.configService.get('meta.graphApiVersion') || 'v21.0';
        if (!appId || !appSecret) {
            throw new common_1.HttpException('APP_ID e APP_SECRET são obrigatórios', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
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
                throw new common_1.HttpException('Token de acesso não retornado pelo Meta', common_1.HttpStatus.BAD_GATEWAY);
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
            const encrypted = this.aesService.encrypt(accessToken, this.configService.get('encryption.key'));
            await this.prismaService.whatsappAccount.upsert({
                where: { wabaId: wabaId || crypto.randomUUID() },
                update: {
                    userAccessToken: encrypted.ciphertext,
                    tokenIv: encrypted.iv,
                    tokenAuthTag: encrypted.authTag,
                    phoneNumbers: phoneNumbers,
                },
                create: {
                    wabaId: wabaId || crypto.randomUUID(),
                    userAccessToken: encrypted.ciphertext,
                    tokenIv: encrypted.iv,
                    tokenAuthTag: encrypted.authTag,
                    phoneNumbers: phoneNumbers,
                },
            });
            return {
                success: true,
                waba_id: wabaId,
                phone_numbers: phoneNumbers,
            };
        }
        catch (error) {
            const message = error?.response?.data?.error?.message || 'Erro ao comunicar com Meta';
            throw new common_1.HttpException(message, common_1.HttpStatus.BAD_GATEWAY);
        }
    }
};
exports.MetaAuthService = MetaAuthService;
exports.MetaAuthService = MetaAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService,
        prisma_service_1.PrismaService,
        aes_256_gcm_service_1.Aes256GcmService])
], MetaAuthService);
//# sourceMappingURL=meta-auth.service.js.map