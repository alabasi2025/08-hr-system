import { Route } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'employees',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./components/employees/employee-list.component').then(
                (m) => m.EmployeeListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./components/employees/employee-form.component').then(
                (m) => m.EmployeeFormComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./components/employees/employee-detail.component').then(
                (m) => m.EmployeeDetailComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./components/employees/employee-form.component').then(
                (m) => m.EmployeeFormComponent
              ),
          },
        ],
      },
      {
        path: 'departments',
        loadComponent: () =>
          import('./components/departments/department-list.component').then(
            (m) => m.DepartmentListComponent
          ),
      },
      {
        path: 'positions',
        loadComponent: () =>
          import('./components/positions/position-list.component').then(
            (m) => m.PositionListComponent
          ),
      },
      {
        path: 'salary-grades',
        loadComponent: () =>
          import('./components/salary-grades/salary-grades.component').then(
            (m) => m.SalaryGradesComponent
          ),
      },
      {
        path: 'payroll',
        loadComponent: () =>
          import('./components/payroll/payroll.component').then(
            (m) => m.PayrollComponent
          ),
      },
      {
        path: 'loans',
        loadComponent: () =>
          import('./components/loans/loans.component').then(
            (m) => m.LoansComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
