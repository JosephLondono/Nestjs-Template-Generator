// @ts-nocheck
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Role } from "../auth/roles";

export interface JwtPayload {
  sub: string;
  username: string;
  roles: Role[];
}

export interface UserRequest {
  userId: string;
  username: string;
  roles: Role[];
}

@Injectable()
export class JwtAuthService {
  constructor(private jwtService: JwtService) {}

  async validateToken(token: string): Promise<UserRequest | null> {
    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token);

      return {
        userId: payload.sub,
        username: payload.username,
        roles: payload.roles,
      };
    } catch {
      return null;
    }
  }

  async generateToken(
    user: Omit<UserRequest, "userId"> & { userId: string }
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: user.userId,
      username: user.username,
      roles: user.roles,
    };

    return this.jwtService.signAsync(payload);
  }
}
