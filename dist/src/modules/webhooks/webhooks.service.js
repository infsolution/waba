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
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
let WebhooksService = class WebhooksService {
    constructor(configService) {
        this.configService = configService;
        this.allowedEvents = new Set([
            'messages',
            'message_status',
            'message_template_status_update',
            'phone_number_name_update',
            'account_update',
        ]);
    }
    verify(mode, verifyToken, challenge, req, res) {
        const expectedToken = this.configService.get('meta.appSecret');
        if (mode === 'subscribe' && verifyToken === expectedToken) {
            res.status(common_1.HttpStatus.OK).send(challenge);
        }
        else {
            res.status(common_1.HttpStatus.FORBIDDEN).send('Forbidden');
        }
    }
    async handle(req, res) {
        const appSecret = this.configService.get('meta.appSecret');
        const signature = req.headers['x-hub-signature-256'];
        if (!signature || !signature.startsWith('sha256=')) {
            throw new common_1.HttpException('X-Hub-Signature-256 ausente ou inválido', common_1.HttpStatus.UNAUTHORIZED);
        }
        const payload = JSON.stringify(req.body);
        const expectedSignature = 'sha256=' + crypto.createHmac('sha256', appSecret).update(payload).digest('hex');
        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            throw new common_1.HttpException('Assinatura inválida', common_1.HttpStatus.UNAUTHORIZED);
        }
        const body = req.body;
        const entries = body?.entry || [];
        for (const entry of entries) {
            const events = entry?.events || [];
            for (const event of events) {
                const eventType = event?.field;
                if (!eventType || !this.allowedEvents.has(eventType)) {
                    continue;
                }
                const payloadRecord = {
                    eventType,
                    rawPayload: body,
                    wabaId: entry?.id || null,
                    phoneNumberId: event?.messaging_product === 'whatsapp' ? event?.phone_number_id : null,
                    createdAt: new Date(),
                };
            }
        }
        res.status(common_1.HttpStatus.OK).send('EVENT_RECEIVED');
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map