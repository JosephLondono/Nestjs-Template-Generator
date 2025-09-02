import { Injectable } from '@nestjs/common';

@Injectable()
export class CrudService {
  async findAll() {
    return [];
  }

  async findOne(id: string) {
    return null;
  }

  async create(dto: any) {
    return dto;
  }

  async update(id: string, dto: any) {
    return { id, ...dto };
  }

  async remove(id: string) {
    return { id };
  }
}
