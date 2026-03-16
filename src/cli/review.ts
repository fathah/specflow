import kleur from "kleur";
import { readJson } from "../core/state.js";
import { SpecFlowState } from "../core/types.js";

export async function runReview() {
  const state = await readJson<SpecFlowState>("state.json");
  if (!state) {
    console.log(kleur.yellow("No SpecFlow project found. Run `specflow init` first."));
    return;
  }

  const answered = (state.openQuestions ?? []).filter(
    (q) => q.status === "answered" && q.answer,
  );
  const open = (state.openQuestions ?? []).filter(
    (q) => q.status === "open" || q.status === "proposed",
  );

  console.log(kleur.bold("SpecFlow Review"));
  console.log("Project:", kleur.cyan(state.project.name));
  console.log("Description:", state.project.description);
  console.log("Domain:", state.project.domain);

  console.log("");
  console.log(kleur.bold("Question status"));
  console.log(`- Answered: ${kleur.cyan(String(answered.length))}`);
  console.log(`- Open: ${kleur.cyan(String(open.length))}`);
  console.log("");

  if (state.aiQuestionSession?.completedAt) {
    console.log(
      kleur.green(
        `AI session completed at ${new Date(
          state.aiQuestionSession.completedAt,
        ).toLocaleString()}`,
      ),
    );
  } else {
    console.log(kleur.gray("AI session not marked complete (run `specflow ask`)."));
  }

  if (open.length > 0) {
    console.log("");
    console.log(kleur.bold("Open questions (remaining):"));

    open.slice(0, 10).forEach((q, i) => {
      console.log(
        `${i + 1}. ${kleur.bold(q.title)} ${kleur.gray(`(${q.source ?? ""})`)}`,
      );
    });

    if (open.length > 10) {
      console.log(kleur.gray(`...and ${open.length - 10} more`));
    }
  }

  if (answered.length > 0) {
    console.log("");
    console.log(kleur.bold("Recent answers:"));
    answered
      .slice(-10)
      .reverse()
      .forEach((q, i) => {
        console.log(`- ${kleur.bold(q.title)}`);
        console.log(kleur.gray(`  → ${q.answer}`));
      });
  }

  console.log("");
  console.log(
    kleur.gray(
      "Run `specflow questions` to answer templated questions or `specflow ask` to let AI generate follow-ups.",
    ),
  );
}
