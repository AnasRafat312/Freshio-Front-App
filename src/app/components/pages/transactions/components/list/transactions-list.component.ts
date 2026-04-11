import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';
import { TransactionModel } from '../../core/models/transaction.model';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { PrivilegeService } from '../../../privilege/privilege.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { PrivilegeChecked } from '../../../privilege/interfaces/privilege';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { NewDeleteModalComponent } from 'src/app/shared/components/new-delete-modal/new-delete-modal.component';
import { TransactionsService } from '../../services/transactions.service';
import { TransactionsStore } from '../../store/transactions.store';
import { ResponseModel } from 'src/app/shared/model/response';
import { AccountTypeEnum } from '../../core/enums/account-type.enum';
import { ChannelTypeEnum } from '../../core/enums/channel-type.enum';
import { TransactionStatusEnum } from '../../core/enums/transaction-status.enum';
import { TransactionTypeEnum } from '../../core/enums/transaction-type.enum';
import { TransactionsAddEditComponent } from '../add-edit/add-edit.component';
import { TransactionsDetailsComponent } from '../details/details.component';

@Component({
  selector: 'app-transactions-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss']
})
export class TransactionsList implements OnInit, OnDestroy {
  mainList: TransactionModel[] = [];
  filteredList: TransactionModel[] = [];
  model: any = {};
  actionsList: ActionData[] = [];
  Add = true;
  View = true;
  Cancel = true;
  Details = true;
  privilegecheckedList!: PrivilegeChecked[];
  ref: DynamicDialogRef | undefined;
  languageFactor = 'en';

  // Statistics calculated from filtered list
  pendingCount = 0;
  completedCount = 0;
  failedCount = 0;
  totalAmount = 0;
  totalTaxes = 0;        // Total Decrease (TotalDecrease)
  totalDeductables = 0;  // Total Increase (TotalIncrease)

  constructor(
    private privilegeService: PrivilegeService,
    private sharedServices: SharedService,
    private language: LanguagesService,
    public dialogService: DialogService,
    private constant: Constant,
    private transactionsService: TransactionsService,
    private transactionsStore: TransactionsStore
  ) {
    this.initializeModel();
    this.privilegeService.checkedPrivilegeList.subscribe((data) => {
      this.Add = true;
      this.View = true;
      this.Cancel = true;
      this.Details = true;
      this.privilegecheckedList = data;
      this.showActionBaseOnPrivilege(this.privilegecheckedList);
      this.getActionsList();
    });

    // React to signal changes automatically
    effect(() => {
      this.mainList = this.transactionsStore.transactions();
      this.filteredList = [...this.mainList];
      this.calculateStatistics();
    });
  }

  ngOnInit(): void {
    // Initialize language factor immediately
    this.languageFactor = this.language.getCurrentLanguage();
    this.getAllRows();
  }

  ngOnDestroy(): void {
    this.mainList = [];
    this.filteredList = [];
  }

  /**
   * Fetch transactions data from API (service automatically stores in signal)
   */
  getAllRows(): void {
    this.transactionsService.getTransactions();
  }

  /**
   * Calculate statistics from filtered list
   */
  calculateStatistics(): void {
    this.pendingCount = this.filteredList.filter(t => TransactionStatusEnum[String(t.Status)] == TransactionStatusEnum.Pending).length;
    this.completedCount = this.filteredList.filter(t => TransactionStatusEnum[String(t.Status)] == TransactionStatusEnum.Completed).length;
    this.failedCount = this.filteredList.filter(t => TransactionStatusEnum[String(t.Status)] == TransactionStatusEnum.Failed).length;
    this.totalAmount = this.filteredList.reduce((sum, t) => sum + (t.Amount || 0), 0);
    this.totalTaxes = this.filteredList.reduce((sum, t) => sum + (t.TotalDecrease || 0), 0);
    this.totalDeductables = this.filteredList.reduce((sum, t) => sum + (t.TotalIncrease || 0), 0);
  }

  /**
   * Called when filtered list changes from the table component
   */
  onFilteredListChange(filteredData: TransactionModel[]): void {
    this.filteredList = filteredData;
    this.calculateStatistics();
  }

