import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { SalesOrdersService } from '../../services/sales-orders.service';
import { PartialApproveOrderDto, PartialApproveItemDto } from 'src/app/shared/model/freshio/sales-order.model';
//[max]="Math.min(item.RequestedQuantity, item.AvailableQuantity)"

@Component({
  selector: 'app-partial-approve-dialog',
  standalone: true,
  imports: [CommonModule, SharedModule],
  template: `
    <div class="partial-approve-container">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <p-table [value]="itemsData" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>{{ getLabel('Item', 'الصنف') }}</th>
              <th>{{ getLabel('Requested', 'المطلوب') }}</th>
              <th>{{ getLabel('Available', 'المتاح') }}</th>
              <th>{{ getLabel('Approved Qty', 'الكمية المعتمدة') }}</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item let-i="rowIndex">
            <tr>
              <td>{{ item.ItemName }}</td>
              <td>{{ item.RequestedQuantity | number:'1.2-2' }}</td>
              <td>{{ item.AvailableQuantity | number:'1.2-2' }}</td>
              <td>
                <p-inputNumber
                  [(ngModel)]="item.ApprovedQuantity"
                  [ngModelOptions]="{standalone: true}"
                  mode="decimal"
                  [min]="0"
                  [minFractionDigits]="2"
                  [maxFractionDigits]="2"
                  styleClass="w-full"
                  [ngClass]="{'ng-invalid ng-dirty': item.ApprovedQuantity > item.AvailableQuantity || item.ApprovedQuantity > item.RequestedQuantity}">
                </p-inputNumber>
                <small *ngIf="item.ApprovedQuantity > item.AvailableQuantity" class="p-error">
                  {{ getLabel('Exceeds available quantity', 'تتجاوز الكمية المتاحة') }}
                </small>
                <small *ngIf="item.ApprovedQuantity > item.RequestedQuantity" class="p-error">
                  {{ getLabel('Exceeds requested quantity', 'تتجاوز الكمية المطلوبة') }}
                </small>
              </td>
            </tr>
          </ng-template>
        </p-table>

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
            [label]="getLabel('Approve', 'موافقة')" 
            icon="pi pi-check" 
            class="p-button-success"
            [loading]="loading">
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .partial-approve-container {
      padding: 1rem;
    }

    :host ::ng-deep {
      .p-inputnumber {
        width: 100%;
      }
      
      .p-inputnumber-input {
        width: 100%;
      }
    }
  `]
})
export class PartialApproveDialogComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  languageSubscription: Subscription;
  loading = false;
  itemsData: any[] = [];
  orderId: number;
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private language: LanguagesService,
    private messageService: MessageService,
    private salesOrdersService: SalesOrdersService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    if (this.config.data) {
      this.orderId = this.config.data.orderId;
      this.itemsData = this.config.data.items.map((item: any) => ({
        ...item,
        ApprovedQuantity: Math.min(item.RequestedQuantity, item.AvailableQuantity || 0)
      }));
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
    // Validate all items
    const hasErrors = this.itemsData.some(item => 
      item.ApprovedQuantity > item.AvailableQuantity || 
      item.ApprovedQuantity > item.RequestedQuantity ||
      item.ApprovedQuantity < 0
    );

    if (hasErrors) {
      this.messageService.add({
        severity: 'warn',
        summary: this.getLabel('Validation Error', 'خطأ في التحقق'),
        detail: this.getLabel('Please fix validation errors', 'يرجى إصلاح أخطاء التحقق')
      });
      return;
    }

    this.loading = true;

    const payload: PartialApproveOrderDto = {
      SalesOrderItems: this.itemsData.map(item => ({
        OrderItemId: item?.Id,
        ApprovedQuantity: item.ApprovedQuantity
      }))
    };

    this.salesOrdersService.partialApproveSalesOrder(this.orderId, payload).subscribe({
      next: (response) => {
        if (response?.Success) {
          this.messageService.add({
            severity: 'success',
            summary: this.getLabel('Success', 'نجح'),
            detail: this.getLabel('Order partially approved successfully', 'تم اعتماد الأوردر جزئياً بنجاح')
          });
          this.ref.close(true);
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
