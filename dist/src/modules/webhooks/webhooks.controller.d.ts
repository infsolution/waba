import { Request, Response } from 'express';
import { WebhooksService } from './webhooks.service';
export declare class WebhooksController {
    private readonly webhooksService;
    constructor(webhooksService: WebhooksService);
    verify(req: Request, mode: string, verifyToken: string, challenge: string, res: Response): void;
    receive(req: Request, res: Response): Promise<void>;
}
