# JL NestJS Generator

A CLI tool to generate NestJS JWT authentication and CRUD templates by **JosephLondono**.

## Usage

No installation required! Use with npx:

```bash
# Generate JWT authentication module
npx jl-nestjs-generator jwt

# Generate CRUD module (will ask for module name)
npx jl-nestjs-generator crud

# Generate both JWT and CRUD modules
npx jl-nestjs-generator all

# Specify target directory
npx jl-nestjs-generator jwt --target ./my-project
```

## Features

### JWT Authentication

Generates a complete JWT authentication system:

- `auth.module.ts` - Authentication module
- `auth.service.ts` - Authentication service with user validation
- `auth.controller.ts` - Login endpoint
- `jwt.strategy.ts` - JWT strategy for Passport
- `jwt.constants.ts` - JWT configuration
- `roles.ts` - Role enum (User, Admin)
- `auth.decorator.ts` - Custom Auth decorator with roles
- `jwt-auth.guard.ts` - JWT authentication guard
- `roles.guard.ts` - Role-based authorization guard

### CRUD Module

Generates a customizable CRUD module:

- `[name].module.ts` - Module definition
- `[name].service.ts` - Service with CRUD operations
- `[name].controller.ts` - Controller with protected endpoints

## Examples

```bash
# In any NestJS project directory
npx jl-nestjs-generator jwt

# Create a users CRUD module
echo "users" | npx jl-nestjs-generator crud

# Generate complete auth + products module
echo "products" | npx jl-nestjs-generator all

# Generate in specific directory
npx jl-nestjs-generator jwt --target ./backend/src
```

## Development

```bash
# Clone and install
git clone https://github.com/JosephLondono/Nestjs-Template-Generator.git
cd nestjs-template-generator
npm install

# Build
npm run build

# Test locally
npm run dev
```

## Author

**JosephLondono**

## License

MIT
