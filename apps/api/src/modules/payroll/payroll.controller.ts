import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';

@Controller('api/v1/payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  create(@Body() dto: CreatePayrollDto) {
    return this.payrollService.create(dto);
  }

  @Get()
  findAll(@Query('year') year?: string) {
    return this.payrollService.findAll(year ? parseInt(year) : undefined);
  }

  @Get('stats')
  getStats(@Query('year') year?: string) {
    return this.payrollService.getStats(year ? parseInt(year) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollService.findOne(id);
  }

  @Post(':id/calculate')
  calculate(@Param('id') id: string) {
    return this.payrollService.calculate(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body('notes') notes?: string) {
    return this.payrollService.approve(id, undefined, notes);
  }

  @Post(':id/pay')
  markAsPaid(@Param('id') id: string) {
    return this.payrollService.markAsPaid(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payrollService.remove(id);
  }
}
