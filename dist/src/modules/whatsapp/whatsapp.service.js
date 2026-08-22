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
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const prisma_service_1 = require("../../config/prisma.service");
const aes_256_gcm_service_1 = require("../../common/encryption/aes-256-gcm.service");
let WhatsappService = class WhatsappService {
    constructor(configService, httpService, prismaService, aesService) {
        this.configService = configService;
        this.httpService = httpService;
        this.prismaService = prismaService;
        this.aesService = aesService;
    }
    async sendMessage(phoneNumberId, dto) {
        const graphApiVersion = this.configService.get('meta.graphApiVersion') || 'v21.0';
        const encryptionKey = this.configService.get('encryption.key');
        const account = await this.prismaService.whatsappAccount.findFirst({
            where: {
                phoneNumbers: {
                    path: ['id'],
                    equals: phoneNumberId,
                },
            },
        });
        if (!account) {
            throw new common_1.BadRequestException('Phone number ID não encontrado nas contas vinculadas');
        }
        const accessToken = this.aesService.decrypt(account.userAccessToken, encryptionKey, account.tokenIv, account.tokenAuthTag);
        const isOutside24h = dto._24h_window === false;
        if (dto.type !== 'template' && isOutside24h) {
            throw new common_1.BadRequestException('Mensagens fora da janela de 24h devem usar templates. Use o tipo template ou garanta que está dentro da janela.');
        }
        const payload = { ...dto };
        delete payload._24h_window;
        try {
            const response = await this.httpService
                .post(`https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`, payload, {
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
            const message = error?.response?.data?.error?.message || 'Erro ao enviar mensagem para Meta';
            const status = error?.response?.status || common_1.HttpStatus.BAD_GATEWAY;
            throw new common_1.HttpException(message, status);
        }
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService,
        prisma_service_1.PrismaService,
        aes_256_gcm_service_1.Aes256GcmService])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map