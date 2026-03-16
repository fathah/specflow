import inquirer from "inquirer";
import kleur from "kleur";
import { readJson, saveState } from "../core/state.js";
import { SpecFlowState } from "../core/types.js";
import { generateArtifacts } from "../core/artifacts.js";
import { withSpinner } from "../core/spinner.js";

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

  console.log(
    kleur.bold(
      "Answer the following questions to give the AI a better overall view. You can stop anytime by typing 'exit'.",
    ),
  );

  for (const question of openQuestions) {
    const promptText = question.fullQuestion ?? question.title;

    const { answer } = await inquirer.prompt<{ answer: string }>([
      {
        type: "input",
        name: "answer",
        message: `Answer for: ${promptText}`,
        prefix: "",
        transformer: (input: string) => input,
        validate: (value: string) =>
          value && value.trim().toLowerCase() !== "exit"
            ? true
            : "Please enter an answer or type 'exit' to stop.",
      },
    ]);

    if (answer.trim().toLowerCase() === "exit") {
      console.log(
        kleur.yellow(
          "Stopping question flow. You can continue later with `specflow questions`.",
        ),
      );
      break;
    }

    // Once answered, keep only a short hint for the AI.
    const hint = question.aiHint ?? question.fullQuestion ?? question.title;
    question.title = hint;
    question.aiHint = hint;

    // Clean up full question text storage.
    delete question.fullQuestion;
    delete question.description;

    question.answer = answer;
    question.status = "answered";
    question.updatedAt = new Date().toISOString();

    await saveState(state);
    await withSpinner("Regenerating artifacts...", () =>
      generateArtifacts(state),
    );

    console.log(kleur.green("✅ Saved your answer and regenerated artifacts."));
  }
}
