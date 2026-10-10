import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const listGreetingReactionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export class ListGreetingReactionQueryDto extends createZodDto(
  listGreetingReactionQuerySchema,
) {}
