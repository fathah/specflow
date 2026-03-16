import kleur from "kleur";
import fs from "fs/promises";
import path from "path";
import { getSpecFlowPath } from "../core/state.js";

export async function runDoctor() {
  const specflowDir = path.resolve(process.cwd(), ".specflow");
  try {
    await fs.access(specflowDir);
  } catch {
    console.log(kleur.red("No .specflow folder found in this directory."));
    console.log("Run `specflow init` to create project artifacts.");
    return;
  }

  const requiredFiles = [
    "config.json",
    "project.json",
    "state.json",
    "architecture.md",
    "modules.md",
  ];

  const missing: string[] = [];
  for (const file of requiredFiles) {
    try {
      await fs.access(getSpecFlowPath(file));
    } catch {
      missing.push(file);
    }
  }

  console.log(kleur.bold("SpecFlow doctor check"));
  if (missing.length === 0) {
    console.log(kleur.green("All required files are present."));
  } else {
    console.log(kleur.yellow("Missing files:"));
    for (const file of missing) {
      console.log("-", file);
    }
    console.log("Run `specflow generate` to regenerate missing artifacts.");
  }
}
