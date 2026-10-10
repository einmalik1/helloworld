export type LlmMessage = { role: "user" | "assistant" | "system"; content: string };

/** Swappable LLM boundary — stub for local; real providers plug in here. */
export interface LlmAdapter {
  streamReply(history: LlmMessage[]): AsyncIterable<string>;
}

export class StubLlmAdapter implements LlmAdapter {
  async *streamReply(history: LlmMessage[]): AsyncIterable<string> {
    const last = [...history].reverse().find((m) => m.role === "user");
    const echo = last?.content?.trim() || "hello";
    const text = `Stub LLM: you said “${echo}”.`;
    for (const word of text.split(/(\s+)/)) {
      if (!word) continue;
      yield word;
      await new Promise((r) => setTimeout(r, 15));
    }
  }
}

export function createLlmAdapter(): LlmAdapter {
  const provider = (process.env.CHAT_LLM_PROVIDER ?? "stub").toLowerCase();
  if (provider === "stub") return new StubLlmAdapter();
  // Real providers (OpenAI, etc.) register here without changing the web contract.
  return new StubLlmAdapter();
}
