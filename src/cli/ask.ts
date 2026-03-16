import inquirer from "inquirer";
import kleur from "kleur";
import { readJson, saveState, makeListItem } from "../core/state.js";
import { SpecFlowState } from "../core/types.js";
import { generateArtifacts } from "../core/artifacts.js";

export async function runAsk() {
  const state = await readJson<SpecFlowState>("state.json");
  if (!state) {
    console.log(
      kleur.red("No SpecFlow project found. Run `specflow init` first."),
    );
    return;
  }

  const questions = [
    {
      type: "input",
      name: "openQuestion",
      message:
        "What is the most important unanswered question about your project?",
      validate: (value: string) => (value ? true : "Please type a question."),
    },
    {
      type: "list",
      name: "priority",
      message: "How important is this question?",
      choices: ["high", "medium", "low"],
      default: "high",
    },
  ];

  const answers = await inquirer.prompt<{
    openQuestion: string;
    priority: string;
  }>(questions);

  state.openQuestions = state.openQuestions ?? [];
  state.openQuestions.push(
    makeListItem({
      title: answers.openQuestion,
      status: "open",
      source: "user",
      tags: ["user"],
      priority: answers.priority,
    }),
  );

  await saveState(state);
  await generateArtifacts(state);

  console.log(kleur.green("✅ Added open question and regenerated artifacts."));
}
