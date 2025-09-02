# JL NestJS Generator

A powerful CLI tool to generate NestJS JWT authentication and CRUD templates with **enhanced user experience** by **JosephLondono**.

## ✨ What's New

- 🎨 **Beautiful CLI output** with colors and emojis
- 📄 **Automatic .env.example** generation for JWT configuration
- 🎯 **Smart dependency detection** - shows only what you need
- 💬 **Enhanced user experience** with gratitude messages and clear guidance
- 🔧 **Improved template loading** for configuration files

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

## 📦 Dependencies & Installation

The generator provides **smart dependency detection** that shows only the packages you need based on your chosen modules.

### JWT Authentication Dependencies

When generating JWT auth modules, you'll need these packages:

```bash
# For npm
npm install @nestjs/jwt

# For yarn
yarn add @nestjs/jwt

# For pnpm
pnpm add @nestjs/jwt

# For bun
bun add @nestjs/jwt
```

### CRUD Module Dependencies

CRUD modules use basic NestJS dependencies that are typically already installed:

- `@nestjs/common`
- `@nestjs/core`

### Complete Application Dependencies

When generating both JWT + CRUD modules:

```bash
# For npm
npm install @nestjs/jwt

# For yarn
yarn add @nestjs/jwt

# For pnpm
pnpm add @nestjs/jwt

# For bun
bun add @nestjs/jwt
```

## ✨ Features

### 🔐 JWT Authentication System

Generates a complete JWT authentication:

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
- **📄 .env.example** - Pre-configured environment variables template

### 📊 CRUD Module Generator

Generates customizable CRUD modules with:

- **[name].module.ts** - Module definition
- **[name].service.ts** - Service with full CRUD operations
- **[name].controller.ts** - RESTful controller
- **Optional Authentication** - Choose to include/exclude `@Auth()` decorators

#### Authentication Options:

- **With Auth** (default): All endpoints protected with JWT + roles
- **Without Auth**: Clean CRUD endpoints without authentication

### 🛠️ Enhanced CLI Experience

- ✅ **🎨 Colorful output** with emojis and clear formatting
- ✅ **Interactive prompts** for module names and configuration
- ✅ **Auto-import** modules to `app.module.ts`
- ✅ **Flexible authentication** - optional for CRUD modules
- ✅ **Environment configuration** - automatic `.env.example` generation
- ✅ **Type-safe** TypeScript templates with automatic cleanup
- ✅ **Role-based access control** (User, Admin)
- ✅ **Clean code structure** following NestJS best practices
- ✅ **Gratitude messages** - friendly user experience

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
├── .env.example          # 🆕 Environment configuration template
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

## ⚙️ Environment Configuration

When generating JWT authentication, the CLI automatically creates a `.env.example` file with pre-configured settings:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# App Configuration
PORT=3000
NODE_ENV=development
```

### Quick Setup:

1. **Copy the template**: `cp .env.example .env`
2. **Update JWT_SECRET**: Replace with a secure random string
3. **Configure as needed**: Adjust port, expiration time, etc.

> 🔒 **Security Tip**: Always use a strong, unique JWT_SECRET in production!

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

## 🎨 CLI Experience

The generator provides a beautiful, user-friendly command line experience:

### 🌈 Visual Features

- **Colorful output** with meaningful colors for different message types
- **Emoji indicators** for quick visual recognition
- **Progress messages** showing each file being created
- **Smart dependency detection** showing only what you need
- **Gratitude messages** for a pleasant development experience

### 📝 Example Output

```bash
🔐 Generating JWT Authentication Module...

✅ Created .env.example
✅ Created auth/auth.controller.ts
✅ Created auth/auth.module.ts
...

🎉 JWT template generation complete!

🔔 IMPORTANT: Install the required dependencies for JWT Authentication:

For npm:
  npm install @nestjs/jwt

🎯 Next steps:
  1. Install the dependencies above
  2. Copy .env.example to .env and configure JWT secrets
  3. Start your NestJS application

🙏 Thank you for using this package. Wishing you productive development with NestJS!
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

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**JosephLondono**

- GitHub: [@JosephLondono](https://github.com/JosephLondono)

---

⭐ If this tool helps you, consider giving it a star on GitHub!
