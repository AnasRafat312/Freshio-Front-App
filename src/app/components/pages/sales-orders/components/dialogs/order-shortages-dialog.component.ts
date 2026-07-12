import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { StockShortageItemDto } from 'src/app/shared/model/freshio/sales-order.model';

@Component({
  selector: 'app-order-shortages-dialog',
  standalone: true,
  imports: [CommonModule, SharedModule],
  template: `
    <div class="shortages-container">
      <div class="alert alert-warning mb-3">
        <i class="pi pi-exclamation-triangle"></i>
        {{ getLabel('Cannot approve because stock is insufficient', 'لا يمكن الموافقة بسبب نقص المخزون') }}
      </div>

      <p-table [value]="shortages" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th>{{ getLabel('Item', 'الصنف') }}</th>
            <th>{{ getLabel('Unit', 'الوحدة') }}</th>
            <th>{{ getLabel('Requested', 'المطلوب') }}</th>
            <th>{{ getLabel('Available', 'المتاح') }}</th>
            <th>{{ getLabel('Missing', 'الناقص') }}</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-item>
          <tr>
            <td>{{ item.ItemName }}</td>
            <td>{{ item.UnitOfMeasure }}</td>
            <td>{{ item.RequestedQuantity | number:'1.2-2' }}</td>
            <td>{{ item.AvailableQuantity | number:'1.2-2' }}</td>
            <td class="shortage-value">{{ item.MissingQuantity | number:'1.2-2' }}</td>
          </tr>
        </ng-template>
      </p-table>

      <div class="flex justify-content-end gap-2 mt-4">
        <button 
          pButton 
          type="button" 
          [label]="getLabel('Close', 'إغلاق')" 
          icon="pi pi-times" 
          class="p-button-text" 
          (click)="onClose()">
        </button>
      </div>
    </div>
  `,
  styles: [`
    .shortages-container {
      padding: 1rem;
    }

    .alert {
      padding: 1rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .alert-warning {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      color: #856404;
    }

    .shortage-value {
      color: #dc3545;
      font-weight: 600;
    }

    :host ::ng-deep {
      .p-datatable {
        .p-datatable-thead > tr > th {
          background-color: #f8f9fa;
          color: #495057;
          font-weight: 600;
        }

        .p-datatable-tbody > tr > td {
          padding: 0.75rem;
        }
      }
    }
  `]
})
export class OrderShortagesDialogComponent implements OnInit, OnDestroy {
  languageFactor = 'en';
  languageSubscription: Subscription;
  shortages: StockShortageItemDto[] = [];

  constructor(
    private language: LanguagesService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    if (this.config.data) {
      this.shortages = this.config.data.shortages || [];
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

  onClose(): void {
    this.ref.close();
  }
}
