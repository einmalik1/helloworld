# nest_dto

Nest `createZodDto` wrappers → `{nest_dto.out_dir}/{resource}/dto/*.dto.ts`.

Imports schemas from `generators.nest_dto.import_types_from` (default `@helloworld/types/api`).  
Requires `nestjs-zod` in `apps/api` when the app is wired.
