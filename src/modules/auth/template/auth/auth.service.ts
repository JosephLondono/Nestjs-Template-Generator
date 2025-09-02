// @ts-nocheck
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Role } from "./roles";

interface User {
  id: number;
  username: string;
  password: string;
  roles: Role[];
  email?: string;
  isActive: boolean;
}

interface LoginDto {
  username: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    roles: Role[];
    email?: string;
  };
}

@Injectable()
export class AuthService {
  // TODO: Replace with database connection
  private readonly users: User[] = [
    {
      id: 1,
      username: "user",
      password: "password123", // TODO: Hash passwords with bcrypt
      roles: [Role.User],
      email: "user@example.com",
      isActive: true,
    },
    {
      id: 2,
      username: "admin",
      password: "admin123", // TODO: Hash passwords with bcrypt
      roles: [Role.Admin, Role.User],
      email: "admin@example.com",
      isActive: true,
    },
  ];

  constructor(private readonly jwtService: JwtService) {}

  async validateUser(
    username: string,
    password: string
  ): Promise<Omit<User, "password"> | null> {
    const user = this.users.find((u) => u.username === username && u.isActive);

    if (!user) {
      return null;
    }

    // TODO: Use bcrypt.compare(password, user.password) for production
    const isPasswordValid = user.password === password;

    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }

  async loginFromCredentials(
    username: string,
    password: string
  ): Promise<AuthResponse> {
    if (!username || !password) {
      throw new BadRequestException("Username and password are required");
    }

    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.generateAuthResponse(user);
  }

  async login(user: Omit<User, "password">): Promise<AuthResponse> {
    return this.generateAuthResponse(user);
  }

  private async generateAuthResponse(
    user: Omit<User, "password">
  ): Promise<AuthResponse> {
    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
      email: user.email,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        username: user.username,
        roles: user.roles,
        email: user.email,
      },
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
