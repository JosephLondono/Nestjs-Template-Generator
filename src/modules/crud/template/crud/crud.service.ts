// @ts-nocheck
import { Injectable, NotFoundException } from "@nestjs/common";

export interface CrudEntity {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCrudDto {
  name: string;
  description?: string;
}

export interface UpdateCrudDto {
  name?: string;
  description?: string;
}

@Injectable()
export class CrudService {
  private items: CrudEntity[] = [
    {
      id: "1",
      name: "Sample Item 1",
      description: "This is a sample item",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Sample Item 2",
      description: "Another sample item",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  findAll(): CrudEntity[] {
    return this.items;
  }

  findOne(id: string): CrudEntity {
    const item = this.items.find((item) => item.id === id);
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  create(createDto: CreateCrudDto): CrudEntity {
    const newItem: CrudEntity = {
      id: Date.now().toString(),
      ...createDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.push(newItem);
    return newItem;
  }

  update(id: string, updateDto: UpdateCrudDto): CrudEntity {
    const itemIndex = this.items.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    const updatedItem = {
      ...this.items[itemIndex],
      ...updateDto,
      updatedAt: new Date(),
    };

    this.items[itemIndex] = updatedItem;
    return updatedItem;
  }

  remove(id: string): { message: string; id: string } {
    const itemIndex = this.items.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }

    this.items.splice(itemIndex, 1);
    return {
      message: `Item with ID ${id} has been successfully deleted`,
      id,
    };
  }
}
