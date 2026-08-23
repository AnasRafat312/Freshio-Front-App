import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { SalesOrdersService } from '../../services/sales-orders.service';
import { RejectOrderDto } from 'src/app/shared/model/freshio/sales-order.model';

@Component({
  selector: 'app-reject-order-dialog',
  standalone: true,
  imports: [CommonModule, SharedModule],
  template: `
    <div class="reject-order-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="mb-3">
          <label>
            {{ getLabel('Rejection Reason', 'سبب الرفض') }}
            <span class="required-asterisk">*</span>
          </label>
          <textarea 
            pInputTextarea 
            formControlName="RejectionReason"
            rows="4"
            [placeholder]="getLabel('Enter rejection reason', 'أدخل سبب الرفض')"
            class="w-full"
            [ngClass]="{'ng-invalid ng-dirty': form.get('RejectionReason')?.invalid && form.get('RejectionReason')?.touched}">
          </textarea>
          <small *ngIf="form.get('RejectionReason')?.invalid && form.get('RejectionReason')?.touched" class="p-error">
            {{ getLabel('Rejection reason is required', 'سبب الرفض مطلوب') }}
          </small>
        </div>

        <div class="flex justify-content-end gap-2 mt-4">
          <button 
            pButton 
            type="button" 
            [label]="getLabel('Cancel', 'إلغاء')" 
            icon="pi pi-times" 
            class="p-button-text" 
            (click)="onCancel()"
            [disabled]="loading">
          </button>
          <button 
            pButton 
            type="submit" 
            [label]="getLabel('Reject Order', 'رفض الأوردر')" 
            icon="pi pi-times-circle" 
            class="p-button-danger"
            [loading]="loading">
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .reject-order-container {
      padding: 1rem;
    }

    .required-asterisk {
      color: red;
      margin-left: 4px;
    }

    label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
  `]
})
export class RejectOrderDialogComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  languageSubscription: Subscription;
  loading = false;
  orderId: number;

  constructor(
    private fb: FormBuilder,
    private language: LanguagesService,
    private messageService: MessageService,
    private salesOrdersService: SalesOrdersService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.form = this.fb.group({
      RejectionReason: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    if (this.config.data) {
      this.orderId = this.config.data.orderId;
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  getLabel(enLabel: string, arLabel: string): string {
    return this.languageFactor === 'en' ? enLabel : arLabel;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: this.getLabel('Validation Error', 'خطأ في التحقق'),
        detail: this.getLabel('Please enter rejection reason', 'يرجى إدخال سبب الرفض')
      });
      return;
    }

    this.loading = true;

    const payload: RejectOrderDto = {
      RejectionReason: this.form.get('RejectionReason')?.value
    };

    this.salesOrdersService.rejectSalesOrder(this.orderId, payload).subscribe({
      next: (response) => {
        if (response?.Success) {
          this.messageService.add({
            severity: 'success',
            summary: this.getLabel('Success', 'نجح'),
            detail: this.getLabel('Order rejected successfully', 'تم رفض الأوردر بنجاح')
          });
          // Return the updated order data from the response
          this.ref.close(response?.Data || true);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.getLabel('Error', 'خطأ'),
            detail: response?.Message || this.getLabel('Operation failed', 'فشلت العملية')
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.getLabel('Error', 'خطأ'),
          detail: this.getLabel('An error occurred', 'حدث خطأ')
        });
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.ref.close();
  }
}
