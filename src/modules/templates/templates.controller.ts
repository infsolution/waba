import { Controller, Get, Post, Param, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CreateTemplateDto, ListTemplatesQuery } from './dto/templates.dto';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller()
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get('waba/:wabaId/templates')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  list(@Param('wabaId') wabaId: string, @Query() query: ListTemplatesQuery) {
    return this.templatesService.list(wabaId, query);
  }

  @Post('waba/:wabaId/templates')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  create(@Param('wabaId') wabaId: string, @Body() dto: CreateTemplateDto) {
    return this.templatesService.create(wabaId, dto);
  }
}
