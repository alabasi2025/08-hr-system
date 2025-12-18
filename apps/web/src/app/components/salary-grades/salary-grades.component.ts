import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { SalaryGrade, CreateSalaryGradeDto } from '../../models/employee.model';

@Component({
  selector: 'app-salary-grades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">سلم الرواتب</h1>
          <p class="text-gray-600">إدارة درجات الرواتب والبدلات</p>
        </div>
        <button
          (click)="openModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          إضافة درجة جديدة
        </button>
      </div>

      <!-- Salary Grades Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        @if (loading()) {
          <div class="p-8 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        } @else if (salaryGrades().length === 0) {
          <div class="p-8 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="mt-4 text-gray-600">لا يوجد درجات رواتب</p>
            <button (click)="openModal()" class="mt-4 text-blue-600 hover:text-blue-800">
              إضافة درجة جديدة
            </button>
          </div>
        } @else {
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الكود</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الدرجة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحد الأدنى</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحد الأقصى</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">بدل السكن %</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">بدل النقل</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (grade of salaryGrades(); track grade.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{{ grade.code }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ grade.name_ar || grade.name }}</div>
                    @if (grade.name_ar && grade.name) {
                      <div class="text-sm text-gray-500">{{ grade.name }}</div>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(grade.min_salary) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(grade.max_salary) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ grade.housing_allowance_pct }}%</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(grade.transport_allowance) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    @if (grade.is_active) {
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">نشط</span>
                    } @else {
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">غير نشط</span>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex gap-2">
                      <button (click)="editGrade(grade)" class="text-blue-600 hover:text-blue-900">تعديل</button>
                      <button (click)="deleteGrade(grade)" class="text-red-600 hover:text-red-900">حذف</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div class="p-6 border-b">
              <h2 class="text-xl font-semibold text-gray-800">
                {{ editingGrade() ? 'تعديل درجة الراتب' : 'إضافة درجة جديدة' }}
              </h2>
            </div>
            <form (ngSubmit)="saveGrade()" class="p-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">الكود *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.code"
                    name="code"
                    required
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="مثال: G1"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">الاسم (إنجليزي) *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.name"
                    name="name"
                    required
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="مثال: Grade 1"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الاسم (عربي)</label>
                <input
                  type="text"
                  [(ngModel)]="formData.name_ar"
                  name="name_ar"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="مثال: الدرجة الأولى"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى للراتب *</label>
                  <input
                    type="number"
                    [(ngModel)]="formData.min_salary"
                    name="min_salary"
                    required
                    min="0"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">الحد الأقصى للراتب *</label>
                  <input
                    type="number"
                    [(ngModel)]="formData.max_salary"
                    name="max_salary"
                    required
                    min="0"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">نسبة بدل السكن %</label>
                  <input
                    type="number"
                    [(ngModel)]="formData.housing_allowance_pct"
                    name="housing_allowance_pct"
                    min="0"
                    max="100"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">بدل النقل</label>
                  <input
                    type="number"
                    [(ngModel)]="formData.transport_allowance"
                    name="transport_allowance"
                    min="0"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  [(ngModel)]="formData.is_active"
                  name="is_active"
                  id="is_active"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="is_active" class="text-sm text-gray-700">نشط</label>
              </div>
              
              <div class="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  [disabled]="saving()"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  @if (saving()) {
                    جاري الحفظ...
                  } @else {
                    {{ editingGrade() ? 'حفظ التعديلات' : 'إضافة' }}
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SalaryGradesComponent implements OnInit {
  private api = inject(ApiService);

  salaryGrades = signal<SalaryGrade[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  editingGrade = signal<SalaryGrade | null>(null);

  formData: CreateSalaryGradeDto = {
    code: '',
    name: '',
    name_ar: '',
    min_salary: 0,
    max_salary: 0,
    housing_allowance_pct: 0,
    transport_allowance: 0,
    is_active: true,
  };

  ngOnInit() {
    this.loadSalaryGrades();
  }

  loadSalaryGrades() {
    this.loading.set(true);
    this.api.getSalaryGrades(true).subscribe({
      next: (grades) => {
        this.salaryGrades.set(grades);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading salary grades:', err);
        this.loading.set(false);
      }
    });
  }

  openModal() {
    this.editingGrade.set(null);
    this.formData = {
      code: '',
      name: '',
      name_ar: '',
      min_salary: 0,
      max_salary: 0,
      housing_allowance_pct: 0,
      transport_allowance: 0,
      is_active: true,
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingGrade.set(null);
  }

  editGrade(grade: SalaryGrade) {
    this.editingGrade.set(grade);
    this.formData = {
      code: grade.code,
      name: grade.name,
      name_ar: grade.name_ar || '',
      min_salary: Number(grade.min_salary),
      max_salary: Number(grade.max_salary),
      housing_allowance_pct: Number(grade.housing_allowance_pct),
      transport_allowance: Number(grade.transport_allowance),
      is_active: grade.is_active,
    };
    this.showModal.set(true);
  }

  saveGrade() {
    if (!this.formData.code || !this.formData.name || !this.formData.min_salary || !this.formData.max_salary) {
      alert('يرجى ملء الحقول المطلوبة');
      return;
    }

    if (this.formData.min_salary > this.formData.max_salary) {
      alert('الحد الأدنى يجب أن يكون أقل من الحد الأقصى');
      return;
    }

    this.saving.set(true);

    const request = this.editingGrade()
      ? this.api.updateSalaryGrade(this.editingGrade()!.id, this.formData)
      : this.api.createSalaryGrade(this.formData);

    request.subscribe({
      next: () => {
        this.loadSalaryGrades();
        this.closeModal();
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Error saving salary grade:', err);
        alert(err.error?.message || 'حدث خطأ أثناء الحفظ');
        this.saving.set(false);
      }
    });
  }

  deleteGrade(grade: SalaryGrade) {
    if (confirm(`هل أنت متأكد من حذف درجة الراتب "${grade.name_ar || grade.name}"؟`)) {
      this.api.deleteSalaryGrade(grade.id).subscribe({
        next: () => this.loadSalaryGrades(),
        error: (err) => {
          alert(err.error?.message || 'حدث خطأ أثناء الحذف');
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: 'YER',
      maximumFractionDigits: 0,
    }).format(amount);
  }
}
