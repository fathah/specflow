import path from "path";
import kleur from "kleur";
import inquirer from "inquirer";
import {
  ensureSpecFlowDir,
  makeListItem,
  nowIso,
  saveConfig,
  saveProject,
  saveState,
  slugify,
} from "../core/state.js";
import {
  SpecFlowConfig,
  SpecFlowProject,
  SpecFlowState,
} from "../core/types.js";
import {
  providerOptions,
  providerModels,
  defaultProvider,
} from "../core/providers.js";
import { generateArtifacts } from "../core/artifacts.js";
import { loadDomainQuestions } from "../core/domainQuestions.js";

export type InitOptions = {
  skipPrompts?: boolean;
};

const DEFAULT_CONFIG: SpecFlowConfig = {
  provider: defaultProvider,
  model: providerModels[defaultProvider][0],
  temperature: 0.2,
  outputFormats: ["json", "md"],
};

function detectDomainFromIdea(idea: string): string {
  const normalized = idea.toLowerCase();
  if (
    normalized.includes("school") ||
    normalized.includes("student") ||
    normalized.includes("teacher")
  ) {
    return "education_erp";
  }
  if (
    normalized.includes("shop") ||
    normalized.includes("cart") ||
    normalized.includes("checkout")
  ) {
    return "ecommerce";
  }
  if (normalized.includes("crm") || normalized.includes("customer")) {
    return "crm";
  }
  if (normalized.includes("pos") || normalized.includes("point of sale")) {
    return "pos";
  }
  return "generic_saas";
}

export async function runInit(options: InitOptions = {}) {
  const skip = options.skipPrompts ?? false;

  await ensureSpecFlowDir();

  console.log(kleur.green("Initializing SpecFlow project..."));

  let projectName = "";
  let description = "";
  let domain = "generic_saas";

  if (skip) {
    projectName = path.basename(process.cwd());
    description = `A project scaffolded by SpecFlow in ${projectName}`;
    domain = detectDomainFromIdea(projectName);

    // Save default config when running non-interactively.
    await saveConfig(DEFAULT_CONFIG);
  } else {
    type InitAnswers = {
      projectName: string;
      description: string;
      domain: string;
      provider: import("../core/providers.js").ProviderKey;
      model: string;
      customModel?: string;
    };

    const answers = await inquirer.prompt<InitAnswers>([
      {
        type: "input",
        name: "projectName",
        message: "What are you building? (project name)",
        default: path.basename(process.cwd()),
        validate: (value: string) =>
          value ? true : "Please enter a project name",
      },
      {
        type: "input",
        name: "description",
        message: "Describe the project in one sentence",
        default: (answers: InitAnswers) =>
          `A project called ${answers.projectName}`,
      },
      {
        type: "list",
        name: "domain",
        message: "Which domain best matches this project?",
        choices: [
          { name: "Generic SaaS", value: "generic_saas" },
          { name: "Education ERP", value: "education_erp" },
          { name: "E-commerce", value: "ecommerce" },
          { name: "CRM", value: "crm" },
          { name: "POS", value: "pos" },
          { name: "Other / Unknown", value: "generic_saas" },
        ],
        default: detectDomainFromIdea(projectName),
      },
      {
        type: "list",
        name: "provider",
        message: "Which AI provider should SpecFlow use for prompts/questions?",
        choices: providerOptions,
        default: defaultProvider,
      },
      {
        type: "list",
        name: "model",
        message: "Which model should SpecFlow use?",
        choices: (answers: InitAnswers) => {
          const list =
            providerModels[answers.provider] ?? providerModels[defaultProvider];
          return [
            ...list.map((m) => ({ name: m, value: m })),
            { name: "Other (enter custom model)", value: "__custom" },
          ];
        },
        default: (answers: InitAnswers) =>
          (providerModels[answers.provider] ??
            providerModels[defaultProvider])[0],
      },
      {
        type: "input",
        name: "customModel",
        message: "Enter custom model name",
        when: (answers: InitAnswers) => answers.model === "__custom",
        validate: (value: string) =>
          value ? true : "Please enter a custom model name.",
      },
    ]);

    const selectedModel =
      answers.model === "__custom" ? answers.customModel! : answers.model;

    projectName = answers.projectName;
    description = answers.description;
    domain = answers.domain;

    // Keep config immutable; create a new config object for saving.
    const updatedConfig: SpecFlowConfig = {
      ...DEFAULT_CONFIG,
      provider: answers.provider,
      model: selectedModel,
    };

    await saveConfig(updatedConfig);
  }

  const now = nowIso();
  const project: SpecFlowProject = {
    name: projectName,
    slug: slugify(projectName),
    domain,
    description,
    createdAt: now,
    updatedAt: now,
  };

  const state: SpecFlowState = {
    project,
    requirements: [],
    decisions: [],
    assumptions: [],
    openQuestions: [],
    rejectedScope: [],
    deferredScope: [],
  };

  // Always include common questions (tech stack, database, deployment, etc.)
  const commonQuestions = await loadDomainQuestions("common");
  const domainQuestions = await loadDomainQuestions(domain);

  for (const questionTemplate of [...commonQuestions, ...domainQuestions]) {
    const hint =
      typeof questionTemplate === "string"
        ? questionTemplate
        : (questionTemplate.aiHint ?? questionTemplate.question);
    const fullQuestion =
      typeof questionTemplate === "string"
        ? questionTemplate
        : questionTemplate.question;

    state.openQuestions.push(
      makeListItem({
        title: fullQuestion,
        fullQuestion,
        aiHint: hint,
        status: "open",
        source: "template",
        tags: ["domain", domain],
      }),
    );
  }

  state.requirements.push(
    makeListItem({
      title: "Initial project idea",
      description,
      status: "confirmed",
      source: "user",
    }),
  );

  await saveProject(project);
  await saveState(state);

  await generateArtifacts(state);

  console.log(kleur.green("✅ SpecFlow setup complete!"));
  console.log(
    kleur.cyan("Generated .specflow/ with initial project artifacts."),
  );
  console.log(kleur.gray("Run `specflow status` to view the current state."));
}
