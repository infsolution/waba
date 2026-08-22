import { IsString, IsNotEmpty, IsOptional, IsObject, IsArray, IsBoolean } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  components_format?: string;
}

export class ListTemplatesQuery {
  @IsOptional()
  @IsString()
  fields?: string;
}
