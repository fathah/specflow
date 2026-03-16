import fs from "fs/promises";
import path from "path";
import { getSpecFlowPath, writeJson } from "./state.js";
import { SpecFlowState } from "./types.js";

export async function writeMarkdown(relativePath: string, content: string) {
  const full = getSpecFlowPath(relativePath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content.trim() + "\n", "utf8");
}

export function buildArchitectureMd(state: SpecFlowState) {
  const { project, requirements } = state as any;
  const lines: string[] = [];
  lines.push(`# Architecture for ${project.name}`);
  lines.push("");
  lines.push("## Overview");
  lines.push(project.description || "No description provided.");
  lines.push("");
  lines.push("## Key Decisions");
  if (state.decisions.length === 0) {
    lines.push("- _No decisions recorded yet._");
  } else {
    for (const d of state.decisions) {
      lines.push(`- **${d.title}**: ${d.description ?? d.value ?? "TBD"}`);
    }
  }

  lines.push("");
  lines.push("## Core Requirements");
  if (requirements.length === 0) {
    lines.push("- _No requirements recorded yet._");
  } else {
    for (const req of requirements) {
      lines.push(`- ${req.title} (${req.status})`);
    }
  }

  return lines.join("\n");
}

export function buildModulesMd(state: SpecFlowState) {
  const { project } = state as any;
  const lines: string[] = [];
  lines.push(`# Modules for ${project.name}`);
  lines.push("");
  lines.push(
    "_Use this file to document the major modules and their responsibilities._",
  );
  lines.push("");
  lines.push("## Suggested modules");
  lines.push("");
  lines.push("- **Project setup**: project metadata, configuration");
  lines.push("- **Requirements**: user stories and confirmed requirements");
  lines.push("- **Decisions**: architecture/equations decisions");
  lines.push("- **Prompts**: prompt templates for downstream agents");
  lines.push("");
  return lines.join("\n");
}

export function buildEntitiesMd(state: SpecFlowState) {
  const { project } = state as any;
  const lines: string[] = [];
  lines.push(`# Entities for ${project.name}`);
  lines.push("");
  lines.push("_Capture your key domain entities here._");
  lines.push("");
  lines.push("## Example entities");
  lines.push("");
  lines.push("- `User`");
  lines.push("- `Role`");
  lines.push("- `Project`");
  lines.push("");
  return lines.join("\n");
}

export function buildWorkflowsMd(state: SpecFlowState) {
  const { project } = state as any;
  const lines: string[] = [];
  lines.push(`# Workflows for ${project.name}`);
  lines.push("");
  lines.push("_Document the key end-to-end workflows for your project._");
  lines.push("");
  lines.push("## Example workflows");
  lines.push("");
  lines.push("- User signup and onboarding");
  lines.push("- Admin creates a new project / tenant");
  lines.push("- User submits a request and gets notified");
  lines.push("");
  return lines.join("\n");
}

export function buildOpenQuestionsMd(state: SpecFlowState) {
  const lines: string[] = [];
  lines.push("# Open Questions");
  lines.push("");
  lines.push("_Track the open questions that remain unresolved._");
  lines.push("");
  if (!state.openQuestions?.length) {
    lines.push("- _No open questions yet._");
  } else {
    for (const q of state.openQuestions) {
      lines.push(`- **${q.title}** (priority: ${q.priority ?? "unknown"})`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

export function buildPromptTemplateFiles() {
  return {
    "prompts/implement-project.md": `# Implement the Project

You are an AI coding assistant. Use the files under ".specflow/" as the single source of truth for what to build.

- Read ".specflow/project.json" for project metadata.
- Read ".specflow/architecture.md", ".specflow/modules.md", ".specflow/entities.md" for guidance on structure.
- Use ".specflow/requirements.json" to implement the most important requirements first.

Provide a high-level plan first, then generate code in small, testable increments.
`,
    "prompts/generate-schema.md": `# Generate Database Schema

Using the project information in ".specflow/project.json" and the entity descriptions in ".specflow/entities.md", propose a database schema.

Your output should include:

- Tables/collections and their fields
- Primary keys and foreign keys
- Indexes and unique constraints
- Any polymorphic relationships

Do not write application code; focus only on the data model.
`,
    "prompts/build-module.md": `# Build a Module

Use the SpecFlow files under ".specflow/" to implement a single module or feature.

- Identify which requirements the module satisfies.
- Define the key entities and APIs.
- Provide a step-by-step implementation plan.
`,
  };
}

export async function generateArtifacts(state: SpecFlowState) {
  await writeMarkdown("architecture.md", buildArchitectureMd(state));
  await writeMarkdown("modules.md", buildModulesMd(state));
  await writeMarkdown("entities.md", buildEntitiesMd(state));
  await writeMarkdown("workflows.md", buildWorkflowsMd(state));
  await writeMarkdown("open_questions.md", buildOpenQuestionsMd(state));
  await writeJson("requirements.json", state.requirements);
  await writeJson("decisions.json", state.decisions);
  await writeJson("assumptions.json", state.assumptions);
  await writeJson("open_questions.json", state.openQuestions);
  await writeJson("rejected_scope.json", state.rejectedScope);
  await writeJson("deferred_scope.json", state.deferredScope);

  const prompts = buildPromptTemplateFiles();
  for (const [relativePath, content] of Object.entries(prompts)) {
    await writeMarkdown(relativePath, content);
  }
}
