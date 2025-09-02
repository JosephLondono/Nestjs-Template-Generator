# JL NestJS Generator

A CLI tool to generate NestJS JWT authentication and CRUD templates by **JosephLondono**.

## Installation

```bash
npm install -g jl-nestjs-generator
```

## Usage

```bash
# Generate JWT authentication module
nest-gen jwt

# Generate CRUD module (will ask for module name)
nest-gen crud

# Generate both JWT and CRUD modules
nest-gen all

# Specify target directory
nest-gen jwt --target ./my-project
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

## Development

```bash
# Clone and install
git clone <repository-url>
cd nestjs-template-generator
npm install

# Build
npm run build

# Link for local development
npm link
```

## Author

**JosephLondono**

## License

MIT
