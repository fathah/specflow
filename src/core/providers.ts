export type ProviderKey =
  | "local"
  | "openai"
  | "openrouter"
  | "gemini"
  | "ollama"
  | "anthropic";

export type ProviderOption = {
  name: string;
  value: ProviderKey;
};

export const providerOptions: ProviderOption[] = [
  { name: "None / Local (no API)", value: "local" },
  { name: "OpenAI", value: "openai" },
  { name: "OpenRouter", value: "openrouter" },
  { name: "Gemini", value: "gemini" },
  { name: "Ollama", value: "ollama" },
  { name: "Anthropic", value: "anthropic" },
];

export const providerModels: Record<ProviderKey, string[]> = {
  local: ["none"],

  openai: ["gpt-5.1", "gpt-5.1-mini", "gpt-4o-mini"],

  openrouter: [
    "openai/gpt-5.1",
    "openai/gpt-4o-mini",
    "openai/gpt-4o",
    "anthropic/claude-4.5-opus",
    "anthropic/claude-4.5-sonnet",
    "google/gemini-3.1-pro",
    "meta-llama/llama-3-70b-instruct",
  ],

  gemini: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-3.1-pro"],

  ollama: ["llama3", "llama3:70b"],

  anthropic: [
    "claude-4.6-opus",
    "claude-4.5-opus",
    "claude-4.5-sonnet",
    "claude-4.5-haiku",
  ],
};

export const defaultProvider: ProviderKey = "local";
export const defaultModel = providerModels[defaultProvider][0];
