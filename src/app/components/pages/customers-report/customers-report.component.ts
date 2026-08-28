import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { EntitiesService } from '../entities/services/entities.service';
import { CustomerReportDto } from 'src/app/shared/model/freshio/entity.model';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-customers-report',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './customers-report.component.html',
  styleUrls: ['./customers-report.component.scss']
})
export class CustomersReportComponent implements OnInit, OnDestroy {
  languageFactor = 'en';
  languageSubscription: Subscription;
  
  // Date filters
  fromDate: Date | null = null;
  toDate: Date | null = null;
  
  // Data
  mainList: CustomerReportDto[] = [];
  filteredList: CustomerReportDto[] = [];
  model: any = {};
  loading = false;

  constructor(
    private language: LanguagesService,
    private entitiesService: EntitiesService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.initializeModel();
    });
  }

  private initializeModel(): void {
    this.model = {
      Name: {
        filterType: FilterType.text,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Customer Name' : 'اسم العميل',
      },
      OrdersCount: {
        filterType: FilterType.number,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Orders Count' : 'عدد الأوردرات',
      },
      AverageOrderPrice: {
        filterType: FilterType.number,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Average Order Price' : 'متوسط سعر الأوردر',
      },
      LastOrderDate: {
        filterType: FilterType.date,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Last Order Date' : 'تاريخ آخر أوردر',
      },
      WhatsappPhoneNumber: {
        filterType: FilterType.text,
        filterList: [],
        header: this.languageFactor === 'en' ? 'WhatsApp Number' : 'رقم الواتساب',
      }
    };
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  searchCustomers(): void {
    const request: any = {};
    
    if (this.fromDate) {
      request.fromDate = this.sharedService.getDateTime(this.fromDate);
    }
    
    if (this.toDate) {
      request.toDate = this.sharedService.getDateTime(this.toDate);
    }

    this.loading = true;
    this.entitiesService.getCustomerReport(request)
      .subscribe({
        next: (response) => {
          if (response?.Success) {
            this.mainList = response?.Data || [];
            this.filteredList = [...this.mainList];
          } else {
            this.mainList = [];
            this.filteredList = [];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading customers report:', error);
          this.mainList = [];
          this.filteredList = [];
          this.loading = false;
        }
      });
  }
}
