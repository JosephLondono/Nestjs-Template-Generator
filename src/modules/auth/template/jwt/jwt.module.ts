// @ts-nocheck
import { Module } from "@nestjs/common";
import { JwtModule as NestJwtModule } from "@nestjs/jwt";
import { JwtAuthService } from "./jwt-auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { jwtConstants } from "./jwt.constants";

@Module({
  imports: [
    NestJwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  providers: [JwtAuthService, JwtAuthGuard],
  exports: [JwtAuthService, JwtAuthGuard, NestJwtModule],
})
export class JwtModule {}
