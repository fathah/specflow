import fs from "fs/promises";
import path from "path";
import {
  SpecFlowConfig,
  SpecFlowProject,
  SpecFlowState,
  StateListItem,
} from "./types.js";

export const SPECFLOW_DIR = ".specflow";

export function getSpecFlowPath(...segments: string[]) {
  return path.resolve(process.cwd(), SPECFLOW_DIR, ...segments);
}

export async function ensureSpecFlowDir() {
  const dir = path.resolve(process.cwd(), SPECFLOW_DIR);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function nowIso() {
  return new Date().toISOString();
}

export async function readJson<T = unknown>(
  relativePath: string,
): Promise<T | null> {
  try {
    const full = getSpecFlowPath(relativePath);
    const raw = await fs.readFile(full, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJson(relativePath: string, data: unknown) {
  const full = getSpecFlowPath(relativePath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function createEmptyState(project: SpecFlowProject): SpecFlowState {
  return {
    project,
    requirements: [],
    decisions: [],
    assumptions: [],
    openQuestions: [],
    rejectedScope: [],
    deferredScope: [],
  };
}

export async function loadState(): Promise<SpecFlowState | null> {
  return readJson<SpecFlowState>("project.json").then((project) => {
    if (!project) return null;
    return readJson<SpecFlowState>("state.json");
  });
}

export async function loadProject(): Promise<SpecFlowProject | null> {
  return readJson<SpecFlowProject>("project.json");
}

export async function saveProject(project: SpecFlowProject) {
  await writeJson("project.json", project);
}

export async function saveState(state: SpecFlowState) {
  await writeJson("state.json", state);
}

export async function saveConfig(config: SpecFlowConfig) {
  await writeJson("config.json", config);
}

export async function loadConfig(): Promise<SpecFlowConfig | null> {
  return readJson<SpecFlowConfig>("config.json");
}

export function makeListItem(partial: Partial<StateListItem>): StateListItem {
  const now = nowIso();
  return {
    id: partial.id ?? `id_${Math.random().toString(16).slice(2)}`,
    title: partial.title ?? "",
    description: partial.description ?? "",
    status: partial.status ?? "proposed",
    source: partial.source ?? "user",
    tags: partial.tags ?? [],
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
    ...partial,
  };
}
