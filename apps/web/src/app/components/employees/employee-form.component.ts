import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Employee, Department, Position } from '../../models/employee.model';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ isEditMode() ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد' }}</h1>
          <p class="text-gray-600">{{ isEditMode() ? 'تعديل بيانات الموظف الحالي' : 'أدخل بيانات الموظف الجديد' }}</p>
        </div>
        <button
          routerLink="/employees"
          class="text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          العودة للقائمة
        </button>
      </div>

      @if (loading()) {
        <div class="bg-white rounded-lg shadow p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- البيانات الأساسية -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">البيانات الأساسية</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الرقم الوظيفي *</label>
                <input
                  type="text"
                  formControlName="employee_number"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [class.border-red-500]="form.get('employee_number')?.invalid && form.get('employee_number')?.touched"
                />
                @if (form.get('employee_number')?.invalid && form.get('employee_number')?.touched) {
                  <p class="text-red-500 text-xs mt-1">الرقم الوظيفي مطلوب</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الاسم الأول *</label>
                <input
                  type="text"
                  formControlName="first_name"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [class.border-red-500]="form.get('first_name')?.invalid && form.get('first_name')?.touched"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الاسم الأوسط</label>
                <input
                  type="text"
                  formControlName="middle_name"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">اسم العائلة *</label>
                <input
                  type="text"
                  formControlName="last_name"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [class.border-red-500]="form.get('last_name')?.invalid && form.get('last_name')?.touched"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">رقم الهوية *</label>
                <input
                  type="text"
                  formControlName="id_number"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [class.border-red-500]="form.get('id_number')?.invalid && form.get('id_number')?.touched"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">نوع الهوية</label>
                <select
                  formControlName="id_type"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">اختر نوع الهوية</option>
                  <option value="national_id">هوية وطنية</option>
                  <option value="passport">جواز سفر</option>
                  <option value="residence">إقامة</option>
                </select>
              </div>
            </div>
          </div>

          <!-- البيانات الشخصية -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">البيانات الشخصية</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
                <select
                  formControlName="gender"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">اختر الجنس</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
                <input
                  type="date"
                  formControlName="date_of_birth"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الجنسية</label>
                <input
                  type="text"
                  formControlName="nationality"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الحالة الاجتماعية</label>
                <select
                  formControlName="marital_status"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">اختر الحالة</option>
                  <option value="single">أعزب</option>
                  <option value="married">متزوج</option>
                  <option value="divorced">مطلق</option>
                  <option value="widowed">أرمل</option>
                </select>
              </div>
            </div>
          </div>

          <!-- معلومات الاتصال -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">معلومات الاتصال</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">رقم الجوال *</label>
                <input
                  type="tel"
                  formControlName="mobile"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  [class.border-red-500]="form.get('mobile')?.invalid && form.get('mobile')?.touched"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  formControlName="phone"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  formControlName="email"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div class="md:col-span-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <textarea
                  formControlName="address"
                  rows="2"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
                <input
                  type="text"
                  formControlName="city"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- بيانات العمل -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">بيانات العمل</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                <select
                  formControlName="department_id"
                  (change)="onDepartmentChange()"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">اختر القسم</option>
                  @for (dept of departments(); track dept.id) {
                    <option [value]="dept.id">{{ dept.name_ar || dept.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">المسمى الوظيفي</label>
                <select
                  formControlName="position_id"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">اختر المسمى الوظيفي</option>
                  @for (pos of positions(); track pos.id) {
                    <option [value]="pos.id">{{ pos.title_ar || pos.title }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                <select
                  formControlName="status"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="suspended">موقوف</option>
                </select>
              </div>
            </div>
          </div>

          <!-- جهة الاتصال في الطوارئ -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">جهة الاتصال في الطوارئ</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                <input
                  type="text"
                  formControlName="emergency_contact_name"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  formControlName="emergency_contact_phone"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">صلة القرابة</label>
                <input
                  type="text"
                  formControlName="emergency_contact_relation"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex justify-end gap-4">
            <button
              type="button"
              routerLink="/employees"
              class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              [disabled]="form.invalid || submitting()"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (submitting()) {
                <span class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحفظ...
                </span>
              } @else {
                {{ isEditMode() ? 'حفظ التعديلات' : 'إضافة الموظف' }}
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class EmployeeFormComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  departments = signal<Department[]>([]);
  positions = signal<Position[]>([]);
  loading = signal(false);
  submitting = signal(false);
  isEditMode = signal(false);
  employeeId = signal<string | null>(null);

  ngOnInit() {
    this.initForm();
    this.loadDepartments();
    this.loadPositions();

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.employeeId.set(id);
      this.loadEmployee(id);
    }
  }

  initForm() {
    this.form = this.fb.group({
      employee_number: ['', Validators.required],
      first_name: ['', Validators.required],
      middle_name: [''],
      last_name: ['', Validators.required],
      id_number: ['', Validators.required],
      id_type: [''],
      gender: [''],
      date_of_birth: [''],
      nationality: [''],
      marital_status: [''],
      mobile: ['', Validators.required],
      phone: [''],
      email: ['', Validators.email],
      address: [''],
      city: [''],
      department_id: [''],
      position_id: [''],
      status: ['active'],
      emergency_contact_name: [''],
      emergency_contact_phone: [''],
      emergency_contact_relation: [''],
    });
  }

  loadDepartments() {
    this.api.getDepartments().subscribe({
      next: (depts) => this.departments.set(depts),
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  loadPositions(departmentId?: string) {
    this.api.getPositions(departmentId).subscribe({
      error: (err) => console.error('Error loading positions:', err)
    });
  }
  loadEmployee(id: string) {
    this.loading.set(true);
    this.api.getEmployee(id).subscribe({
      next: (employee) => {
        this.form.patchValue(employee);
        if (employee.department_id) {
          this.loadPositions(employee.department_id);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading employee:', err);
        this.loading.set(false);
      }
    });
  }
  onDepartmentChange() {
    const departmentId = this.form.get('department_id')?.value;
    this.loadPositions(departmentId);
    this.form.get('position_id')?.setValue('');
  }
  onSubmit() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      return;
    }
    this.submitting.set(true);
    const data = this.form.value;
    const request = this.isEditMode()
      ? this.api.updateEmployee(this.employeeId()!, data)
      : this.api.createEmployee(data);
    request.subscribe({
      next: () => {
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        alert(err.error?.message || 'حدث خطأ أثناء الحفظ');
        this.submitting.set(false);
      }
    });
  }
}
