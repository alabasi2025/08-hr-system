import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto, UpdateLoanDto, ApproveLoanDto } from './dto/create-loan.dto';

@Controller('api/v1/loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  create(@Body() dto: CreateLoanDto) {
    return this.loansService.create(dto);
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('employee_id') employeeId?: string) {
    return this.loansService.findAll(status, employeeId);
  }

  @Get('stats')
  getStats() {
    return this.loansService.getStats();
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.loansService.findByEmployee(employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() dto: ApproveLoanDto) {
    return this.loansService.approve(id, undefined, dto.notes);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.loansService.reject(id, reason);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLoanDto) {
    return this.loansService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loansService.remove(id);
  }
}
