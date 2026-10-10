import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { CreatePersonDto, PersonResponseDto, UpdatePersonDto } from "./dto/index.js";
import { ListPersonQueryDto } from "./dto/list-person-query.dto.js";
import { PersonService } from "./person.service.js";

@ApiTags("person")
@Controller("person")
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: PersonResponseDto })
  create(@Body() body: CreatePersonDto) {
    return this.personService.create(body);
  }

  @Get()
  @ApiOkResponse({ description: "Paginated person list" })
  list(@Query() query: ListPersonQueryDto) {
    return this.personService.list(query.page, query.limit);
  }

  @Get(":id")
  @ApiOkResponse({ type: PersonResponseDto })
  getById(@Param("id", ParseUUIDPipe) id: string) {
    return this.personService.getById(id);
  }

  @Patch(":id")
  @ApiOkResponse({ type: PersonResponseDto })
  update(@Param("id", ParseUUIDPipe) id: string, @Body() body: UpdatePersonDto) {
    return this.personService.update(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    await this.personService.remove(id);
  }
}
