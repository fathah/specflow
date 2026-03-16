import inquirer from "inquirer";
import kleur from "kleur";
import { readJson, saveState, makeListItem } from "../core/state.js";
import { SpecFlowState, SpecFlowConfig, StateListItem } from "../core/types.js";
import { generateArtifacts } from "../core/artifacts.js";
import { runLLM } from "../core/llm.js";
import { runQuestions } from "./questions.js";

export async function runAsk() {
  const state = await readJson<SpecFlowState>("state.json");
  if (!state) {
    console.log(
      kleur.red("No SpecFlow project found. Run `specflow init` first."),
    );
    return;
  }

  const config = await readJson<SpecFlowConfig>("config.json");

  // Ensure the templated domain questions are answered first.
  const openTemplateQuestions = (state.openQuestions ?? []).filter(
    (q) =>
      q.source === "template" &&
      (q.status === "open" || q.status === "proposed"),
  );

  if (openTemplateQuestions.length > 0) {
    console.log(
      kleur.yellow(
        "Please answer the core project questions first (run `specflow questions`) before asking the AI.",
      ),
    );

    const { continueNow } = await inquirer.prompt<{ continueNow: boolean }>([
      {
        type: "confirm",
        name: "continueNow",
        message: "Do you want to answer those questions now?",
        default: true,
      },
    ]);

    if (continueNow) {
      await runQuestions();
    }

    return;
  }

  if (!config) {
    console.log(
      kleur.yellow(
        "No AI config found. Run `specflow config` to set provider/model before using AI questions.",
      ),
    );
    return;
  }

  const projectSummary = [
    `Project: ${state.project.name}`,
    `Domain: ${state.project.domain}`,
    `Description: ${state.project.description}`,
    "",
    "Answered questions:",
  ];

  const answeredQuestions = (state.openQuestions ?? [])
    .filter((q) => q.status === "answered" && q.answer)
    .map((q) => q as StateListItem);

  if (answeredQuestions.length === 0) {
    projectSummary.push("- _(none yet)_");
  } else {
    for (const q of answeredQuestions) {
      projectSummary.push(`- Q: ${q.title}`);
      projectSummary.push(`  A: ${q.answer}`);
    }
  }

  const STOP_SIGNAL = "NO_MORE_QUESTIONS";

  let systemPrompt = `${projectSummary.join("\n")}

You are an AI assistant that asks a single focused follow-up question at a time to help clarify the project requirements. Only ask one question per turn, and keep questions specific and actionable.

If you determine there are no more useful follow-up questions, respond exactly with: ${STOP_SIGNAL}`;

  while (true) {
    let questionText: string;

    try {
      const response = await runLLM(
        config.provider,
        config.model,
        "Generate one follow-up question based on the context above.",
        {
          temperature: config.temperature,
          systemPrompt,
        },
      );

      questionText = response.text.trim();
      if (!questionText) {
        throw new Error("AI did not return a question.");
      }
    } catch (error) {
      console.log(kleur.yellow("Could not generate an AI question:"));
      console.log(kleur.yellow((error as Error).message));
      return;
    }

    // If the AI indicates we're done, stop the session.
    if (questionText.trim().toUpperCase() === STOP_SIGNAL) {
      console.log(kleur.green("✅ AI indicates no more questions are needed."));
      state.aiQuestionSession = {
        completedAt: new Date().toISOString(),
      };
      await saveState(state);
      break;
    }

    const { answer } = await inquirer.prompt<{ answer: string }>([
      {
        type: "input",
        name: "answer",
        message: `AI question: ${questionText}\nYour answer (or type 'exit' to stop):`,
        validate: (value: string) =>
          value ? true : "Please enter an answer or type 'exit'.",
      },
    ]);

    if (answer.trim().toLowerCase() === "exit") {
      console.log(
        kleur.yellow("Stopping. You can continue later with `specflow ask`."),
      );
      break;
    }

    state.openQuestions = state.openQuestions ?? [];
    state.openQuestions.push(
      makeListItem({
        title: questionText,
        aiHint: questionText,
        answer,
        status: "answered",
        source: "ai",
        tags: ["ai"],
      }),
    );

    await saveState(state);
    await generateArtifacts(state);

    console.log(kleur.green("✅ Saved your answer and regenerated artifacts."));

    // Add the newly answered question to the system prompt context for subsequent questions.
    projectSummary.push(`- Q: ${questionText}`);
    projectSummary.push(`  A: ${answer}`);

    systemPrompt = `${projectSummary.join("\n")}

You are an AI assistant that asks a single focused follow-up question at a time to help clarify the project requirements. Only ask one question per turn, and keep questions specific and actionable.

If you determine there are no more useful follow-up questions, respond exactly with: ${STOP_SIGNAL}`;
  }

  // At the end of the session, show a mini log.
  const completedCount = (state.openQuestions ?? []).filter(
    (q) => q.source === "ai" && q.status === "answered",
  ).length;

  if (completedCount > 0) {
    console.log(kleur.bold("\nSession summary:"));
    console.log(
      kleur.gray(
        `(Stored ${completedCount} AI questions/answers into .specflow/open_questions.json)`,
      ),
    );
  }
}
