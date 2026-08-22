export declare class SendMessageDto {
    messaging_product: string;
    to: string;
    type: string;
    text?: Record<string, any>;
    template?: Record<string, any>;
    recipient_type?: string;
    preview_url?: string;
    components?: any[];
    _24h_window?: boolean;
}
