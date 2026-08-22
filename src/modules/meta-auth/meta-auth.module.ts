import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MetaAuthController } from './meta-auth.controller';
import { MetaAuthService } from './meta-auth.service';
import { PrismaModule } from '../../config/prisma.module';
import { EncryptionModule } from '../../common/encryption/encryption.module';

@Module({
  imports: [HttpModule, PrismaModule, EncryptionModule],
  controllers: [MetaAuthController],
  providers: [MetaAuthService],
  exports: [MetaAuthService],
})
export class MetaAuthModule {}