  /**
   * Initialize table model with filters and headers
   */
  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.model = {
        TransactionDate: {
          filterType: FilterType.date,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Transaction Date' : 'تاريخ المعاملة',
        },
        Amount: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Amount' : 'المبلغ',
        },
        Status: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Status' : 'الحالة',
          hidden: true
        },
        Category: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Category' : 'الفئة',
        },
        Direction: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Direction' : 'الاتجاه',
          hidden: true
        },
        Description: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Description' : 'الوصف',
        },
        SenderTypeName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Sender Type' : 'نوع المرسل',
          hidden: false
        },
        SenderEntityName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Sender Entity' : 'جهة المرسل',
          hidden: false
        },
        SenderPhoneNumber: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Sender Phone' : 'هاتف المرسل',
          hidden: true
        },
        ReceiverTypeName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Receiver Type' : 'نوع المستقبل',
          hidden: false
        },
        ReceiverEntityName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Receiver Entity Name' : 'معرف جهة المستقبل',
          hidden: false
        },
        ReceiverPhoneNumber: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Receiver Phone' : 'هاتف المستقبل',
          hidden: true
        },
        Fee: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Fee' : 'الرسوم',
          hidden: true
        },
        NetAmount: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Net Amount' : 'المبلغ الصافي',
          hidden: false
        },
        TotalFees: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Total Fees' : 'إجمالي الرسوم',
          hidden: true
        },
        CalculatedNetAmount: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Calculated Net Amount' : 'المبلغ الصافي المحسوب',
          hidden: true
        },
        ChannelName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Channel' : 'القناة',
          hidden: false
        },
        TransactionTypeName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Transaction Type' : 'نوع المعاملة',
          hidden: true
        },
        ReferenceNumber: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Reference Number' : 'رقم المرجع',
        },
      };
    });
  }

  /**
   * Show actions based on user privileges
   */
  showActionBaseOnPrivilege(pages: PrivilegeChecked[]) {
    this.actionsList = [];

    pages.forEach((page) => {
      if (page.page === 'TransactionsList') {
        page.actions.forEach((action) => {
          if (action === 'Cancel') {
            this.Cancel = true;
          }
          else if (action === 'Add') {
            this.Add = true;
          }
          else if (action === 'View') {
            this.View = true;
          }
          else if (action === 'Details') {
            this.Details = true;
            this.actionsList.push({
              tooltip: 'Details',
              icon: 'pi pi-eye',
              styleClass: 'p-button-info',
              action: (row: any) => this.rowDetails(row),
            });
          }
        });
      }
    });
  }

  /**
   * Get actions list based on privileges
   */
  getActionsList() {
    this.actionsList = [];
    
    if (this.View) {
      this.actionsList.push({
        tooltip: 'View',
        icon: 'pi pi-eye',
        styleClass: 'p-button-info',
        action: (row: any) => this.viewTransaction(row),
      });
    }
    
    if (this.Cancel) {
      this.actionsList.push({
        tooltip: 'Cancel',
        icon: 'pi pi-times',
        styleClass: 'p-button-danger',
        action: (row: any) => this.cancelTransaction(row.Id),
        // Only show cancel for pending/processing transactions
        condition: (row: any) => 
          row.Status === TransactionStatusEnum.Pending || 
          row.Status === TransactionStatusEnum.Processing
      });
    }
  }

  /**
   * Open add transaction dialog
   */
  addTransaction(): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'New Transaction';
    } else {
      header = 'معاملة جديدة';
    }
    
    this.ref = this.dialogService.open(
      TransactionsAddEditComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: null,
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'lg-dialog-width'
      }
    );
    
    this.ref.onClose.subscribe((transaction) => {
      if (transaction) {
        this.transactionsStore.addTransaction(transaction);
      }
    });
  }

  /**
   * View transaction details
   */
  viewTransaction(row: TransactionModel): void {
    // Set selected transaction in store
    this.transactionsStore.setSelectedTransaction(row);
    
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Transaction Details';
    } else {
      header = 'تفاصيل المعاملة';
    }
    
    this.ref = this.dialogService.open(
      TransactionsDetailsComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: row,
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'lg-dialog-width'
      }
    );
  }

  /**
   * Cancel transaction
   */
  cancelTransaction(id: number): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Cancel Transaction';
    } else {
      header = 'إلغاء المعاملة';
    }
    
    const url = `${this.constant.API_ENDPOINT}Transactions/Cancel/${id}`;
    
    this.ref = this.dialogService.open(NewDeleteModalComponent, {
      header: header,
      contentStyle: { overflow: 'auto' },
      data: { 
        url: url, 
        id: id,
        message: this.languageFactor === 'en' 
          ? 'Are you sure you want to cancel this transaction?' 
          : 'هل أنت متأكد من إلغاء هذه المعاملة؟'
      },
      baseZIndex: 10000,
      styleClass: 'xs-dialog-width',
    });
    
    this.ref.onClose.subscribe((result) => {
      if (result) {
        // Update transaction status in store
        const transaction = this.transactionsStore.getTransactionById(id);
        if (transaction) {
          const updatedTransaction = {
            ...transaction,
            Status: TransactionStatusEnum.Cancelled
          };
          this.transactionsStore.updateTransaction(updatedTransaction);
        }
      }
    });
  }

  /**
   * Show transaction details
   */
  rowDetails(row: TransactionModel): void {
    // Implementation for showing transaction details
    // Could open a details dialog or navigate to details page
    this.transactionsStore.setSelectedTransaction(row);
  }

  /**
   * Apply filters to transactions
   */
  applyFilters(filters: any): void {
    this.transactionsService.getTransactions(filters);
  }

  /**
   * Export transactions to Excel/PDF
   */
  exportTransactions(): void {
    // Implementation for exporting transactions
    // Use your existing export service
  }

  /**
   * Refresh transactions list
   */
  refresh(): void {
    this.getAllRows();
  }

  /**
   * Get status badge class for styling
   */
  getStatusClass(status: TransactionStatusEnum): string {
    switch (status) {
      case TransactionStatusEnum.Completed:
        return 'badge-success';
      case TransactionStatusEnum.Pending:
        return 'badge-warning';
      case TransactionStatusEnum.Processing:
        return 'badge-info';
      case TransactionStatusEnum.Failed:
        return 'badge-danger';
      case TransactionStatusEnum.Cancelled:
        return 'badge-secondary';
      default:
        return 'badge-default';
    }
  }

  /**
   * Get account type display name
   */
  getAccountTypeDisplay(accountType: AccountTypeEnum): string {
    const accountTypes: { [key: number]: { en: string, ar: string } } = {
      [AccountTypeEnum.Wallet]: { en: 'Wallet', ar: 'محفظة' },
      [AccountTypeEnum.BankAccount]: { en: 'Bank Account', ar: 'حساب بنكي' },
      [AccountTypeEnum.YellowCard]: { en: 'Yellow Card', ar: 'بطاقة صفراء' },
      [AccountTypeEnum.CreditCard]: { en: 'Credit Card', ar: 'بطاقة ائتمانية' },
      [AccountTypeEnum.Trader]: { en: 'Trader', ar: 'تاجر' }
    };
    
    return this.languageFactor === 'en' 
      ? accountTypes[accountType]?.en || 'Unknown'
      : accountTypes[accountType]?.ar || 'غير معروف';
  }

  /**
   * Get channel display name
   */
  getChannelDisplay(channel: ChannelTypeEnum): string {
    const channels: { [key: number]: { en: string, ar: string } } = {
      [ChannelTypeEnum.ATM]: { en: 'ATM', ar: 'صراف آلي' },
      [ChannelTypeEnum.Instapay]: { en: 'Instapay', ar: 'إنستاباي' },
      [ChannelTypeEnum.Fawry]: { en: 'Fawry', ar: 'فوري' },
      [ChannelTypeEnum.WalletProvidor]: { en: 'WalletProvidor', ar: 'محفظة' }
    };
    
    return this.languageFactor === 'en' 
      ? channels[channel]?.en || 'Unknown'
      : channels[channel]?.ar || 'غير معروف';
  }
}
