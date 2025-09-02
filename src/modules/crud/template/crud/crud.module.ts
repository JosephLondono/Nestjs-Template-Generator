// @ts-nocheck
import { Module } from "@nestjs/common";
import { CrudController } from "./crud.controller";
import { CrudService } from "./crud.service";
import { JwtModule } from "../jwt/jwt.module";

@Module({
  imports: [JwtModule],
  controllers: [CrudController],
  providers: [CrudService],
  exports: [CrudService],
})
export class CrudModule {}
