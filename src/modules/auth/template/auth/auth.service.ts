import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Role } from "./roles";

@Injectable()
export class AuthService {
  private users = [
    { id: 1, username: "user", password: "pass", roles: [Role.User] },
    { id: 2, username: "admin", password: "pass", roles: [Role.Admin] },
  ];

  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, pass: string) {
    const user = this.users.find(
      (u) => u.username === username && u.password === pass
    );
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async loginFromCredentials(username: string, password: string) {
    const user = await this.validateUser(username, password);
    if (!user) throw new Error("Invalid credentials");
    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
