import { CreateTemplateDto, ListTemplatesQuery } from './dto/templates.dto';
import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    list(wabaId: string, query: ListTemplatesQuery): Promise<{
        success: boolean;
        data: any;
    }>;
    create(wabaId: string, dto: CreateTemplateDto): Promise<{
        success: boolean;
        data: any;
    }>;
}
