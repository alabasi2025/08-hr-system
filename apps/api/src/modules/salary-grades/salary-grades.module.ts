import { Module } from '@nestjs/common';
import { SalaryGradesService } from './salary-grades.service';
import { SalaryGradesController } from './salary-grades.controller';

@Module({
  controllers: [SalaryGradesController],
  providers: [SalaryGradesService],
  exports: [SalaryGradesService],
})
export class SalaryGradesModule {}
