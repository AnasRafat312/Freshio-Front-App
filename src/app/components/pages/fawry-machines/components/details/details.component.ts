import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/shared/shared.module';
import { FawryMachinesService } from '../../services/fawry-machines.service';
import { FawryMachinesStore } from '../../store/fawry-machines.store';
import { FawryMachineDetailsModel } from '../../core/models/fawry-machine-details.model';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';

@Component({
  selector: 'app-fawry-machines-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class FawryMachinesDetailsComponent implements OnInit, OnDestroy {
  fawryMachineDetails!: FawryMachineDetailsModel;
  loading: boolean = true;
  error: boolean = false;
  languageFactor: string = 'en';
  private fawryMachineId!: number;

  // Tables data
  moneySentToList: any[] = [];
  moneySentToFiltered: any[] = [];
  moneySentToModel: any = {};

  moneyReceivedFromList: any[] = [];
  moneyReceivedFromFiltered: any[] = [];
  moneyReceivedFromModel: any = {};

  constructor(
    private fawryMachinesService: FawryMachinesService,
    private fawryMachinesStore: FawryMachinesStore,
    private config: DynamicDialogConfig,
    private ref: DynamicDialogRef,
    private language: LanguagesService
  ) {
    this.language.currentLanguage.subscribe((lang) => {
      this.languageFactor = lang;
    });

    // React to signal changes automatically
    effect(() => {
      const details = this.fawryMachinesStore.fawryMachineDetails();
      
      // Update component state based on signal value
      if (details !== null) {
        this.fawryMachineDetails = details;
        this.prepareTableData();
        this.loading = false;
        this.error = false;
      } else if (!this.loading) {
        this.error = true;
      }
    });

    this.initializeTableModels();
  }

  ngOnInit(): void {
    // Clear any previous details first
    this.fawryMachinesStore.clearFawryMachineDetails();
    
    this.fawryMachineId = this.config.data?.Id;
    if (this.fawryMachineId) {
      this.loadFawryMachineDetails(this.fawryMachineId);
    } else {
      console.error('No fawry machine ID provided');
      this.loading = false;
      this.error = true;
    }
  }

  ngOnDestroy(): void {
    this.fawryMachinesStore.clearFawryMachineDetails();
  }

  private loadFawryMachineDetails(id: number): void {
    this.loading = true;
    this.error = false;
    this.fawryMachinesService.getFawryMachineDetails(id);
  }

  private initializeTableModels(): void {
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

  private prepareTableData(): void {
    // Flatten MoneySentTo data - create completely new arrays
    const sentToData: any[] = [];
    if ((this.fawryMachineDetails as any).MoneySentTo) {
      (this.fawryMachineDetails as any).MoneySentTo.forEach((group: any) => {
        group.TransactionsByType.forEach((transaction: any) => {
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
    if ((this.fawryMachineDetails as any).MoneyReceivedFrom) {
      (this.fawryMachineDetails as any).MoneyReceivedFrom.forEach((group: any) => {
        group.TransactionsByType.forEach((transaction: any) => {
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

  close(): void {
    this.ref.close();
  }
}
