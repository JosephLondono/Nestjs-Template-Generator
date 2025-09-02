#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { promises as fsp } from "fs";
import { TemplateMap } from "./types";
import * as readline from "readline";
import chalk from "chalk";

// Function to show thank you message at the end
function showThankYouMessage() {
  console.log(chalk.gray("\n\n"));
  console.log(
    chalk.magenta.bold(
      "🙏 Thank you for using this package. Wishing you productive development with NestJS!"
    )
  );
}

// Function to display dependency installation message
function showDependencyMessage(moduleType: "jwt" | "crud" | "all" = "all") {
  const dependencies = {
    jwt: {
      production: "@nestjs/jwt",
      dev: "",
    },
    crud: {
      production: "",
      dev: "",
    },
    all: {
      production: "@nestjs/jwt",
      dev: "",
    },
  };

  // Don't show message for CRUD only (it uses basic NestJS dependencies)
  if (moduleType === "crud") {
    console.log(
      chalk.cyan("\n� ") +
        chalk.bold.cyan(
          "NOTE: CRUD module uses basic NestJS dependencies that should already be installed.\n"
        )
    );
    return;
  }

  const deps = dependencies[moduleType];
  const moduleTitle =
    moduleType === "jwt" ? "JWT Authentication" : "Complete NestJS Application";

  console.log(
    chalk.cyan("\n🔔 ") +
      chalk.bold.cyan(
        `IMPORTANT: Install the required dependencies for ${moduleTitle}:\n`
      )
  );

  console.log(chalk.yellow.bold("For npm:"));
  console.log(chalk.white(`  npm install ${deps.production}`));
  if (deps.dev) {
    console.log(chalk.white(`  npm install --save-dev ${deps.dev}`));
  }
  console.log();

  console.log(chalk.yellow.bold("For yarn:"));
  console.log(chalk.white(`  yarn add ${deps.production}`));
  if (deps.dev) {
    console.log(chalk.white(`  yarn add --dev ${deps.dev}`));
  }
  console.log();

  console.log(chalk.yellow.bold("For pnpm:"));
  console.log(chalk.white(`  pnpm add ${deps.production}`));
  if (deps.dev) {
    console.log(chalk.white(`  pnpm add --save-dev ${deps.dev}`));
  }
  console.log();

  console.log(chalk.yellow.bold("For bun:"));
  console.log(chalk.white(`  bun add ${deps.production}`));
  if (deps.dev) {
    console.log(chalk.white(`  bun add --dev ${deps.dev}`));
  }
  console.log();

  console.log(
    chalk.red.bold("Don't forget to add these dependencies to your project!")
  );
  console.log(chalk.gray("━".repeat(75)));
  console.log(chalk.green("\n🎯 Next steps:"));
  console.log(chalk.white("  1. Install the dependencies above"));
  if (moduleType === "jwt" || moduleType === "all") {
    console.log(
      chalk.white("  2. Copy .env.example to .env and configure JWT secrets")
    );
    console.log(chalk.white("  3. Start your NestJS application"));
  } else {
    console.log(chalk.white("  2. Start your NestJS application"));
  }
}

async function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(chalk.cyan("❓ ") + chalk.bold(question), (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function replaceInTemplate(
  content: string,
  oldName: string,
  newName: string,
  removeAuth: boolean = false
): string {
  let result = content;

  // Only apply name replacements if they're not dummy values
  if (oldName !== "placeholder" && newName !== "placeholder") {
    // Capitalize first letter for class names
    const capitalizedOld = oldName.charAt(0).toUpperCase() + oldName.slice(1);
    const capitalizedNew = newName.charAt(0).toUpperCase() + newName.slice(1);

    result = result
      .replace(new RegExp(capitalizedOld, "g"), capitalizedNew)
      .replace(new RegExp(oldName, "g"), newName);
  }

  // Remove @Auth() decorators if requested
  if (removeAuth) {
    // Remove import statement for Auth decorator
    result = result.replace(
      /import\s*{\s*Auth\s*}\s*from\s*['"'][^'"]*['"];\s*\n?/g,
      ""
    );

    // Remove @Auth() decorators (with or without parameters)
    result = result.replace(/@Auth\([^)]*\)\s*\n\s*/g, "");
    result = result.replace(/@Auth\(\)\s*\n\s*/g, "");

    // Remove JWT module import from CRUD module if no auth is used
    result = result.replace(
      /import\s*{\s*JwtModule\s*}\s*from\s*['"'][^'"]*['"];\s*\n?/g,
      ""
    );
    result = result.replace(/JwtModule,?\s*/g, "");

    // Clean up empty imports array
    result = result.replace(/imports:\s*\[\s*\],?\s*\n?/g, "");
  }

  return result;
}

async function loadTemplates(baseDir: string): Promise<TemplateMap> {
  const out: TemplateMap = {};
  async function walk(dir: string, rel = "") {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const abs = path.join(dir, e.name);
      const r = rel ? path.join(rel, e.name) : e.name;
      if (e.isDirectory()) {
        await walk(abs, r);
      } else if (e.isFile()) {
        // Include TypeScript files and environment example files
        if (
          e.name.endsWith(".ts") ||
          e.name === ".env.example" ||
          e.name.endsWith(".env.example")
        ) {
          const content = await fsp.readFile(abs, "utf8");
          out[r] = content;
        }
      }
    }
  }
  await walk(baseDir);
  return out;
}

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    await fsp.mkdir(dir, { recursive: true });
  }
}

