**Stop vibe-coding. Start spec-coding.**

AI coding agents like Cursor, Copilot, and Claude Code are powerful — but they build what you _tell_ them, not what you _need_. Without clear requirements, you get half-baked features, missed edge cases, and endless refactoring.

SpecFlow fixes this. It's a CLI that walks you through structured requirement discovery _before_ you write a single line of code. It asks the right questions, captures decisions, and generates a `.specflow/` folder with architecture docs, module breakdowns, and project state — all designed to be fed directly into your AI coding agent as context.

**Think of it as a product manager in your terminal.**

## Quick start

```bash
npx specflow-cli init
```

Install Globally

```bash
npm i -g specflow-cli init
```

This will create a `.specflow/` folder with project intelligence artifacts.

## Commands

- `specflow init` - bootstrap a project and start requirement discovery.
- `specflow status` - show current state of the project.
- `specflow generate` - regenerate artifacts like `architecture.md`, `modules.md`, and JSON state files.
- `specflow questions` - answer templated questions (supports project/domain templates). These should be completed before using `specflow ask`.
- `specflow ask` - lets the AI ask follow-up questions based on the answered templates (AI will use the project summary + answered questions as context). The session ends automatically once the AI indicates it has enough information.
- `specflow config` - show and update your AI provider/model configuration.
- `specflow doctor` - validate the project structure and missing files.

## Configuring AI Providers

SpecFlow can optionally use an AI provider to generate responses when you run `specflow ask`.

1. Run `specflow init` and select your provider + model.
2. Set the required API key in your environment or in an env file:
   - OpenAI: `OPENAI_API_KEY`
   - OpenRouter: `OPENROUTER_API_KEY`
   - Anthropic: `ANTHROPIC_API_KEY`
   - Ollama: (runs locally; no API key required)
   - Gemini: `GOOGLE_API_KEY`

SpecFlow will automatically load env variables from common env files (e.g. `.env`, `.env.local`, `.specflow/.env`, `routes/.env`, `app/.env`) if they exist. If the API key is not set, SpecFlow will still store your questions but won’t call the remote API.

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidance on how to contribute, run the project locally, and submit PRs.
