import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject, IsArray } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  messaging_product: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsObject()
  text?: Record<string, any>;

  @IsOptional()
  @IsObject()
  template?: Record<string, any>;

  @IsOptional()
  @IsString()
  recipient_type?: string;

  @IsOptional()
  @IsString()
  preview_url?: string;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  components?: any[];

  @IsOptional()
  @IsBoolean()
  _24h_window?: boolean;
}
