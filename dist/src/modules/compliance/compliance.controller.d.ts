import { Request } from 'express';
import { ComplianceService } from './compliance.service';
export declare class ComplianceController {
    private readonly complianceService;
    constructor(complianceService: ComplianceService);
    dataDeletion(req: Request): {
        url: string;
    };
    deauthorize(req: Request): {
        url: string;
    };
}
