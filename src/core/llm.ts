import { ProviderKey } from "./providers.js";

export type LLMOptions = {
  temperature?: number;
  maxTokens?: number;
  reasoning?: boolean;
  systemPrompt?: string;
};

export type LLMResponse = {
  text: string;
  raw: unknown;
  reasoningDetails?: unknown;
};

function makeSafeText(text: unknown) {
  if (typeof text === "string") return text;
  try {
    return JSON.stringify(text, null, 2);
  } catch {
    return String(text);
  }
}

async function parseJsonResponse(
  res: Response,
): Promise<{ json: any; text: string }> {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return { json, text };
  } catch {
    return { json: null, text };
  }
}

export async function runLLM(
  provider: ProviderKey | string,
  model: string,
  prompt: string,
  options: LLMOptions = {},
): Promise<LLMResponse> {
  const temperature = options.temperature ?? 0.2;
  const maxTokens = options.maxTokens ?? 1024;

  // If the user chose the local provider, just return a placeholder.
  if (provider === "local" || !provider) {
    return {
      text: "[local provider selected] No remote API call was made. Configure a cloud provider to enable AI responses.",
      raw: null,
    };
  }

  const systemPrompt =
    options.systemPrompt ??
    `You are an AI assistant that helps developers refine requirements and answer open questions.`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt },
  ];

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not set. Set it in your environment to use OpenAI.",
      );
    }

    const url = "https://api.openai.com/v1/chat/completions";
    const body = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const { json, text: rawText } = await parseJsonResponse(res);
    if (!res.ok) {
      const safeBody = json ? makeSafeText(json) : rawText.slice(0, 1000);
      throw new Error(
        `OpenAI request failed: ${res.status} ${res.statusText} - ${safeBody}`,
      );
    }

    if (!json) {
      throw new Error(
        `OpenAI response was not JSON. Raw response:
${rawText.slice(0, 1000)}`,
      );
    }

    const text = (json.choices?.[0]?.message?.content as string) ?? "";
    return { text, raw: json };
  }

  if (provider === "openrouter") {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is not set. Set it in your environment to use OpenRouter.",
      );
    }

    const url = "https://openrouter.ai/api/v1/chat/completions";
    const body = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      reasoning: { enabled: options.reasoning ?? true },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const { json, text: rawText } = await parseJsonResponse(res);
    if (!res.ok) {
      const safeBody = json ? makeSafeText(json) : rawText.slice(0, 1000);
      throw new Error(
        `OpenRouter request failed: ${res.status} ${res.statusText} - ${safeBody}`,
      );
    }

    if (!json) {
      throw new Error(
        `OpenRouter response was not JSON. Raw response:
${rawText.slice(0, 1000)}`,
      );
    }

    const message = json.choices?.[0]?.message ?? {};
    const text = (message?.content as string) ?? "";
    const reasoningDetails = (message as any)?.reasoning_details;

    return { text, raw: json, reasoningDetails };
  }

  if (provider === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Set it in your environment to use Anthropic.",
      );
    }

    const url = "https://api.anthropic.com/v1/chat/completions";
    const body = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const { json, text: rawText } = await parseJsonResponse(res);
    if (!res.ok) {
      const safeBody = json ? makeSafeText(json) : rawText.slice(0, 1000);
      throw new Error(
        `Anthropic request failed: ${res.status} ${res.statusText} - ${safeBody}`,
      );
    }

    if (!json) {
      throw new Error(
        `Anthropic response was not JSON. Raw response:
${rawText.slice(0, 1000)}`,
      );
    }

    const text = (json.completion ?? "") as string;
    return { text, raw: json };
  }

  if (provider === "ollama") {
    const endpoint = process.env.OLLAMA_API_URL ?? "http://localhost:11434";
    const url = `${endpoint.replace(/\/+$/, "")}/v1/chat/completions`;

    const body = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const { json, text: rawText } = await parseJsonResponse(res);
    if (!res.ok) {
      const safeBody = json ? makeSafeText(json) : rawText.slice(0, 1000);
      throw new Error(
        `Ollama request failed: ${res.status} ${res.statusText} - ${safeBody}`,
      );
    }

    if (!json) {
      throw new Error(
        `Ollama response was not JSON. Raw response:
${rawText.slice(0, 1000)}`,
      );
    }

    const text = (json?.choices?.[0]?.message?.content as string) ?? "";
    return { text, raw: json };
  }

  if (provider === "gemini") {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GOOGLE_API_KEY is not set. Set it in your environment to use Gemini.",
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta2/models/${encodeURIComponent(
      model,
    )}:generateText`;

    const geminiPrompt = `${systemPrompt}\n\n${prompt}`;

    const body = {
      temperature,
      prompt: {
        text: geminiPrompt,
      },
      maxOutputTokens: maxTokens,
    };

    const res = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const { json, text: rawText } = await parseJsonResponse(res);
    if (!res.ok) {
      const safeBody = json ? makeSafeText(json) : rawText.slice(0, 1000);
      throw new Error(
        `Gemini request failed: ${res.status} ${res.statusText} - ${safeBody}`,
      );
    }

    if (!json) {
      throw new Error(
        `Gemini response was not JSON. Raw response:
${rawText.slice(0, 1000)}`,
      );
    }

    const text = (json?.candidates?.[0]?.content as string) ?? "";
    return { text, raw: json };
  }

  throw new Error(`Unsupported provider: ${provider}`);
}
