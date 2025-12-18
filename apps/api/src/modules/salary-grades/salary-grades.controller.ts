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
import { SalaryGradesService } from './salary-grades.service';
import { CreateSalaryGradeDto } from './dto/create-salary-grade.dto';
import { UpdateSalaryGradeDto } from './dto/update-salary-grade.dto';
import { CreateSalaryDetailsDto } from './dto/create-salary-details.dto';

@Controller('api/v1')
export class SalaryGradesController {
  constructor(private readonly salaryGradesService: SalaryGradesService) {}

  // سلم الرواتب
  @Post('salary-grades')
  @HttpCode(HttpStatus.CREATED)
  createGrade(@Body() dto: CreateSalaryGradeDto) {
    return this.salaryGradesService.createGrade(dto);
  }

  @Get('salary-grades')
  findAllGrades(@Query('includeInactive') includeInactive?: string) {
    return this.salaryGradesService.findAllGrades(includeInactive === 'true');
  }

  @Get('salary-grades/:id')
  findOneGrade(@Param('id', ParseUUIDPipe) id: string) {
    return this.salaryGradesService.findOneGrade(id);
  }

  @Patch('salary-grades/:id')
  updateGrade(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSalaryGradeDto,
  ) {
    return this.salaryGradesService.updateGrade(id, dto);
  }

  @Delete('salary-grades/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeGrade(@Param('id', ParseUUIDPipe) id: string) {
    return this.salaryGradesService.removeGrade(id);
  }

  // بيانات راتب الموظف
  @Post('employees/:employeeId/salary')
  @HttpCode(HttpStatus.CREATED)
  createSalaryDetails(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() dto: Omit<CreateSalaryDetailsDto, 'employee_id'>,
  ) {
    return this.salaryGradesService.createSalaryDetails({
      ...dto,
      employee_id: employeeId,
    } as CreateSalaryDetailsDto);
  }

  @Get('employees/:employeeId/salary')
  findSalaryDetails(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.salaryGradesService.findSalaryDetails(employeeId);
  }

  @Patch('employees/:employeeId/salary')
  updateSalaryDetails(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() dto: Partial<CreateSalaryDetailsDto>,
  ) {
    return this.salaryGradesService.updateSalaryDetails(employeeId, dto);
  }
}
