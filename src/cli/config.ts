import kleur from "kleur";
import inquirer from "inquirer";
import { readJson, saveConfig } from "../core/state.js";
import { SpecFlowConfig } from "../core/types.js";
import {
  defaultProvider,
  providerModels,
  providerOptions,
} from "../core/providers.js";

export async function runConfig() {
  const config = await readJson<SpecFlowConfig>("config.json");
  if (!config) {
    console.log(
      kleur.yellow(
        "No config found. Run `specflow init` to create the project.",
      ),
    );
    return;
  }

  console.log(kleur.bold("SpecFlow config"));
  console.log(JSON.stringify(config, null, 2));

  const { shouldUpdate } = await inquirer.prompt<{ shouldUpdate: boolean }>([
    {
      type: "confirm",
      name: "shouldUpdate",
      message: "Would you like to update the SpecFlow AI/config settings?",
      default: false,
    },
  ]);

  if (!shouldUpdate) return;

  const providerChoices = providerOptions;
  const providerModelsByProvider = providerModels;

  const answers = await inquirer.prompt<{
    provider: import("../core/providers.js").ProviderKey;
    model: string;
    customModel?: string;
    temperature: number;
  }>([
    {
      type: "list",
      name: "provider",
      message: "Select AI provider:",
      choices: providerChoices,
      default: config.provider ?? defaultProvider,
    },
    {
      type: "list",
      name: "model",
      message: "Select model:",
      choices: (answers: {
        provider: import("../core/providers.js").ProviderKey;
      }) => {
        const list =
          providerModelsByProvider[answers.provider] ??
          providerModelsByProvider[defaultProvider];
        return [
          ...list.map((m) => ({ name: m, value: m })),
          { name: "Other (enter custom model)", value: "__custom" },
        ];
      },
      default: (answers: {
        provider: import("../core/providers.js").ProviderKey;
      }) =>
        (providerModelsByProvider[answers.provider] ??
          providerModelsByProvider[defaultProvider])[0],
    },
    {
      type: "input",
      name: "customModel",
      message: "Enter custom model name",
      when: (answers: any) => answers.model === "__custom",
      validate: (value: string) =>
        value ? true : "Please enter a custom model name.",
    },
    {
      type: "input",
      name: "temperature",
      message: "Model temperature (0-1):",
      default: String(config.temperature ?? 0.2),
      validate: (value: string) => {
        const n = Number(value);
        return !Number.isNaN(n) && n >= 0 && n <= 1
          ? true
          : "Enter a number between 0 and 1.";
      },
      filter: (value: string) => Number(value),
    },
  ]);

  const selectedModel =
    answers.model === "__custom" ? (answers.customModel ?? "") : answers.model;

  await saveConfig({
    ...config,
    provider: answers.provider,
    model: selectedModel,
    temperature: answers.temperature,
  });

  console.log(kleur.green("Config updated!"));
}
