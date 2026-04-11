import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/shared/shared.module';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { TransactionsService } from '../../services/transactions.service';
import { TransactionsStore } from '../../store/transactions.store';
import { TransactionModel } from '../../core/models/transaction.model';
import { Subscription } from 'rxjs';
import { ResponseModel } from 'src/app/shared/model/response';
import { TransactionStatusEnum } from '../../core/enums/transaction-status.enum';

@Component({
  selector: 'app-transactions-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class TransactionsDetailsComponent implements OnInit, OnDestroy {
  transaction: TransactionModel | null = null;
  languageFactor = 'en';
  languageSubscription: Subscription;
  transactionId: number;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private language: LanguagesService,
    private constant: Constant,
    private transactionsService: TransactionsService,
    private transactionsStore: TransactionsStore,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    // Check if opened in dialog with data
    this.transactionId = this.config.data.Id;
    this.loadTransactionDetails(this.transactionId);
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  /**
   * Load transaction details from API
   */
  private loadTransactionDetails(id: number): void {
    this.isLoading = true;
    this.transactionsService.getTransactionById(id).subscribe({
      next: (response: ResponseModel) => {
        if (response?.Success && response?.Data) {
          this.transaction = response.Data;
          this.transactionsStore.setSelectedTransaction(response.Data);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transaction details:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Navigate back to transactions list or close dialog
   */
  goBack(): void {
    if (this.ref) {
      this.ref.close();
    } else {
      this.router.navigate(['/pages/transactions']);
    }
  }

  /**
   * Get status badge class
   */
  getStatusClass(status: number): string {
    const statusClasses: { [key: number]: string } = {
      1: 'badge-warning',    // Pending
      2: 'badge-success',    // Completed
      3: 'badge-danger',     // Failed
      4: 'badge-secondary',  // Cancelled
      5: 'badge-info'        // Processing
    };
    return TransactionStatusEnum[statusClasses[status]] || 'badge-default';
  }

  /**
   * Get status display name
   */
  getStatusDisplay(status: number): string {
    const statusNames: { [key: number]: { en: string, ar: string } } = {
      1: { en: 'Pending', ar: 'قيد الانتظار' },
      2: { en: 'Completed', ar: 'مكتمل' },
      3: { en: 'Failed', ar: 'فشل' },
      4: { en: 'Cancelled', ar: 'ملغي' },
      5: { en: 'Processing', ar: 'قيد المعالجة' }
    };
    return this.languageFactor === 'en' 
      ? statusNames[status]?.en || 'Unknown'
      : statusNames[status]?.ar || 'غير معروف';
  }

  /**
   * Get transaction type display name
   */
  getTransactionTypeDisplay(type: number): string {
    const typeNames: { [key: number]: { en: string, ar: string } } = {
      1: { en: 'Deposit', ar: 'إيداع' },
      2: { en: 'Withdrawal', ar: 'سحب' },
      3: { en: 'Transfer', ar: 'تحويل' },
      4: { en: 'Payment', ar: 'دفع' },
      5: { en: 'Refund', ar: 'استرداد' }
    };
    return this.languageFactor === 'en' 
      ? typeNames[type]?.en || 'Unknown'
      : typeNames[type]?.ar || 'غير معروف';
  }

  /**
   * Get account type display name
   */
  getAccountTypeDisplay(accountType: number): string {
    const accountTypes: { [key: number]: { en: string, ar: string } } = {
      1: { en: 'Wallet', ar: 'محفظة' },
      2: { en: 'Bank Account', ar: 'حساب بنكي' },
      3: { en: 'Yellow Card', ar: 'بطاقة صفراء' },
      4: { en: 'Credit Card', ar: 'بطاقة ائتمانية' },
      5: { en: 'Trader', ar: 'تاجر' }
    };
    return this.languageFactor === 'en' 
      ? accountTypes[accountType]?.en || 'Unknown'
      : accountTypes[accountType]?.ar || 'غير معروف';
  }

  /**
   * Get channel display name
   */
  getChannelDisplay(channel: number): string {
    const channels: { [key: number]: { en: string, ar: string } } = {
      1: { en: 'ATM', ar: 'صراف آلي' },
      2: { en: 'Instapay', ar: 'إنستاباي' },
      3: { en: 'Fawry', ar: 'فوري' },
      4: { en: 'POS', ar: 'نقطة بيع' }
    };
    return this.languageFactor === 'en' 
      ? channels[channel]?.en || 'Unknown'
      : channels[channel]?.ar || 'غير معروف';
  }

  /**
   * Get adjustment type badge class
   */
  getAdjustmentTypeBadgeClass(type: number): string {
    const classes: { [key: number]: string } = {
      1: 'badge-tax',        // Tax
      2: 'badge-fee',        // Fee
      3: 'badge-cashback',   // Cashback
      4: 'badge-commission', // Commission
      5: 'badge-discount'    // Discount
    };
    return classes[type] || 'badge-default';
  }

  /**
   * Get direction badge class
   */
  getDirectionBadgeClass(direction: number): string {
    return direction === 1 ? 'badge-increase' : 'badge-decrease';
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
