import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
export declare class WebhooksService {
    private readonly configService;
    private readonly allowedEvents;
    constructor(configService: ConfigService);
    verify(mode: string, verifyToken: string, challenge: string, req: Request, res: Response): void;
    handle(req: Request, res: Response): Promise<void>;
}
