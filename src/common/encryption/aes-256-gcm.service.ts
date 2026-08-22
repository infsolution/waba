import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class Aes256GcmService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 12;
  private readonly authTagLength = 16;

  encrypt(plaintext: string, key: string): { ciphertext: string; iv: string; authTag: string } {
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

  decrypt(ciphertext: string, key: string, iv: string, authTag: string): string {
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
}
