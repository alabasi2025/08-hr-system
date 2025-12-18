import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../modules/prisma/prisma.module';
import { EmployeesModule } from '../modules/employees/employees.module';
import { DepartmentsModule } from '../modules/departments/departments.module';
import { PositionsModule } from '../modules/positions/positions.module';
import { SalaryGradesModule } from '../modules/salary-grades/salary-grades.module';
import { PayrollModule } from '../modules/payroll/payroll.module';
import { LoansModule } from '../modules/loans/loans.module';

@Module({
  imports: [
    PrismaModule,
    EmployeesModule,
    DepartmentsModule,
    PositionsModule,
    SalaryGradesModule,
    PayrollModule,
    LoansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
