import { Component, Input, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { TransactionsStore } from '../../store/transactions.store';
import { TransactionsService } from '../../services/transactions.service';
import { AdjustmentModel } from '../../../adjustments/core/models/adjustment.model';
import { TransactionPreviewResponse, TransactionAdjustmentBreakdown } from '../../core/models/transaction.model';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AdjustmentsService } from '../../../adjustments/services/adjustments.service';
import { AdjustmentsStore } from '../../../adjustments/store/adjustments.store';

/**
 * Adjustment Preview Component
 * Child component for selecting adjustments and displaying preview
 */
@Component({
  selector: 'app-adjustment-preview',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './adjustment-preview.component.html',
  styleUrls: ['./adjustment-preview.component.scss']
})
export class AdjustmentPreviewComponent implements OnInit, OnDestroy {
  @Input() adjustmentIdsControl!: FormControl;
  
  languageFactor = 'en';
  languageSubscription: Subscription;
  
  // Data from store
  adjustmentsOptions: AdjustmentModel[] = [];
  previewData: TransactionPreviewResponse | null = null;
  previewLoading: boolean = false;
  
  constructor(
    private language: LanguagesService,
    private transactionsStore: TransactionsStore,
    private transactionsService: TransactionsService,
    private adjustmentsService: AdjustmentsService,
    private adjustmentsStore: AdjustmentsStore,
    private messageService: MessageService
  ) {
    // React to store changes
    effect(() => {
      this.adjustmentsOptions = this.adjustmentsStore.adjustments();
      this.previewData = this.transactionsStore.transactionPreview();
      this.previewLoading = this.transactionsStore.previewLoading();
    });
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });
    
    // Load active adjustments on init
    this.loadActiveAdjustments();
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  /**
   * Load active adjustments from backend
   */
  private loadActiveAdjustments(): void {
    this.adjustmentsService.getAdjustments().subscribe({
      next: (response) => {
        // Service already stored data in AdjustmentsStore via tap operator
        
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load adjustments'
        });
      }
    });
  }

  /**
   * Get adjustment type label
   */
  getAdjustmentTypeLabel(type: number): string {
    const labels: { [key: number]: { en: string; ar: string } } = {
      1: { en: 'Tax', ar: 'ضريبة' },
      2: { en: 'Fee', ar: 'رسوم' },
      3: { en: 'Cashback', ar: 'استرداد نقدي' },
      4: { en: 'Commission', ar: 'عمولة' },
      5: { en: 'Discount', ar: 'خصم' }
    };
    return labels[type]?.[this.languageFactor] || '';
  }

  /**
   * Get direction label
   */
  getDirectionLabel(direction: number): string {
    const labels: { [key: number]: { en: string; ar: string } } = {
      1: { en: 'Increase', ar: 'زيادة' },
      2: { en: 'Decrease', ar: 'نقصان' }
    };
    return labels[direction]?.[this.languageFactor] || '';
  }

  /**
   * Get applies to label
   */
  getAppliesToLabel(appliesTo: number): string {
    const labels: { [key: number]: { en: string; ar: string } } = {
      1: { en: 'Sender', ar: 'المرسل' },
      2: { en: 'Receiver', ar: 'المستقبل' },
      3: { en: 'System', ar: 'النظام' }
    };
    return labels[appliesTo]?.[this.languageFactor] || '';
  }

  /**
   * Get calculation type label
   */
  getCalculationTypeLabel(type: number): string {
    const labels: { [key: number]: { en: string; ar: string } } = {
      1: { en: 'Fixed', ar: 'ثابت' },
      2: { en: 'Percentage', ar: 'نسبة مئوية' }
    };
    return labels[type]?.[this.languageFactor] || '';
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}
