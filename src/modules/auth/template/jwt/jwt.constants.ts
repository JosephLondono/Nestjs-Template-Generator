// @ts-nocheck
export const jwtConstants = {
  secret: process.env.JWT_SECRET || "your-secret-key-change-this-in-production",
  expiresIn: process.env.JWT_EXPIRES_IN || "24h",
};
