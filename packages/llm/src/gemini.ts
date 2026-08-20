import { GoogleGenAI } from "@google/genai";
import {
  LlmUnavailableError,
  extractJson,
  type JsonGenerationInput,
  type LlmProvider,
} from "./provider.js";

export class GeminiProvider implements LlmProvider {
  readonly name = "gemini";
  private client: GoogleGenAI | null = null;
  private readonly model: string;

  constructor(apiKey: string | undefined, model: string) {
    this.model = model;
    if (apiKey && apiKey.trim().length > 0) {
      this.client = new GoogleGenAI({ apiKey: apiKey.trim() });
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async generateJson<T>(input: JsonGenerationInput<T>): Promise<T> {
    if (!this.client) {
      throw new LlmUnavailableError("Gemini API key is not configured");
    }

    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: [
          {
            role: "user",
            parts: [{ text: `${input.system}\n\n${input.user}` }],
          },
        ],
        config: {
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      if (!text) {
        throw new LlmUnavailableError("Gemini returned an empty response");
      }
      const parsed = extractJson(text);
      return input.schema.parse(parsed);
    } catch (error) {
      if (error instanceof LlmUnavailableError) throw error;
      const message = error instanceof Error ? error.message : "Gemini request failed";
      throw new LlmUnavailableError(message, error);
    }
  }
}
