# JL NestJS Generator

A powerful CLI tool to generate NestJS JWT authentication and CRUD templates by **JosephLondono**.

## 🚀 Quick Start

No installation required! Use with npx:

```bash
# Generate JWT authentication module
npx jl-nestjs-generator jwt

# Generate CRUD module (interactive prompts)
npx jl-nestjs-generator crud

# Generate both JWT and CRUD modules
npx jl-nestjs-generator all

# Specify target directory
npx jl-nestjs-generator jwt --target ./my-project/src
```

## 📦 Required Dependencies

After running the generator, install the required NestJS dependencies:

### For npm:

```bash
npm install @nestjs/common @nestjs/core @nestjs/jwt class-validator class-transformer bcrypt
npm install --save-dev @types/bcrypt
```

### For yarn:

```bash
yarn add @nestjs/common @nestjs/core @nestjs/jwt class-validator class-transformer bcrypt
yarn add --dev @types/bcrypt
```

### For pnpm:

```bash
pnpm add @nestjs/common @nestjs/core @nestjs/jwt class-validator class-transformer bcrypt
pnpm add --save-dev @types/bcrypt
```

### For bun:

```bash
bun add @nestjs/common @nestjs/core @nestjs/jwt class-validator class-transformer bcrypt
bun add --dev @types/bcrypt
```

## ✨ Features

### 🔐 JWT Authentication System

Generates a complete JWT authentication system:

- **auth.module.ts** - Authentication module with JWT configuration
- **auth.service.ts** - Service with user validation and JWT generation
- **auth.controller.ts** - Login endpoint `/auth/login`
- **jwt-auth.guard.ts** - JWT authentication guard
- **jwt-auth.service.ts** - JWT token management service
- **jwt.module.ts** - JWT module configuration
- **jwt.constants.ts** - JWT configuration constants
- **roles.ts** - Role enum (User, Admin)
- **auth.decorator.ts** - Custom `@Auth()` decorator with role support
- **roles.guard.ts** - Role-based authorization guard

### 📊 CRUD Module Generator

Generates customizable CRUD modules with:

- **[name].module.ts** - Module definition
- **[name].service.ts** - Service with full CRUD operations
- **[name].controller.ts** - RESTful controller
- **Optional Authentication** - Choose to include/exclude `@Auth()` decorators

#### Authentication Options:

- **With Auth** (default): All endpoints protected with JWT + roles
- **Without Auth**: Clean CRUD endpoints without authentication

### 🛠️ Smart Features

- ✅ **Interactive prompts** for module names and configuration
- ✅ **Auto-import** modules to `app.module.ts`
- ✅ **Flexible authentication** - optional for CRUD modules
- ✅ **Dependency guidance** - shows required packages to install
- ✅ **Type-safe** TypeScript templates
- ✅ **Role-based access control** (User, Admin)
- ✅ **Clean code structure** following NestJS best practices

## 📋 Usage Examples

### Generate JWT Auth Only

```bash
npx jl-nestjs-generator jwt
```

### Generate CRUD Module (Interactive)

```bash
npx jl-nestjs-generator crud
# Prompts:
# - Module name: users
# - Include @Auth()? (y/N): y
```

### Generate Everything (Auth + CRUD)

```bash
npx jl-nestjs-generator all
# Prompts:
# - CRUD module name: products
# - Include @Auth() in CRUD? (Y/n): y
```

### Custom Target Directory

```bash
npx jl-nestjs-generator all --target ./backend/src
```

## 🏗️ Generated Structure

### JWT Authentication

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   └── roles.ts
├── common/
│   ├── decorators/
│   │   └── auth.decorator.ts
│   └── guards/
│       └── roles.guard.ts
└── jwt/
    ├── index.ts
    ├── jwt-auth.guard.ts
    ├── jwt-auth.service.ts
    ├── jwt.constants.ts
    └── jwt.module.ts
```

### CRUD Module (example: users)

```
src/
└── users/
    ├── users.controller.ts
    ├── users.module.ts
    └── users.service.ts
```

## 🔒 Authentication Flow

1. **Login**: `POST /auth/login` with `{username, password}`
2. **Response**: `{access_token: "jwt_token"}`
3. **Protected Routes**: Add `Authorization: Bearer <token>` header
4. **Role Protection**: Use `@Auth(['Admin'])` for admin-only routes

### Example Usage in Controllers:

```typescript
@Controller("users")
export class UsersController {
  @Get()
  @Auth() // Requires authentication (any role)
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @Auth(["Admin"]) // Requires Admin role
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Delete(":id")
  @Auth(["Admin"]) // Admin only
  remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
```

## 🧑‍💻 Development

```bash
# Clone the repository
git clone https://github.com/JosephLondono/Nestjs-Template-Generator.git
cd Nestjs-Template-Generator

# Install dependencies
npm install

# Build the project
npm run build

# Test locally
npm run dev jwt

# Or test with local project
npm run dev all --target ./test-project
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**JosephLondono**

- GitHub: [@JosephLondono](https://github.com/JosephLondono)

---

⭐ If this tool helps you, consider giving it a star on GitHub!
