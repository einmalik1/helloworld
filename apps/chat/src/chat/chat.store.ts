import { randomUUID } from "node:crypto";

export type StoredMessage = {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  createdAt: string;
};

export type StoredConversation = {
  id: string;
  ownerPersonId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
};

/** In-memory until Drizzle migrate wires schema.sql conversation/message tables. */
export class ChatStore {
  private conversations = new Map<string, StoredConversation>();
  private messages = new Map<string, StoredMessage[]>();

  createConversation(ownerPersonId: string, title?: string | null): StoredConversation {
    const now = new Date().toISOString();
    const c: StoredConversation = {
      id: randomUUID(),
      ownerPersonId,
      title: title ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(c.id, c);
    this.messages.set(c.id, []);
    return c;
  }

  listConversations(ownerPersonId: string): StoredConversation[] {
    return [...this.conversations.values()]
      .filter((c) => c.ownerPersonId === ownerPersonId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  getConversation(id: string): StoredConversation | undefined {
    return this.conversations.get(id);
  }

  listMessages(conversationId: string): StoredMessage[] {
    return [...(this.messages.get(conversationId) ?? [])].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
  }

  appendMessage(
    conversationId: string,
    role: StoredMessage["role"],
    content: string,
  ): StoredMessage {
    const msg: StoredMessage = {
      id: randomUUID(),
      conversationId,
      role,
      content,
      createdAt: new Date().toISOString(),
    };
    const list = this.messages.get(conversationId) ?? [];
    list.push(msg);
    this.messages.set(conversationId, list);
    const c = this.conversations.get(conversationId);
    if (c) {
      c.updatedAt = msg.createdAt;
      this.conversations.set(conversationId, c);
    }
    return msg;
  }
}
