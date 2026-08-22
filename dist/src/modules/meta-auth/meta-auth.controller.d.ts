import { ExchangeCodeDto } from './dto/exchange-code.dto';
import { MetaAuthService } from './meta-auth.service';
export declare class MetaAuthController {
    private readonly metaAuthService;
    constructor(metaAuthService: MetaAuthService);
    exchangeCode(dto: ExchangeCodeDto): Promise<{
        success: boolean;
        waba_id: string;
        phone_numbers: any;
    }>;
}
