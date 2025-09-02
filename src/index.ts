import fs from "fs";
import path from "path";
import { promises as fsp } from "fs";
import { TemplateMap } from "./types";
import * as readline from "readline";

async function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function replaceInTemplate(
  content: string,
  oldName: string,
  newName: string
): string {
  // Capitalize first letter for class names
  const capitalizedOld = oldName.charAt(0).toUpperCase() + oldName.slice(1);
  const capitalizedNew = newName.charAt(0).toUpperCase() + newName.slice(1);

  // Replace all occurrences
  return content
    .replace(new RegExp(capitalizedOld, "g"), capitalizedNew)
    .replace(new RegExp(oldName, "g"), newName);
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
      } else if (e.isFile() && e.name.endsWith(".ts")) {
        const content = await fsp.readFile(abs, "utf8");
        out[r] = content;
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
      console.log("Templates copied successfully for build");
    } catch (error) {
      console.error("Error copying templates:", error);
    }
  }
}

function usage() {
  console.log("Usage: nest-gen <jwt|crud|all> [--target <path>]");
  console.log("Commands:");
  console.log("  jwt   - Generate JWT auth module");
  console.log("  crud  - Generate CRUD module");
  console.log("  all   - Generate both auth and crud modules");
  console.log("Options:");
  console.log(
    "  --target <path>  - Target directory (defaults to current directory)"
  );
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
            `No --target provided and running inside generator repo; using default target: ${defaultTarget}`
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
    options: { oldName?: string; newName?: string } = {}
  ) {
    for (const [relPath, content] of Object.entries(templates)) {
      let finalContent = String(content);
      let finalPath = relPath;

      // If we have replacement options, apply them
      if (options.oldName && options.newName) {
        finalContent = replaceInTemplate(
          finalContent,
          options.oldName,
          options.newName
        );
        finalPath = relPath.replace(
          new RegExp(options.oldName, "g"),
          options.newName
        );
      }

      const filePath = path.join(projectSrc, finalPath);
      const dir = path.dirname(filePath);
      await ensureDir(dir);
      if (fs.existsSync(filePath)) {
        console.log(`Skipped ${filePath} (already exists)`);
        continue;
      }
      await fsp.writeFile(filePath, finalContent, "utf8");
      console.log(`Created ${filePath}`);
    }
  }

  // Create modules directory structure for index exports
  async function createModuleIndex(moduleName: string, exports: string[]) {
    // Removed - no longer creating module index files
  }

  if (cmd === "jwt") {
    await writeTemplates(authTemplates);

    const modified = await insertImportToAppModule(projectSrc, [
      {
        line: `import { AuthModule } from './auth/auth.module';`,
        name: "AuthModule",
      },
    ]);
    if (modified)
      console.log("Updated app.module to import AuthModule (if present).");
    else
      console.log(
        "No app.module found or could not modify it. Add AuthModule import manually."
      );

    console.log("JWT template generation complete.");
    process.exit(0);
  }

  if (cmd === "crud") {
    const moduleName = await askQuestion("Write the crud name: ");
    if (!moduleName) {
      console.log("Module name is required!");
      process.exit(1);
    }

    await writeTemplates(crudTemplates, {
      oldName: "crud",
      newName: moduleName,
    });

    const capitalizedName =
      moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
    const modified = await insertImportToAppModule(projectSrc, [
      {
        line: `import { ${capitalizedName}Module } from './${moduleName}/${moduleName}.module';`,
        name: `${capitalizedName}Module`,
      },
    ]);
    if (modified)
      console.log(
        `Updated app.module to import ${capitalizedName}Module (if present).`
      );
    else
      console.log(
        `No app.module found or could not modify it. Add ${capitalizedName}Module import manually.`
      );

    console.log(`${capitalizedName} template generation complete.`);
    process.exit(0);
  }

  if (cmd === "all" || cmd === "generate") {
    // Generate JWT auth templates
    await writeTemplates(authTemplates);

    // Ask for CRUD module name
    const crudModuleName = await askQuestion("Write the crud name: ");
    if (!crudModuleName) {
      console.log("CRUD module name is required!");
      process.exit(1);
    }

    // Generate CRUD templates with custom name
    await writeTemplates(crudTemplates, {
      oldName: "crud",
      newName: crudModuleName,
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
        `Updated app.module to import AuthModule and ${capitalizedCrudName}Module (if present).`
      );
    else
      console.log(
        "No app.module found or could not modify it. Add imports manually."
      );

    console.log("All templates generation complete.");
    process.exit(0);
  }

  usage();
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
