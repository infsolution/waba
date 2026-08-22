"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Aes256GcmService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let Aes256GcmService = class Aes256GcmService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 12;
        this.authTagLength = 16;
    }
    encrypt(plaintext, key) {
        const keyHash = crypto.createHash('sha256').update(key).digest();
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(this.algorithm, keyHash, iv);
        cipher.setAAD(Buffer.from('nest-waba', 'utf8'));
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        return {
            ciphertext: encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
        };
    }
    decrypt(ciphertext, key, iv, authTag) {
        const keyHash = crypto.createHash('sha256').update(key).digest();
        const ivBuffer = Buffer.from(iv, 'hex');
        const authTagBuffer = Buffer.from(authTag, 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, keyHash, ivBuffer);
        decipher.setAAD(Buffer.from('nest-waba', 'utf8'));
        decipher.setAuthTag(authTagBuffer);
        let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
};
exports.Aes256GcmService = Aes256GcmService;
exports.Aes256GcmService = Aes256GcmService = __decorate([
    (0, common_1.Injectable)()
], Aes256GcmService);
//# sourceMappingURL=aes-256-gcm.service.js.map