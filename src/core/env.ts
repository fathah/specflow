import fs from "fs";
import path from "path";

const DEFAULT_ENV_PATHS = [
  ".env",
  ".env.local",
  ".specflow/.env",
  "routes/.env",
  "app/.env",
];

function parseDotEnv(content: string) {
  const lines = content.split(/\r?\n/);
  const result: Record<string, string> = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    // Remove surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}

export function loadEnvFilesSync(dir: string = process.cwd()) {
  for (const relativePath of DEFAULT_ENV_PATHS) {
    const fullPath = path.resolve(dir, relativePath);
    if (!fs.existsSync(fullPath)) continue;

    try {
      const raw = fs.readFileSync(fullPath, "utf8");
      const parsed = parseDotEnv(raw);

      for (const [key, value] of Object.entries(parsed)) {
        // Do not overwrite existing environment variables.
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    } catch {
      // Intentionally ignore failures; env loading is best-effort.
    }
  }
}
