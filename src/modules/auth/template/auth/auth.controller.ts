// @ts-nocheck
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Get,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "../jwt/jwt-auth.guard";

export class LoginDto {
  username: string;
  password: string;
}

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    username: string;
    roles: string[];
  };
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    try {
      const result = await this.authService.loginFromCredentials(
        loginDto.username,
        loginDto.password
      );

      return {
        message: "Login successful",
        ...result,
      };
    } catch (error) {
      return {
        message: "Login failed",
        error: error.message,
      };
    }
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  getProfile(@Request() req: AuthenticatedRequest) {
    return {
      message: "Profile retrieved successfully",
      user: req.user,
    };
  }

  @Post("validate-token")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  validateToken(@Request() req: AuthenticatedRequest) {
    return {
      message: "Token is valid",
      valid: true,
      user: req.user,
    };
  }
}
