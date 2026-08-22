import { SendMessageDto } from './dto/send-message.dto';
import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private readonly whatsappService;
    constructor(whatsappService: WhatsappService);
    sendMessage(phoneNumberId: string, dto: SendMessageDto): Promise<{
        success: boolean;
        data: any;
    }>;
}
