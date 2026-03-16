import inquirer from "inquirer";
import kleur from "kleur";
import { readJson, saveState, makeListItem } from "../core/state.js";
import { SpecFlowState, SpecFlowConfig } from "../core/types.js";
import { generateArtifacts } from "../core/artifacts.js";
import { runLLM } from "../core/llm.js";

export async function runAsk() {
  const state = await readJson<SpecFlowState>("state.json");
  if (!state) {
    console.log(
      kleur.red("No SpecFlow project found. Run `specflow init` first."),
    );
    return;
  }

  const config = await readJson<SpecFlowConfig>("config.json");

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
    {
      type: "confirm",
      name: "autoAnswer",
      message: "Let the configured AI provider suggest an answer?",
      default: true,
      when: () => Boolean(config),
    },
  ];

  const answers = await inquirer.prompt<{
    openQuestion: string;
    priority: string;
    autoAnswer?: boolean;
  }>(questions);

  let aiResponse: string | undefined;
  if (answers.autoAnswer && config) {
    try {
      const response = await runLLM(
        config.provider,
        config.model,
        answers.openQuestion,
        {
          temperature: config.temperature,
        },
      );
      aiResponse = response.text.trim();

      console.log(kleur.green("\n✅ AI response (first 500 chars):"));
      console.log(kleur.gray(aiResponse.slice(0, 500)));
      if (aiResponse.length > 500) {
        console.log(kleur.gray("... (truncated)"));
      }
      console.log("");
    } catch (error) {
      console.log(kleur.yellow("Could not generate an AI response:"));
      console.log(kleur.yellow((error as Error).message));
    }
  }

  state.openQuestions = state.openQuestions ?? [];
  state.openQuestions.push(
    makeListItem({
      title: answers.openQuestion,
      status: "open",
      source: "user",
      tags: ["user"],
      priority: answers.priority,
      aiResponse,
    }),
  );

  await saveState(state);
  await generateArtifacts(state);

  console.log(kleur.green("✅ Added open question and regenerated artifacts."));
}
