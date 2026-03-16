#!/usr/bin/env node

import { Command } from "commander";
import { loadEnvFilesSync } from "./core/env.js";
import { runInit } from "./cli/init.js";
import { runAsk } from "./cli/ask.js";
import { runConfig } from "./cli/config.js";
import { runDoctor } from "./cli/doctor.js";
import { runStatus } from "./cli/status.js";
import { runGenerate } from "./cli/generate.js";
import { version } from "../package.json";

// Load `.env` and common env files (root, .specflow, routes/app) so API keys can
// be stored in a repo's env file rather than requiring users to export them.
loadEnvFilesSync();

const program = new Command();

program
  .name("specflow")
  .description(
    "Open-source requirement & architecture engine for AI coding agents",
  )
  .version(version);

program
  .command("init")
  .description("Initialize SpecFlow in the current project")
  .option("--yes", "Skip prompts and use defaults", false)
  .action(async (opts) => {
    await runInit({ skipPrompts: opts.yes ?? false });
  });

program
  .command("status")
  .description("Show the current SpecFlow project status")
  .action(async () => {
    await runStatus();
  });

program
  .command("generate")
  .description("Generate or regenerate SpecFlow artifacts")
  .action(async () => {
    await runGenerate();
  });

program
  .command("ask")
  .description("Ask a new question to capture open issues")
  .action(async () => {
    await runAsk();
  });

program
  .command("config")
  .description("Show the current SpecFlow configuration")
  .action(async () => {
    await runConfig();
  });

program
  .command("doctor")
  .description("Validate the current SpecFlow project structure")
  .action(async () => {
    await runDoctor();
  });

program.parseAsync(process.argv).catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
