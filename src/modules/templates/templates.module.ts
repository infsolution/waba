import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { PrismaModule } from '../../config/prisma.module';
import { EncryptionModule } from '../../common/encryption/encryption.module';

@Module({
  imports: [HttpModule, PrismaModule, EncryptionModule],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
