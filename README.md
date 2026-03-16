# SpecFlow

Open-source requirement & architecture engine for AI coding agents.

## Quick start

```bash
npx specflow-cli init
```

OR

This will create a `.specflow/` folder with project intelligence artifacts.

## Commands

- `specflow init` - bootstrap a project and start requirement discovery.
- `specflow status` - show current state of the project.
- `specflow generate` - regenerate artifacts like `architecture.md`, `modules.md`, and JSON state files.
- `specflow ask` - record a new open question and optionally generate an AI response.
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
