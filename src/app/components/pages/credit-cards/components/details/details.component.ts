import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreditCardsService } from '../../services/credit-cards.service';
import { CreditCardsStore } from '../../store/credit-cards.store';
import { CreditCardDetailsModel } from '../../core/models/credit-card-details.model';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';

@Component({
  selector: 'app-credit-cards-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class CreditCardsDetailsComponent implements OnInit, OnDestroy {
  creditCardDetails!: CreditCardDetailsModel;
  loading: boolean = true;
  error: boolean = false;
  languageFactor: string = 'en';
  private cardId!: number;

  // Tables data
  moneySentToList: any[] = [];
  moneySentToFiltered: any[] = [];
  moneySentToModel: any = {};

  moneyReceivedFromList: any[] = [];
  moneyReceivedFromFiltered: any[] = [];
  moneyReceivedFromModel: any = {};

  constructor(
    private creditCardsService: CreditCardsService,
    private creditCardsStore: CreditCardsStore,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private language: LanguagesService
  ) {
    this.language.currentLanguage.subscribe((lang) => {
      this.languageFactor = lang;
    });

    // React to signal changes automatically
    effect(() => {
      const details = this.creditCardsStore.creditCardDetails();
      console.log('Credit Card Details from store:', details);
      
      // Update component state based on signal value
      if (details !== null) {
        this.creditCardDetails = details;
        console.log('Credit Card Details assigned:', this.creditCardDetails);
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
    this.creditCardsStore.clearCreditCardDetails();
    
    this.cardId = this.config.data?.Id;
    if (this.cardId) {
      this.loadCreditCardDetails(this.cardId);
    } else {
      console.error('No credit card ID provided');
      this.loading = false;
      this.error = true;
    }
  }

  ngOnDestroy(): void {
    // Clean up when component is destroyed
    this.creditCardsStore.clearCreditCardDetails();
  }

  loadCreditCardDetails(id: number): void {
    this.loading = true;
    this.error = false;
    this.creditCardsService.getCreditCardDetails(id);
    
    // Set a timeout to handle cases where the API doesn't respond
    setTimeout(() => {
      if (this.loading && this.creditCardDetails === null) {
        this.loading = false;
        this.error = true;
      }
    }, 10000); // 10 second timeout
  }

  retry(): void {
    if (this.cardId) {
      this.loadCreditCardDetails(this.cardId);
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
    if (this.creditCardDetails.MoneySentTo) {
      this.creditCardDetails.MoneySentTo.forEach(group => {
        group.TransactionsByType.forEach(transaction => {
          sentToData.push({
            Date: group.Date,
            EntityTypeName: transaction.EntityTypeName,
            PhoneNumber: transaction.PhoneNumber || this.getLabel('N/A', 'غير متوفر'),
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
    if (this.creditCardDetails.MoneyReceivedFrom) {
      this.creditCardDetails.MoneyReceivedFrom.forEach(group => {
        group.TransactionsByType.forEach(transaction => {
          receivedFromData.push({
            Date: group.Date,
            EntityTypeName: transaction.EntityTypeName,
            PhoneNumber: transaction.PhoneNumber || this.getLabel('N/A', 'غير متوفر'),
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
