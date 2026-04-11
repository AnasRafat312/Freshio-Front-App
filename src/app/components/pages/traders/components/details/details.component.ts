import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/shared/shared.module';
import { TradersService } from '../../services/traders.service';
import { TradersStore } from '../../store/traders.store';
import { TraderDetailsModel } from '../../core/models/trader-details.model';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';

@Component({
  selector: 'app-traders-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class TradersDetailsComponent implements OnInit, OnDestroy {
  traderDetails!: TraderDetailsModel;
  loading: boolean = true;
  error: boolean = false;
  languageFactor: string = 'en';
  private traderId!: number;

  // Table data
  moneySentList: any[] = [];
  moneySentFiltered: any[] = [];
  moneySentModel: any = {};

  constructor(
    private tradersService: TradersService,
    private tradersStore: TradersStore,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private language: LanguagesService
  ) {
    this.language.currentLanguage.subscribe((lang) => {
      this.languageFactor = lang;
    });

    // React to signal changes automatically
    effect(() => {
      const details = this.tradersStore.traderDetails();
      console.log('Trader Details from store:', details);
      
      // Update component state based on signal value
      if (details !== null) {
        this.traderDetails = details;
        console.log('Trader Details assigned:', this.traderDetails);
        this.prepareTableData();
        this.loading = false;
        this.error = false;
      } else if (!this.loading) {
        // If details are null and we're not loading, it might be an error
        console.log('Details are null, setting error state');
        this.error = true;
      }
    });

    this.initializeTableModel();
  }

  ngOnInit(): void {
    // Clear any previous details first
    this.tradersStore.clearTraderDetails();
    
    this.traderId = this.config.data?.Id;
    if (this.traderId) {
      this.loadTraderDetails(this.traderId);
    } else {
      console.error('No trader ID provided');
      this.loading = false;
      this.error = true;
    }
  }

  ngOnDestroy(): void {
    // Clean up when component is destroyed
    this.tradersStore.clearTraderDetails();
  }

  loadTraderDetails(id: number): void {
    this.loading = true;
    this.error = false;
    this.tradersService.getTraderDetails(id);
    
    // Set a timeout to handle cases where the API doesn't respond
    setTimeout(() => {
      if (this.loading && this.traderDetails === null) {
        this.loading = false;
        this.error = true;
      }
    }, 10000); // 10 second timeout
  }

  retry(): void {
    if (this.traderId) {
      this.loadTraderDetails(this.traderId);
    }
  }

  initializeTableModel(): void {
    this.moneySentModel = {
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
      Provider: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Provider' : 'المتعهد',
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
      }
    };
  }

  prepareTableData(): void {
    // Flatten MoneySentByDate data
    const sentData: any[] = [];
    if (this.traderDetails.MoneySentByDate) {
      this.traderDetails.MoneySentByDate.forEach(group => {
        group.TransactionsByType.forEach(transaction => {
          sentData.push({
            Date: group.Date,
            EntityTypeName: transaction.EntityTypeName,
            PhoneNumber: transaction.PhoneNumber || '-',
            Provider: transaction.Provider || '-',
            Amount: transaction.Amount
          });
        });
      });
    }
    // Create independent copies
    this.moneySentList = JSON.parse(JSON.stringify(sentData));
    this.moneySentFiltered = JSON.parse(JSON.stringify(sentData));
  }

  getLabel(enLabel: string, arLabel: string): string {
    return this.languageFactor === 'en' ? enLabel : arLabel;
  }

  closeDialog(): void {
    this.ref.close();
  }
}