async function copyTemplatesForBuild() {
  // Only copy templates if we're in development and the source templates exist
  const sourceDir = path.join(__dirname, "..", "src", "modules");
  const destDir = path.join(__dirname, "modules");

  // Check if we're in the compiled version (dist folder) and source exists
  if (__dirname.includes("dist") && fs.existsSync(sourceDir)) {
    async function copyRecursive(src: string, dest: string) {
      const stats = await fsp.stat(src);
      if (stats.isDirectory()) {
        await ensureDir(dest);
        const entries = await fsp.readdir(src);
        for (const entry of entries) {
          await copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
      } else {
        await fsp.copyFile(src, dest);
      }
    }

    try {
      await copyRecursive(sourceDir, destDir);
      console.log(chalk.green("✅ Templates copied successfully for build"));
    } catch (error) {
      console.error(chalk.red("❌ Error copying templates:"), error);
    }
  }
}

function usage() {
  console.log(chalk.bold.blue("\n🚀 JL NestJS Generator"));
  console.log(
    chalk.gray("Generate NestJS JWT authentication and CRUD templates\n")
  );

  console.log(chalk.bold("Usage:"));
  console.log(
    chalk.white("  npx jl-nestjs-generator <jwt|crud|all> [--target <path>]\n")
  );

  console.log(chalk.bold("Commands:"));
  console.log(
    chalk.green("  jwt   ") + chalk.white("- Generate JWT auth module")
  );
  console.log(
    chalk.green("  crud  ") +
      chalk.white("- Generate CRUD module (with optional auth)")
  );
  console.log(
    chalk.green("  all   ") +
      chalk.white("- Generate both auth and crud modules\n")
  );

  console.log(chalk.bold("Options:"));
  console.log(
    chalk.yellow("  --target <path>  ") +
      chalk.white("- Target directory (defaults to current directory)\n")
  );

  console.log(chalk.bold("Features:"));
  console.log(
    chalk.green("  • ") + chalk.white("Interactive prompts for module names")
  );
  console.log(
    chalk.green("  • ") +
      chalk.white("Optional @Auth() decorators for CRUD operations")
  );
  console.log(
    chalk.green("  • ") +
      chalk.white("Automatic dependency detection and installation guide")
  );
  console.log(
    chalk.green("  • ") + chalk.white("Auto-import modules to app.module.ts\n")
  );

  console.log(chalk.bold("Examples:"));
  console.log(chalk.gray("  npx jl-nestjs-generator jwt"));
  console.log(chalk.gray("  npx jl-nestjs-generator crud"));
  console.log(chalk.gray("  npx jl-nestjs-generator all"));
  console.log(chalk.gray("  npx jl-nestjs-generator jwt --target ./src\n"));
}

async function insertImportToAppModule(
  projectSrc: string,
  modulesToAdd?: Array<{ line: string; name: string }>
) {
  const appModulePathTs = path.join(projectSrc, "app.module.ts");
  const appModulePathJs = path.join(projectSrc, "app.module.js");
  const candidate = fs.existsSync(appModulePathTs)
    ? appModulePathTs
    : fs.existsSync(appModulePathJs)
    ? appModulePathJs
    : null;
  if (!candidate) return false;

  let content = await fsp.readFile(candidate, "utf8");

  const importsToAdd: Array<{ line: string; name: string }> = modulesToAdd ?? [
    {
      line: `import { AuthModule } from './auth/auth.module';`,
      name: "AuthModule",
    },
    {
      line: `import { CrudModule } from './crud/crud.module';`,
      name: "CrudModule",
    },
  ];

  // Insert import lines after the last import statement
  for (const imp of importsToAdd) {
    if (!content.includes(imp.line)) {
      const lastImport = content.lastIndexOf("import");
      const insertAt =
        lastImport === -1 ? 0 : content.indexOf("\n", lastImport);
      const pos = insertAt === -1 ? 0 : insertAt + 1;
      content = content.slice(0, pos) + imp.line + "\n" + content.slice(pos);
    }
  }

  // Try to add module names into imports: []
  const importsArrayMatch = content.match(/imports\s*:\s*\[([\s\S]*?)\]/m);
  if (importsArrayMatch) {
    let importsBlock = importsArrayMatch[1];
    for (const imp of importsToAdd) {
      if (!importsBlock.includes(imp.name)) {
        importsBlock = importsBlock.trim().length
          ? importsBlock + `,\n    ${imp.name}`
          : `\n    ${imp.name}`;
      }
    }
    const newImports = `imports: [${importsBlock}\n  ]`;
    content = content.replace(importsArrayMatch[0], newImports);
  } else {
    // Fallback: attempt to inject imports array into @Module({ ... })
    const moduleMatch = content.match(/@Module\((\{[\s\S]*?\})\)/m);
    if (moduleMatch) {
      const moduleObj = moduleMatch[1];
      if (!/imports\s*:\s*\[/.test(moduleObj)) {
        const moduleNames = importsToAdd.map((imp) => imp.name).join(", ");
        const injected = moduleObj.replace(
          /\{/,
          `{\n  imports: [${moduleNames}],`
        );
        content = content.replace(moduleObj, injected);
      }
    }
  }

  await fsp.writeFile(candidate, content, "utf8");
  return true;
}

async function run() {
  // Ensure templates are available in build
  await copyTemplatesForBuild();

  const args = process.argv.slice(2);
  if (args.length === 0) {
    usage();
    process.exit(0);
  }

  // Show help for --help or -h
  if (args.includes("--help") || args.includes("-h")) {
    usage();
    process.exit(0);
  }

  const cmd = args[0];
  const targetFlagIndex = args.indexOf("--target");
  let targetRaw =
    targetFlagIndex !== -1 && args[targetFlagIndex + 1]
      ? args[targetFlagIndex + 1]
      : process.cwd();

  // If user didn't pass --target and we're running inside this generator repo,
  // avoid writing into the generator source. Use ./generate as default target.
  if (targetFlagIndex === -1) {
    try {
      const pkgPath = path.join(targetRaw, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(await fsp.readFile(pkgPath, "utf8"));
        const name = String(pkg.name || "").toLowerCase();
        // heuristic: if package name includes 'generator' or matches this repo, set default to ./generate
        if (name.includes("generator") || name.includes("nestjs-generator")) {
          const defaultTarget = path.join(targetRaw, "generate");
          console.log(
            chalk.yellow(
              "⚠️  No --target provided and running inside generator repo;"
            )
          );
          console.log(
            chalk.yellow(`    using default target: ${defaultTarget}`)
          );
          targetRaw = defaultTarget;
          await ensureDir(targetRaw);
        }
      }
    } catch (e) {
      // ignore and fall back to process.cwd()
    }
  }

  const projectSrc = fs.existsSync(path.join(targetRaw, "src"))
    ? path.join(targetRaw, "src")
    : targetRaw;

  // Load auth templates
  const authTemplateDir = path.join(__dirname, "modules", "auth", "template");
  const authTemplates = await loadTemplates(authTemplateDir);

  // Load crud templates
  const crudTemplateDir = path.join(__dirname, "modules", "crud", "template");
  const crudTemplates = await loadTemplates(crudTemplateDir);

  async function writeTemplates(
    templates: TemplateMap,
    options: { oldName?: string; newName?: string; removeAuth?: boolean } = {}
  ) {
    for (const [relPath, content] of Object.entries(templates)) {
      let finalContent = String(content);
      let finalPath = relPath;

      // Always remove @ts-nocheck from generated files
      finalContent = finalContent.replace(/^\/\/ @ts-nocheck\s*\n?/gm, "");

      // If we have replacement options, apply them
      if (options.oldName && options.newName) {
        finalContent = replaceInTemplate(
          finalContent,
          options.oldName,
          options.newName,
          options.removeAuth || false
        );
        finalPath = relPath.replace(
          new RegExp(options.oldName, "g"),
          options.newName
        );
      } else if (options.removeAuth) {
        // Apply auth removal even without name replacement
        finalContent = replaceInTemplate(
          finalContent,
          "placeholder", // dummy values
          "placeholder",
          true
        );
      }

      const filePath = path.join(projectSrc, finalPath);
      const dir = path.dirname(filePath);
      await ensureDir(dir);
      if (fs.existsSync(filePath)) {
        console.log(chalk.yellow(`⏭️  Skipped ${filePath} (already exists)`));
        continue;
      }
      await fsp.writeFile(filePath, finalContent, "utf8");
      console.log(chalk.green(`✅ Created ${filePath}`));
    }
  }

  // Create modules directory structure for index exports
  async function createModuleIndex(moduleName: string, exports: string[]) {
    // Removed - no longer creating module index files
  }

  if (cmd === "jwt") {
    console.log(
      chalk.blue.bold("\n🔐 Generating JWT Authentication Module...\n")
    );

    await writeTemplates(authTemplates);

    const modified = await insertImportToAppModule(projectSrc, [
      {
        line: `import { AuthModule } from './auth/auth.module';`,
        name: "AuthModule",
      },
    ]);

    if (modified)
      console.log(chalk.green("✅ Updated app.module to import AuthModule"));
    else
      console.log(
        chalk.yellow("⚠️  No app.module found - Add AuthModule import manually")
      );

    console.log(chalk.green.bold("\n🎉 JWT template generation complete!"));
    showDependencyMessage("jwt");
    showThankYouMessage();
    process.exit(0);
  }

  if (cmd === "crud") {
    console.log(chalk.blue.bold("\n📊 Generating CRUD Module...\n"));

    const moduleName = await askQuestion(
      chalk.cyan("📝 Enter the CRUD module name: ")
    );

    const includeAuth = await askQuestion(
      chalk.cyan(
        "❓ Do you want to include authentication (@Auth() decorator)? (y/n): "
      )
    );

    const useAuth =
      includeAuth.toLowerCase() === "y" || includeAuth.toLowerCase() === "yes";

    console.log(
      useAuth
        ? chalk.green("✓ Including authentication decorators")
        : chalk.blue("✓ Generating without authentication")
    );

    await writeTemplates(crudTemplates, {
      oldName: "crud",
      newName: moduleName,
      removeAuth: !useAuth,
    });

    const capitalizedModuleName =
      moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    const modified = await insertImportToAppModule(projectSrc, [
      {
        line: `import { ${capitalizedModuleName}Module } from './${moduleName}/${moduleName}.module';`,
        name: `${capitalizedModuleName}Module`,
      },
    ]);

    if (modified)
      console.log(
        chalk.green(
          `✅ Updated app.module to import ${capitalizedModuleName}Module`
        )
      );
    else
      console.log(
        chalk.yellow(
          `⚠️  No app.module found - Add ${capitalizedModuleName}Module import manually`
        )
      );

    console.log(chalk.green.bold("\n🎉 CRUD template generation complete!"));
    showDependencyMessage("crud");
    showThankYouMessage();
    process.exit(0);
  }

  if (cmd === "all" || cmd === "generate") {
    console.log(
      chalk.blue.bold("\n🚀 Generating Complete NestJS Application...\n")
    );

    console.log(chalk.yellow("📋 Generating JWT Authentication Module..."));
    await writeTemplates(authTemplates);

    console.log(chalk.yellow("\n📋 Generating CRUD Module..."));

    const crudModuleName = await askQuestion(
      chalk.cyan("📝 Enter the CRUD module name: ")
    );

    if (!crudModuleName) {
      console.log(chalk.red("❌ CRUD module name is required!"));
      process.exit(1);
    }

    const includeAuth = await askQuestion(
      chalk.cyan(
        "❓ Do you want to include authentication for CRUD (@Auth() decorator)? (y/n): "
      )
    );

    const useAuth =
      includeAuth.toLowerCase() === "y" || includeAuth.toLowerCase() === "yes";

    console.log(
      useAuth
        ? chalk.green("✓ Including authentication decorators")
        : chalk.blue("✓ Generating without authentication")
    );

    await writeTemplates(crudTemplates, {
      oldName: "crud",
      newName: crudModuleName,
      removeAuth: !useAuth,
    });

    const capitalizedCrudName =
      crudModuleName.charAt(0).toUpperCase() + crudModuleName.slice(1);

    const modified = await insertImportToAppModule(projectSrc, [
      {
        line: `import { AuthModule } from './auth/auth.module';`,
        name: "AuthModule",
      },
      {
        line: `import { ${capitalizedCrudName}Module } from './${crudModuleName}/${crudModuleName}.module';`,
        name: `${capitalizedCrudName}Module`,
      },
    ]);

    if (modified)
      console.log(
        chalk.green(
          `✅ Updated app.module to import AuthModule and ${capitalizedCrudName}Module`
        )
      );
    else
      console.log(
        chalk.yellow("⚠️  No app.module found - Add imports manually")
      );

    console.log(
      chalk.green.bold("\n🎉 Complete application generation finished!")
    );
    console.log(chalk.white("Your NestJS application now includes:"));
    console.log(chalk.green("  • JWT Authentication system"));
    console.log(chalk.green(`  • ${capitalizedCrudName} CRUD module`));
    showDependencyMessage("all");
    showThankYouMessage();
    process.exit(0);
  }

  usage();
}

run().catch((err) => {
  console.error(chalk.red("❌ Error:"), err);
  process.exit(1);
});
