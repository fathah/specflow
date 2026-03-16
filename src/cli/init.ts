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
import { generateArtifacts } from "../core/artifacts.js";

export type InitOptions = {
  skipPrompts?: boolean;
};

const DEFAULT_CONFIG: SpecFlowConfig = {
  provider: "local",
  model: "none",
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
  } else {
    type InitAnswers = {
      projectName: string;
      description: string;
      domain: string;
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
    ]);

    projectName = answers.projectName;
    description = answers.description;
    domain = answers.domain;
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

  state.requirements.push(
    makeListItem({
      title: "Initial project idea",
      description,
      status: "confirmed",
      source: "user",
    }),
  );

  await saveConfig(DEFAULT_CONFIG);
  await saveProject(project);
  await saveState(state);

  await generateArtifacts(state);

  console.log(kleur.green("✅ SpecFlow setup complete!"));
  console.log(
    kleur.cyan("Generated .specflow/ with initial project artifacts."),
  );
  console.log(kleur.gray("Run `specflow status` to view the current state."));
}
