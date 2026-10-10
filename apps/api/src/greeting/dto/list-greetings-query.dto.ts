import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const listGreetingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  channel_id: z.uuid().optional(),
});

export class ListGreetingsQueryDto extends createZodDto(listGreetingsQuerySchema) {}
