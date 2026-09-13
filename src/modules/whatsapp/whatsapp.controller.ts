import { Controller, Post, Param, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('whatsapp/:phoneNumberId/messages')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  sendMessage(@Param('phoneNumberId') phoneNumberId: string, @Body() dto: SendMessageDto) {
    return this.whatsappService.sendMessage(phoneNumberId, dto);
  }
}
