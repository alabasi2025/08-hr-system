import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Employee,
  CreateEmployeeDto,
  Department,
  CreateDepartmentDto,
  Position,
  CreatePositionDto,
  SalaryGrade,
  CreateSalaryGradeDto,
  SalaryDetails,
  CreateSalaryDetailsDto,
  EmployeeStatistics,
  PaginatedResponse,
} from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'https://3000-i3t940cgyrt8ug1ws2gpz-63e280b7.manusvm.computer/api/v1';

  // ==================== Departments ====================
  getDepartments(includeInactive = false): Observable<Department[]> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<Department[]>(`${this.baseUrl}/departments`, { params });
  }

  getDepartment(id: string): Observable<Department> {
    return this.http.get<Department>(`${this.baseUrl}/departments/${id}`);
  }

  getDepartmentHierarchy(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}/departments/hierarchy`);
  }

  createDepartment(data: CreateDepartmentDto): Observable<Department> {
    return this.http.post<Department>(`${this.baseUrl}/departments`, data);
  }

  updateDepartment(id: string, data: Partial<CreateDepartmentDto>): Observable<Department> {
    return this.http.patch<Department>(`${this.baseUrl}/departments/${id}`, data);
  }

  deleteDepartment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/departments/${id}`);
  }

  // ==================== Positions ====================
  getPositions(departmentId?: string, includeInactive = false): Observable<Position[]> {
    let params = new HttpParams().set('includeInactive', includeInactive.toString());
    if (departmentId) {
      params = params.set('departmentId', departmentId);
    }
    return this.http.get<Position[]>(`${this.baseUrl}/positions`, { params });
  }

  getPosition(id: string): Observable<Position> {
    return this.http.get<Position>(`${this.baseUrl}/positions/${id}`);
  }

  createPosition(data: CreatePositionDto): Observable<Position> {
    return this.http.post<Position>(`${this.baseUrl}/positions`, data);
  }

  updatePosition(id: string, data: Partial<CreatePositionDto>): Observable<Position> {
    return this.http.patch<Position>(`${this.baseUrl}/positions/${id}`, data);
  }

  deletePosition(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/positions/${id}`);
  }

  // ==================== Employees ====================
  getEmployees(filters?: {
    status?: string;
    department_id?: string;
    position_id?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<Employee>> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<PaginatedResponse<Employee>>(`${this.baseUrl}/employees`, { params });
  }

  getEmployee(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/employees/${id}`);
  }

  getEmployeeByNumber(employeeNumber: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/employees/by-number/${employeeNumber}`);
  }

  getEmployeeStatistics(): Observable<EmployeeStatistics> {
    return this.http.get<EmployeeStatistics>(`${this.baseUrl}/employees/statistics`);
  }

  createEmployee(data: CreateEmployeeDto): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseUrl}/employees`, data);
  }

  updateEmployee(id: string, data: Partial<CreateEmployeeDto>): Observable<Employee> {
    return this.http.patch<Employee>(`${this.baseUrl}/employees/${id}`, data);
  }

  deleteEmployee(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/employees/${id}`);
  }

  // ==================== Salary Grades ====================
  getSalaryGrades(includeInactive = false): Observable<SalaryGrade[]> {
    const params = new HttpParams().set('includeInactive', includeInactive.toString());
    return this.http.get<SalaryGrade[]>(`${this.baseUrl}/salary-grades`, { params });
  }

  getSalaryGrade(id: string): Observable<SalaryGrade> {
    return this.http.get<SalaryGrade>(`${this.baseUrl}/salary-grades/${id}`);
  }

  createSalaryGrade(data: CreateSalaryGradeDto): Observable<SalaryGrade> {
    return this.http.post<SalaryGrade>(`${this.baseUrl}/salary-grades`, data);
  }

  updateSalaryGrade(id: string, data: Partial<CreateSalaryGradeDto>): Observable<SalaryGrade> {
    return this.http.patch<SalaryGrade>(`${this.baseUrl}/salary-grades/${id}`, data);
  }

  deleteSalaryGrade(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/salary-grades/${id}`);
  }

  // ==================== Employee Salary ====================
  getEmployeeSalary(employeeId: string): Observable<SalaryDetails> {
    return this.http.get<SalaryDetails>(`${this.baseUrl}/employees/${employeeId}/salary`);
  }

  createEmployeeSalary(employeeId: string, data: CreateSalaryDetailsDto): Observable<SalaryDetails> {
    return this.http.post<SalaryDetails>(`${this.baseUrl}/employees/${employeeId}/salary`, data);
  }

  updateEmployeeSalary(employeeId: string, data: Partial<CreateSalaryDetailsDto>): Observable<SalaryDetails> {
    return this.http.patch<SalaryDetails>(`${this.baseUrl}/employees/${employeeId}/salary`, data);
  }

  // ==================== Payroll ====================
  getPayrolls(year?: number): Observable<any[]> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<any[]>(`${this.baseUrl}/payroll`, { params });
  }

  getPayroll(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/payroll/${id}`);
  }

  getPayrollStats(year?: number): Observable<any> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<any>(`${this.baseUrl}/payroll/stats`, { params });
  }

  createPayroll(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/payroll`, data);
  }

  calculatePayroll(id: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/payroll/${id}/calculate`, {});
  }

  approvePayroll(id: string, notes?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/payroll/${id}/approve`, { notes });
  }

  markPayrollAsPaid(id: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/payroll/${id}/pay`, {});
  }

  deletePayroll(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/payroll/${id}`);
  }

  // ==================== Loans ====================
  getLoans(status?: string, employeeId?: string): Observable<any[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (employeeId) {
      params = params.set('employee_id', employeeId);
    }
    return this.http.get<any[]>(`${this.baseUrl}/loans`, { params });
  }

  getLoan(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/loans/${id}`);
  }

  getLoanStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/loans/stats`);
  }

  getEmployeeLoans(employeeId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/loans/employee/${employeeId}`);
  }

  createLoan(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/loans`, data);
  }

  approveLoan(id: string, notes?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/loans/${id}/approve`, { notes });
  }

  rejectLoan(id: string, reason?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/loans/${id}/reject`, { reason });
  }

  deleteLoan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/loans/${id}`);
  }
}
