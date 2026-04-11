import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/shared/shared.module';
import { BankAccountsService } from '../../services/bank-accounts.service';
import { BankAccountsStore } from '../../store/bank-accounts.store';
import { BankAccountDetailsModel } from '../../core/models/bank-account-details.model';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';

@Component({
  selector: 'app-bank-accounts-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class BankAccountsDetailsComponent implements OnInit, OnDestroy {
  bankAccountDetails!: BankAccountDetailsModel;
  loading: boolean = true;
  error: boolean = false;
  languageFactor: string = 'en';
  private accountId!: number;

  // Tables data
  moneySentToList: any[] = [];
  moneySentToFiltered: any[] = [];
  moneySentToModel: any = {};

  moneyReceivedFromList: any[] = [];
  moneyReceivedFromFiltered: any[] = [];
  moneyReceivedFromModel: any = {};

  constructor(
    private bankAccountsService: BankAccountsService,
    private bankAccountsStore: BankAccountsStore,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private language: LanguagesService
  ) {
    this.language.currentLanguage.subscribe((lang) => {
      this.languageFactor = lang;
    });

    // React to signal changes automatically
    effect(() => {
      const details = this.bankAccountsStore.bankAccountDetails();
      console.log('Bank Account Details from store:', details);
      
      // Update component state based on signal value
      if (details !== null) {
        this.bankAccountDetails = details;
        console.log('Bank Account Details assigned:', this.bankAccountDetails);
        this.prepareTableData();
        this.loading = false;
        this.error = false;
      } else if (!this.loading) {
        // If details are null and we're not loading, it might be an error
        console.log('Details are null, setting error state');
        this.error = true;
      }
    });

    this.initializeTableModels();
  }

  ngOnInit(): void {
    // Clear any previous details first
    this.bankAccountsStore.clearBankAccountDetails();
    
    this.accountId = this.config.data?.Id;
    if (this.accountId) {
      this.loadBankAccountDetails(this.accountId);
    } else {
      this.loading = false;
      this.error = true;
    }
  }

  ngOnDestroy(): void {
    // Clear details when component is destroyed
    this.bankAccountsStore.clearBankAccountDetails();
  }

  loadBankAccountDetails(id: number): void {
    this.loading = true;
    this.error = false;
    this.bankAccountsService.getBankAccountDetails(id);
    
    // Set a timeout to handle cases where the API doesn't respond
    setTimeout(() => {
      if (this.loading && this.bankAccountDetails === null) {
        this.loading = false;
        this.error = true;
      }
    }, 10000); // 10 second timeout
  }

  retry(): void {
    if (this.accountId) {
      this.loadBankAccountDetails(this.accountId);
    }
  }

  initializeTableModels(): void {
    // Create completely independent model objects for each table
    const createTableModel = () => ({
      Date: {
        filterType: FilterType.date,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Date' : 'التاريخ',
      },
      EntityTypeName: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Type' : 'النوع',
      },
      PhoneNumber: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Phone' : 'الهاتف',
      },
      CardNumber: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Card Number' : 'رقم الكارت',
      },
      Provider: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Provider' : 'متعهد',
      },
      Amount: {
        filterType: FilterType.number,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Amount' : 'المبلغ',
      },
      CreatedByName: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Created By' : 'أنشئ بواسطة',
      },
    });

    // Create independent instances
    this.moneySentToModel = createTableModel();
    this.moneyReceivedFromModel = createTableModel();
  }

  prepareTableData(): void {
    // Flatten MoneySentTo data - create completely new arrays
    const sentToData: any[] = [];
    if (this.bankAccountDetails.MoneySentTo) {
      this.bankAccountDetails.MoneySentTo.forEach(group => {
        group.TransactionsByType.forEach(transaction => {
          sentToData.push({
            Date: group.Date,
            EntityTypeName: transaction.EntityTypeName,
            PhoneNumber: transaction.PhoneNumber || this.getLabel('N/A', 'غير متوفر'),
            CardNumber: transaction.CardNumber || '-',
            Provider: transaction.Provider || '-',
            Amount: transaction.Amount,
            CreatedByName: group.CreatedByName || this.getLabel('N/A', 'غير متوفر')
          });
        });
      });
    }
    // Create independent copies for each table
    this.moneySentToList = JSON.parse(JSON.stringify(sentToData));
    this.moneySentToFiltered = JSON.parse(JSON.stringify(sentToData));

    // Flatten MoneyReceivedFrom data - create completely new arrays
    const receivedFromData: any[] = [];
    if (this.bankAccountDetails.MoneyReceivedFrom) {
      this.bankAccountDetails.MoneyReceivedFrom.forEach(group => {
        group.TransactionsByType.forEach(transaction => {
          receivedFromData.push({
            Date: group.Date,
            EntityTypeName: transaction.EntityTypeName,
            PhoneNumber: transaction.PhoneNumber || this.getLabel('N/A', 'غير متوفر'),
            CardNumber: transaction.CardNumber || '-',
            Provider: transaction.Provider || '-',
            Amount: transaction.Amount,
            CreatedByName: group.CreatedByName || this.getLabel('N/A', 'غير متوفر')
          });
        });
      });
    }
    // Create independent copies for each table
    this.moneyReceivedFromList = JSON.parse(JSON.stringify(receivedFromData));
    this.moneyReceivedFromFiltered = JSON.parse(JSON.stringify(receivedFromData));
  }

  getLabel(enLabel: string, arLabel: string): string {
    return this.languageFactor === 'en' ? enLabel : arLabel;
  }

  closeDialog(): void {
    this.ref.close();
  }
}
