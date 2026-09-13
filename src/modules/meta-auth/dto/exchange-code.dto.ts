import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class ExchangeCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  waba_id?: string;
}
