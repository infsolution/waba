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
exports.ComplianceService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ComplianceService = class ComplianceService {
    constructor(configService) {
        this.configService = configService;
        this.confirmationBaseUrl = this.configService.get('COMPLIANCE_CONFIRMATION_URL', 'https://example.com/compliance/confirmation');
    }
    dataDeletion(req) {
        const signedRequest = req.body?.signed_request;
        if (!signedRequest) {
            throw new common_1.HttpException('signed_request é obrigatório', common_1.HttpStatus.BAD_REQUEST);
        }
        const confirmationUrl = `${this.confirmationBaseUrl}?type=data-deletion&user_id=${Date.now()}`;
        return {
            url: confirmationUrl,
        };
    }
    deauthorize(req) {
        const signedRequest = req.body?.signed_request;
        if (!signedRequest) {
            throw new common_1.HttpException('signed_request é obrigatório', common_1.HttpStatus.BAD_REQUEST);
        }
        const confirmationUrl = `${this.confirmationBaseUrl}?type=deauthorize&user_id=${Date.now()}`;
        return {
            url: confirmationUrl,
        };
    }
};
exports.ComplianceService = ComplianceService;
exports.ComplianceService = ComplianceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ComplianceService);
//# sourceMappingURL=compliance.service.js.map