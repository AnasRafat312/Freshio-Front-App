import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SalesOrdersService } from '../sales-orders/services/sales-orders.service';
import { OrderItemsByDateDto } from 'src/app/shared/model/freshio/sales-order.model';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-orders-dashboard',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './orders-dashboard.component.html',
  styleUrls: ['./orders-dashboard.component.scss']
})
export class OrdersDashboardComponent implements OnInit, OnDestroy {
  languageFactor = 'en';
  languageSubscription: Subscription;
  
  // Date filters
  fromDate: Date = new Date();
  toDate: Date = new Date();
  
  // Data
  mainList: OrderItemsByDateDto[] = [];
  filteredList: OrderItemsByDateDto[] = [];
  model: any = {};
  loading = false;

  constructor(
    private language: LanguagesService,
    private salesOrdersService: SalesOrdersService,
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
      ItemName: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Item Name' : 'اسم الصنف',
      },
      Comment: {
        filterType: FilterType.text,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Comments' : 'تعليقات',
      },
      TotalRequestedQuantity: {
        filterType: FilterType.number,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Total Requested' : 'إجمالي المطلوب',
      },
      TotalApprovedQuantity: {
        filterType: FilterType.number,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Total Approved' : 'إجمالي المعتمد',
      }
    };
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  searchOrders(): void {
    if (!this.fromDate || !this.toDate) {
      return;
    }
    const FROMDATETIME = this.sharedService.getDateTime(this.fromDate)
    const TODATETIME = this.sharedService.getDateTime(this.toDate)
    this.loading = true;
    this.salesOrdersService.getOrdersItemsByDate(FROMDATETIME, TODATETIME)
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
          console.error('Error loading orders dashboard:', error);
          this.mainList = [];
          this.filteredList = [];
          this.loading = false;
        }
      });
  }
}
