import inquirer from "inquirer";
import kleur from "kleur";
import { readJson, saveState } from "../core/state.js";
import { SpecFlowState } from "../core/types.js";
import { generateArtifacts } from "../core/artifacts.js";

export async function runQuestions() {
  const state = await readJson<SpecFlowState>("state.json");
  if (!state) {
    console.log(
      kleur.red("No SpecFlow project found. Run `specflow init` first."),
    );
    return;
  }

  const openQuestions = (state.openQuestions ?? []).filter(
    (q) => q.status === "open" || q.status === "proposed",
  );

  if (openQuestions.length === 0) {
    console.log(kleur.green("✅ No open questions to answer!"));
    return;
  }

  const choices = openQuestions.map((q, idx) => ({
    name: `${(q.fullQuestion ?? q.title).trim()} ${kleur.gray(`(${q.source ?? ""})`)}`.trim(),
    value: idx,
  }));

  const { selectedIndex } = await inquirer.prompt<{ selectedIndex: number }>([
    {
      type: "list",
      name: "selectedIndex",
      message: "Select a question to answer:",
      choices,
    },
  ]);

  const question = openQuestions[selectedIndex];
  const { answer } = await inquirer.prompt<{ answer: string }>([
    {
      type: "input",
      name: "answer",
      message: `Answer for: ${question.fullQuestion ?? question.title}`,
      validate: (value: string) => (value ? true : "Please enter an answer."),
    },
  ]);

  // Once answered, we only need a short hint (idea) for the AI.
  const hint = question.aiHint ?? question.fullQuestion ?? question.title;
  question.title = hint;
  question.aiHint = hint;

  // Clean up the large full question text from disk storage.
  delete question.fullQuestion;
  delete question.description;

  question.answer = answer;
  question.status = "answered";
  question.updatedAt = new Date().toISOString();

  await saveState(state);
  await generateArtifacts(state);

  console.log(kleur.green("✅ Saved your answer and regenerated artifacts."));
}
