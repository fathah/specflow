import kleur from "kleur";
import { readJson } from "../core/state.js";

export async function runConfig() {
  const config = await readJson("config.json");
  if (!config) {
    console.log(
      kleur.yellow(
        "No config found. Run `specflow init` to create the project.",
      ),
    );
    return;
  }

  console.log(kleur.bold("SpecFlow config"));
  console.log(JSON.stringify(config, null, 2));

  // In the future, allow interactive updates.
  console.log("");
  console.log("To update config, edit `.specflow/config.json`.");
}
