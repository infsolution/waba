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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaAuthController = void 0;
const common_1 = require("@nestjs/common");
const exchange_code_dto_1 = require("./dto/exchange-code.dto");
const meta_auth_service_1 = require("./meta-auth.service");
let MetaAuthController = class MetaAuthController {
    constructor(metaAuthService) {
        this.metaAuthService = metaAuthService;
    }
    exchangeCode(dto) {
        return this.metaAuthService.exchangeCode(dto);
    }
};
exports.MetaAuthController = MetaAuthController;
__decorate([
    (0, common_1.Post)('auth/exchange-code'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exchange_code_dto_1.ExchangeCodeDto]),
    __metadata("design:returntype", void 0)
], MetaAuthController.prototype, "exchangeCode", null);
exports.MetaAuthController = MetaAuthController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [meta_auth_service_1.MetaAuthService])
], MetaAuthController);
//# sourceMappingURL=meta-auth.controller.js.map