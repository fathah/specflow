import fs from "fs/promises";
import path from "path";

const PACKAGE_DOMAIN_TEMPLATES_DIR = path.resolve(
  __dirname,
  "../templates/domains",
);

const PROJECT_DOMAIN_TEMPLATES_DIR = path.resolve(
  process.cwd(),
  ".specflow/domains",
);

export type DomainQuestionTemplate =
  | string
  | {
      question: string;
      aiHint?: string;
    };

export async function loadDomainQuestions(
  domain: string,
): Promise<DomainQuestionTemplate[]> {
  // Project-level overrides take precedence.
  const projectPath = path.join(PROJECT_DOMAIN_TEMPLATES_DIR, `${domain}.json`);
  try {
    const raw = await fs.readFile(projectPath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as DomainQuestionTemplate[];
    }
  } catch {
    // ignore
  }

  // Fall back to shipped templates.
  const packagePath = path.join(PACKAGE_DOMAIN_TEMPLATES_DIR, `${domain}.json`);
  try {
    const raw = await fs.readFile(packagePath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as DomainQuestionTemplate[];
    }
  } catch {
    // ignore
  }

  return [];
}

