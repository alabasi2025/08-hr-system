import { PartialType } from '@nestjs/mapped-types';
import { CreateSalaryGradeDto } from './create-salary-grade.dto';

export class UpdateSalaryGradeDto extends PartialType(CreateSalaryGradeDto) {}
