import kleur from "kleur";
import { readJson } from "../core/state.js";
import { SpecFlowProject, StateListItem } from "../core/types.js";

export async function runStatus() {
  const project = await readJson<SpecFlowProject>("project.json");
  if (!project) {
    console.log(kleur.yellow("No SpecFlow project found in this folder."));
    console.log("Run `specflow init` to begin.");
    return;
  }

  const requirements =
    (await readJson<StateListItem[]>("requirements.json")) ?? [];
  const decisions = (await readJson<StateListItem[]>("decisions.json")) ?? [];
  const openQuestions =
    (await readJson<StateListItem[]>("open_questions.json")) ?? [];

  console.log(kleur.bold("SpecFlow project status"));
  console.log("Project:", kleur.cyan(project.name));
  console.log("Domain:", kleur.cyan(project.domain));
  console.log("Description:", project.description);
  console.log("");

  console.log(kleur.bold("Key stats"));
  console.log("- Requirements:", requirements.length);
  console.log("- Decisions:", decisions.length);
  console.log("- Open questions:", openQuestions.length);
  console.log("");

  if (openQuestions.length > 0) {
    console.log(kleur.bold("Open questions (top 5)"));
    const top = (openQuestions as any[]).slice(0, 5);
    for (const q of top) {
      console.log(`- ${q.title} ${kleur.gray(`(${q.priority ?? "unknown"})`)}`);
    }
    console.log("");
  }

  console.log("To regenerate artifacts, run `specflow generate`.");
}
