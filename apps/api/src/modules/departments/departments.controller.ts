import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('api/v1/departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.departmentsService.findAll(includeInactive === 'true');
  }

  @Get('hierarchy')
  getHierarchy() {
    return this.departmentsService.getHierarchy();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.remove(id);
  }
}
