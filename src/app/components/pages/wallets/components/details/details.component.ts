import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/shared/shared.module';
import { WalletsService } from '../../services/wallets.service';
import { WalletsStore } from '../../store/wallets.store';
import { WalletDetailsModel } from '../../core/models/wallet-details.model';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';

@Component({
  selector: 'app-wallets-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class WalletsDetailsComponent implements OnInit, OnDestroy {
  walletDetails!: WalletDetailsModel;
  loading: boolean = true;
  error: boolean = false;
  languageFactor: string = 'en';
  private walletId!: number;

  // Tables data
  moneySentToList: any[] = [];
  moneySentToFiltered: any[] = [];
  moneySentToModel: any = {};

  moneyReceivedFromList: any[] = [];
  moneyReceivedFromFiltered: any[] = [];
  moneyReceivedFromModel: any = {};

  constructor(
    private walletsService: WalletsService,
    private walletsStore: WalletsStore,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private language: LanguagesService
  ) {
    this.language.currentLanguage.subscribe((lang) => {
      this.languageFactor = lang;
    });

    // React to signal changes automatically
    effect(() => {
      const details = this.walletsStore.walletDetails();
      console.log('Wallet Details from store:', details);
      
      // Update component state based on signal value
      if (details !== null) {
        this.walletDetails = details;
        console.log('Wallet Details assigned:', this.walletDetails);
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
    this.walletsStore.clearWalletDetails();
    
    this.walletId = this.config.data?.Id;
    if (this.walletId) {
      this.loadWalletDetails(this.walletId);
    } else {
      console.error('No wallet ID provided');
      this.loading = false;
      this.error = true;
    }
  }

  ngOnDestroy(): void {
    // Clean up when component is destroyed
    this.walletsStore.clearWalletDetails();
  }

  loadWalletDetails(id: number): void {
    this.loading = true;
    this.error = false;
    this.walletsService.getWalletDetails(id);
    
    // Set a timeout to handle cases where the API doesn't respond
    setTimeout(() => {
      if (this.loading && this.walletDetails === null) {
        this.loading = false;
        this.error = true;
      }
    }, 10000); // 10 second timeout
  }

  retry(): void {
    if (this.walletId) {
      this.loadWalletDetails(this.walletId);
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
    if (this.walletDetails.MoneySentTo) {
      this.walletDetails.MoneySentTo.forEach(group => {
        group.TransactionsByType.forEach(transaction => {
          sentToData.push({
            Date: group.Date,
            EntityTypeName: transaction.EntityTypeName,
            PhoneNumber: transaction.PhoneNumber || this.getLabel('N/A', 'غير متوفر'),
            Amount: transaction.Amount,
            CardNumber: transaction.CardNumber || '-',
            Provider: transaction.Provider || '-',
            CreatedByName: group.CreatedByName || this.getLabel('N/A', 'غير متوفر'),
          });
        });
      });
    }
    // Create independent copies for each table
    this.moneySentToList = JSON.parse(JSON.stringify(sentToData));
    this.moneySentToFiltered = JSON.parse(JSON.stringify(sentToData));

    // Flatten MoneyReceivedFrom data - create completely new arrays
    const receivedFromData: any[] = [];
    if (this.walletDetails.MoneyReceivedFrom) {
      this.walletDetails.MoneyReceivedFrom.forEach(group => {
        group.TransactionsByType.forEach(transaction => {
          receivedFromData.push({
            Date: group.Date,
            EntityTypeName: transaction.EntityTypeName,
            PhoneNumber: transaction.PhoneNumber || this.getLabel('N/A', 'غير متوفر'),
            Amount: transaction.Amount,
            CardNumber: transaction.CardNumber || '-',
            Provider: transaction.Provider || '-',
            CreatedByName: group.CreatedByName || this.getLabel('N/A', 'غير متوفر'),
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
