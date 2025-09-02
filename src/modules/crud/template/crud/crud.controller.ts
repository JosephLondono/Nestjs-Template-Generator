// @ts-nocheck
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CrudService, CreateCrudDto, UpdateCrudDto } from "./crud.service";
import { Auth } from "../common/decorators/auth.decorator";

@Controller("crud")
export class CrudController {
  constructor(private readonly service: CrudService) {}

  @Get()
  @Auth()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return {
      message: "Items retrieved successfully",
      data: this.service.findAll(),
    };
  }

  @Get(":id")
  @Auth()
  @HttpCode(HttpStatus.OK)
  findOne(@Param("id") id: string) {
    return {
      message: "Item retrieved successfully",
      data: this.service.findOne(id),
    };
  }

  @Post()
  @Auth(["Admin"])
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateCrudDto) {
    return {
      message: "Item created successfully",
      data: this.service.create(createDto),
    };
  }

  @Put(":id")
  @Auth(["Admin"])
  @HttpCode(HttpStatus.OK)
  update(@Param("id") id: string, @Body() updateDto: UpdateCrudDto) {
    return {
      message: "Item updated successfully",
      data: this.service.update(id, updateDto),
    };
  }

  @Delete(":id")
  @Auth(["Admin"])
  @HttpCode(HttpStatus.OK)
  remove(@Param("id") id: string) {
    return {
      message: "Item deleted successfully",
      data: this.service.remove(id),
    };
  }
}
