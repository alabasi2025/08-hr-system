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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateEmploymentDetailsDto } from './dto/create-employment-details.dto';

@Controller('api/v1/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('department_id') departmentId?: string,
    @Query('position_id') positionId?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.employeesService.findAll({
      status,
      department_id: departmentId,
      position_id: positionId,
      search,
      page,
      limit,
    });
  }

  @Get('statistics')
  getStatistics() {
    return this.employeesService.getStatistics();
  }

  @Get('by-number/:employeeNumber')
  findByEmployeeNumber(@Param('employeeNumber') employeeNumber: string) {
    return this.employeesService.findByEmployeeNumber(employeeNumber);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeesService.remove(id);
  }

  // بيانات التوظيف
  @Post(':id/employment-details')
  @HttpCode(HttpStatus.CREATED)
  createEmploymentDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Omit<CreateEmploymentDetailsDto, 'employee_id'>,
  ) {
    return this.employeesService.createEmploymentDetails({
      ...dto,
      employee_id: id,
    } as CreateEmploymentDetailsDto);
  }

  @Patch(':id/employment-details')
  updateEmploymentDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateEmploymentDetailsDto>,
  ) {
    return this.employeesService.updateEmploymentDetails(id, dto);
  }
}
