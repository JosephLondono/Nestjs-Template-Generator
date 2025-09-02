import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CrudService } from './crud.service';
import { Auth } from '../common/decorators/auth.decorator';

@Controller('crud')
export class CrudController {
  constructor(private readonly service: CrudService) {}

  @Get()
  @Auth()
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  @Auth()
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Post()
  @Auth(['Admin'])
  async create(@Body() body: any) {
    return await this.service.create(body);
  }

  @Put(':id')
  @Auth(['Admin'])
  async update(@Param('id') id: string, @Body() body: any) {
    return await this.service.update(id, body);
  }

  @Delete(':id')
  @Auth(['Admin'])
  async remove(@Param('id') id: string) {
    return await this.service.remove(id);
  }
}
