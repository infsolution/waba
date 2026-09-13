import { Controller, Get, Post, Query, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { WebhooksService } from './webhooks.service';

@Controller()
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get('webhooks/meta')
  @HttpCode(HttpStatus.OK)
  verify(
    @Req() req: Request,
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    return this.webhooksService.verify(mode, verifyToken, challenge, req, res);
  }

  @Post('webhooks/meta')
  @HttpCode(HttpStatus.OK)
  receive(@Req() req: Request, @Res() res: Response) {
    return this.webhooksService.handle(req, res);
  }
}
