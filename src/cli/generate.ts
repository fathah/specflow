import kleur from "kleur";
import { readJson } from "../core/state.js";
import { generateArtifacts } from "../core/artifacts.js";

export async function runGenerate() {
  const state = await readJson("state.json");
  if (!state) {
    console.log(
      kleur.red("No SpecFlow state found. Did you run `specflow init`?"),
    );
    return;
  }

  await generateArtifacts(state as any);
  console.log(kleur.green("✅ Artifacts generated in .specflow/"));
}
