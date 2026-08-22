import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './common/guards/auth.module';
import { PrismaModule } from './config/prisma.module';
import { EncryptionModule } from './common/encryption/encryption.module';
import { MetaAuthModule } from './modules/meta-auth/meta-auth.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { ComplianceModule } from './modules/compliance/compliance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    EncryptionModule,
    AuthModule,
    MetaAuthModule,
    WebhooksModule,
    WhatsappModule,
    TemplatesModule,
    ComplianceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
