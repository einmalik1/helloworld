import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { ChatAuth } from "../auth/auth.guard.js";
import { ChatStore } from "./chat.store.js";
import { createLlmAdapter, type LlmAdapter } from "./llm.adapter.js";

@Injectable()
export class ChatService {
  private readonly store = new ChatStore();
  private readonly llm: LlmAdapter = createLlmAdapter();

  createConversation(auth: ChatAuth, title?: string) {
    return this.store.createConversation(auth.personId, title);
  }

  listConversations(auth: ChatAuth) {
    return this.store.listConversations(auth.personId);
  }

  getMessages(auth: ChatAuth, conversationId: string) {
    this.requireOwner(auth, conversationId);
    return this.store.listMessages(conversationId);
  }

  async *streamUserMessage(
    auth: ChatAuth,
    conversationId: string,
    content: string,
  ): AsyncGenerator<{ event: string; data: unknown }> {
    this.requireOwner(auth, conversationId);
    const userMsg = this.store.appendMessage(conversationId, "user", content);
    yield { event: "user_message", data: userMsg };

    const history = this.store.listMessages(conversationId).map((m) => ({
      role: m.role === "tool" ? ("user" as const) : (m.role as "user" | "assistant" | "system"),
      content: m.content,
    }));

    let assistant = "";
    for await (const chunk of this.llm.streamReply(history)) {
      assistant += chunk;
      yield { event: "token", data: { text: chunk } };
    }
    const assistantMsg = this.store.appendMessage(
      conversationId,
      "assistant",
      assistant,
    );
    yield { event: "assistant_message", data: assistantMsg };
    yield { event: "done", data: { conversationId } };
  }

  private requireOwner(auth: ChatAuth, conversationId: string) {
    const c = this.store.getConversation(conversationId);
    if (!c) {
      throw new NotFoundException({
        type: "about:blank",
        title: "Not Found",
        status: 404,
        detail: "Conversation not found",
      });
    }
    if (c.ownerPersonId !== auth.personId) {
      throw new ForbiddenException({
        type: "about:blank",
        title: "Forbidden",
        status: 403,
        detail: "Not the conversation owner",
      });
    }
    return c;
  }
}
