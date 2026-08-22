import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { PrismaModule } from '../../config/prisma.module';
import { EncryptionModule } from '../../common/encryption/encryption.module';

@Module({
  imports: [HttpModule, PrismaModule, EncryptionModule],
  controllers: [WhatsappController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
