import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import type { AuthedRequest } from "../auth/auth.guard.js";
import { ChatService } from "./chat.service.js";

@Controller("conversations")
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post()
  create(@Req() req: AuthedRequest, @Body() body: { title?: string }) {
    return this.chat.createConversation(req.chatAuth!, body?.title);
  }

  @Get()
  list(@Req() req: AuthedRequest) {
    return { items: this.chat.listConversations(req.chatAuth!) };
  }

  @Get(":id/messages")
  messages(@Req() req: AuthedRequest, @Param("id") id: string) {
    return { items: this.chat.getMessages(req.chatAuth!, id) };
  }

  @Post(":id/messages")
  async postMessage(
    @Req() req: AuthedRequest,
    @Res() res: Response,
    @Param("id") id: string,
    @Body() body: { content?: string },
  ) {
    const content = body?.content?.trim();
    if (!content) {
      res.status(400).json({
        type: "about:blank",
        title: "Bad Request",
        status: 400,
        detail: "content is required",
      });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    if (typeof res.flushHeaders === "function") res.flushHeaders();

    try {
      for await (const evt of this.chat.streamUserMessage(
        req.chatAuth!,
        id,
        content,
      )) {
        res.write(`event: ${evt.event}\ndata: ${JSON.stringify(evt.data)}\n\n`);
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : "stream failed";
      res.write(`event: error\ndata: ${JSON.stringify({ detail })}\n\n`);
    }
    res.end();
  }
}
