import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/shared/shared.module';
import { YellowCardsService } from '../../services/yellow-cards.service';
import { YellowCardsStore } from '../../store/yellow-cards.store';
import { YellowCardDetailsModel } from '../../core/models/yellow-card-details.model';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';

@Component({
  selector: 'app-yellow-cards-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class YellowCardsDetailsComponent implements OnInit, OnDestroy {
  yellowCardDetails!: YellowCardDetailsModel;
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
    private yellowCardsService: YellowCardsService,
    private yellowCardsStore: YellowCardsStore,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private language: LanguagesService
  ) {
    this.language.currentLanguage.subscribe((lang) => {
      this.languageFactor = lang;
    });

    // React to signal changes automatically
    effect(() => {
      const details = this.yellowCardsStore.yellowCardDetails();
      console.log('Yellow Card Details from store:', details);
      
      // Update component state based on signal value
      if (details !== null) {
        this.yellowCardDetails = details;
        console.log('Yellow Card Details assigned:', this.yellowCardDetails);
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
    this.yellowCardsStore.clearYellowCardDetails();
    
    this.cardId = this.config.data?.Id;
    if (this.cardId) {
      this.loadYellowCardDetails(this.cardId);
    } else {
      console.error('No yellow card ID provided');
      this.loading = false;
      this.error = true;
    }
  }

  ngOnDestroy(): void {
    // Clean up when component is destroyed
    this.yellowCardsStore.clearYellowCardDetails();
  }

  loadYellowCardDetails(id: number): void {
    this.loading = true;
    this.error = false;
    this.yellowCardsService.getYellowCardDetails(id);
    
    // Set a timeout to handle cases where the API doesn't respond
    setTimeout(() => {
      if (this.loading && this.yellowCardDetails === null) {
        this.loading = false;
        this.error = true;
      }
    }, 10000); // 10 second timeout
  }

  retry(): void {
    if (this.cardId) {
      this.loadYellowCardDetails(this.cardId);
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
    if (this.yellowCardDetails.MoneySentTo) {
      this.yellowCardDetails.MoneySentTo.forEach(group => {
        group.TransactionsByType.forEach(transaction => {
          sentToData.push({
            Date: group.Date,
            EntityTypeName: transaction.EntityTypeName,
            PhoneNumber: transaction.PhoneNumber || this.getLabel('N/A', 'غير متوفر'),
            CardNumber: transaction.CardNumber || this.getLabel('N/A', 'غير متوفر'),
            Provider: transaction.Provider || this.getLabel('N/A', 'غير متوفر'),
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
    if (this.yellowCardDetails.MoneyReceivedFrom) {
      this.yellowCardDetails.MoneyReceivedFrom.forEach(group => {
        group.TransactionsByType.forEach(transaction => {
          receivedFromData.push({
            Date: group.Date,
            EntityTypeName: transaction.EntityTypeName,
            PhoneNumber: transaction.PhoneNumber || this.getLabel('N/A', 'غير متوفر'),
            CardNumber: transaction.CardNumber || this.getLabel('N/A', 'غير متوفر'),
            Provider: transaction.Provider || this.getLabel('N/A', 'غير متوفر'),
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
