import { Module } from '@nestjs/common';
import { Aes256GcmService } from './aes-256-gcm.service';

@Module({
  providers: [Aes256GcmService],
  exports: [Aes256GcmService],
})
export class EncryptionModule {}
