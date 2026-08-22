import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly allowedEvents = new Set([
    'messages',
    'message_status',
    'message_template_status_update',
    'phone_number_name_update',
    'account_update',
  ]);

  constructor(private readonly configService: ConfigService) {}

  verify(mode: string, verifyToken: string, challenge: string, req: Request, res: Response) {
    const expectedToken = this.configService.get<string>('meta.appSecret');

    if (mode === 'subscribe' && verifyToken === expectedToken) {
      res.status(HttpStatus.OK).send(challenge);
    } else {
      res.status(HttpStatus.FORBIDDEN).send('Forbidden');
    }
  }

  async handle(req: Request, res: Response) {
    const appSecret = this.configService.get<string>('meta.appSecret');
    const signature = req.headers['x-hub-signature-256'] as string | undefined;

    if (!signature || !signature.startsWith('sha256=')) {
      throw new HttpException('X-Hub-Signature-256 ausente ou inválido', HttpStatus.UNAUTHORIZED);
    }

    const payload = JSON.stringify(req.body);
    const expectedSignature = 'sha256=' + crypto.createHmac('sha256', appSecret).update(payload).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      throw new HttpException('Assinatura inválida', HttpStatus.UNAUTHORIZED);
    }

    const body = req.body as any;
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

        // TODO: Persist payloadRecord in database when persistence is required
        // await this.prismaService.webhookEvent.create({ data: payloadRecord });
      }
    }

    res.status(HttpStatus.OK).send('EVENT_RECEIVED');
  }
}
