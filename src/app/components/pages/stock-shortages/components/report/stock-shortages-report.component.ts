import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { ReportsService } from '../../../reports/services/reports.service';
import { ReportsStore } from '../../../reports/store/reports.store';
import { StockShortageReportItemDto, StockShortageReportFilterDto } from 'src/app/shared/model/freshio/report.model';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { EntitiesService } from '../../../entities/services/entities.service';
import { EntitiesStore } from '../../../entities/store/entities.store';
import { ItemsService } from '../../../items/services/items.service';
import { ItemsStore } from '../../../items/store/items.store';
import { EntityRole } from 'src/app/shared/model/freshio/entity.model';
import { PurchasesAddEditComponent } from '../../../purchases/components/add-edit/add-edit.component';

@Component({
  selector: 'app-stock-shortages-report',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './stock-shortages-report.component.html',
  styleUrls: ['./stock-shortages-report.component.scss']
})
export class StockShortagesReport implements OnInit, OnDestroy {
  mainList: StockShortageReportItemDto[] = [];
  filteredList: StockShortageReportItemDto[] = [];
  model: any = {};
  languageFactor = 'en';
  languageSubscription: Subscription;
  loading = false;
  
  // Filter form
  filterForm: FormGroup;
  customerOptions: any[] = [];
  itemOptions: any[] = [];
  
  ref: DynamicDialogRef | undefined;

  constructor(
    private fb: FormBuilder,
    private language: LanguagesService,
    private reportsService: ReportsService,
    private reportsStore: ReportsStore,
    private entitiesService: EntitiesService,
    private entitiesStore: EntitiesStore,
    private itemsService: ItemsService,
    private itemsStore: ItemsStore,
    private messageService: MessageService,
    public dialogService: DialogService
  ) {
    this.initializeModel();
    this.initializeFilterForm();

    // React to signal changes automatically
    effect(() => {
      const report = this.reportsStore.stockShortagesReport();
      if (report && report.Items) {
        this.mainList = report.Items;
        this.filteredList = [...report.Items];
      } else {
        this.mainList = [];
        this.filteredList = [];
      }
    });
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.initializeModel();
    });

    // Load filter options
    this.loadCustomers();
    this.loadItems();
    
    // Load initial report
    this.loadReport();
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
    this.mainList = [];
    this.filteredList = [];
  }

  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      FromDate: [null],
      ToDate: [null],
      CustomerEntityId: [null],
      ItemId: [null]
    });
  }

  private initializeModel(): void {
    this.model = {
      ItemName: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Item' : 'الصنف',
      },
      UnitOfMeasure: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Unit' : 'وحدة القياس',
      },
      RequiredQuantity: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Required Qty' : 'الكمية المطلوبة',
      },
      AvailableQuantity: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Available Qty' : 'الكمية المتاحة',
      },
      MissingQuantity: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Missing Qty' : 'الكمية الناقصة',
      },
      AveragePurchasePrice: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Avg Purchase Cost' : 'متوسط تكلفة الشراء',
      },
      EstimatedPurchaseCost: {
        filterType: FilterType.multi,
        filterList: [],
        header: this.languageFactor === 'en' ? 'Estimated Cost' : 'تكلفة الشراء التقديرية',
      },
    };
  }

  private loadCustomers(): void {
    this.entitiesService.getEntities();
    const entities = this.entitiesStore.getEntitiesValue();
    
    this.customerOptions = [
      { label: this.languageFactor === 'en' ? 'All Customers' : 'جميع العملاء', value: null },
      ...entities
        .filter(entity => entity.IsCustomer && entity.IsActive)
        .map(entity => ({
          label: entity.Name,
          value: entity.ID
        }))
    ];
  }

  private loadItems(): void {
    this.itemsService.getItems();
    const items = this.itemsStore.getItemsValue();
    
    this.itemOptions = [
      { label: this.languageFactor === 'en' ? 'All Items' : 'جميع الأصناف', value: null },
      ...items
        .filter(item => item.IsActive)
        .map(item => ({
          label: `${item.Name} (${item.UnitOfMeasure})`,
          value: item.ID
        }))
    ];
  }

  loadReport(): void {
    this.loading = true;
    
    const filter: StockShortageReportFilterDto = {
      FromDate: this.filterForm.get('FromDate')?.value,
      ToDate: this.filterForm.get('ToDate')?.value,
      CustomerEntityId: this.filterForm.get('CustomerEntityId')?.value,
      ItemId: this.filterForm.get('ItemId')?.value
    };

    this.reportsService.getStockShortagesReport(filter);
    
    // Set loading to false after a short delay (service doesn't return observable)
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  onFilterChange(): void {
    this.loadReport();
  }

  onRefresh(): void {
    this.loadReport();
  }

  onExport(): void {
    this.loading = true;
    
    const filter: StockShortageReportFilterDto = {
      FromDate: this.filterForm.get('FromDate')?.value,
      ToDate: this.filterForm.get('ToDate')?.value,
      CustomerEntityId: this.filterForm.get('CustomerEntityId')?.value,
      ItemId: this.filterForm.get('ItemId')?.value
    };

    this.reportsService.exportStockShortagesExcel(filter).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `stock-shortages-${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: this.languageFactor === 'en' ? 'Success' : 'نجح',
          detail: this.languageFactor === 'en' ? 'Report exported successfully' : 'تم تصدير التقرير بنجاح'
        });
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
          detail: this.languageFactor === 'en' ? 'Failed to export report' : 'فشل تصدير التقرير'
        });
        this.loading = false;
      }
    });
  }

  onCreatePurchaseFromShortages(): void {
    if (this.filteredList.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: this.languageFactor === 'en' ? 'Warning' : 'تحذير',
        detail: this.languageFactor === 'en' ? 'No shortages to create purchase from' : 'لا توجد نواقص لإنشاء مشتريات منها'
      });
      return;
    }

    // Prepare purchase items from shortages
    const purchaseItems = this.filteredList.map(item => ({
      ItemId: item.ItemId,
      Quantity: item.MissingQuantity,
      UnitPrice: item.AveragePurchasePrice || 0,
      Notes: this.languageFactor === 'en' 
        ? `From shortages report - Required: ${item.RequiredQuantity}, Available: ${item.AvailableQuantity}`
        : `من تقرير النواقص - المطلوب: ${item.RequiredQuantity}، المتاح: ${item.AvailableQuantity}`
    }));

    const header = this.languageFactor === 'en' ? 'Create Purchase From Shortages' : 'إنشاء مشتريات من النواقص';
    
    this.ref = this.dialogService.open(
      PurchasesAddEditComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: {
          prefillItems: purchaseItems
        },
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'xl-dialog-width'
      }
    );
    
    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.messageService.add({
          severity: 'success',
          summary: this.languageFactor === 'en' ? 'Success' : 'نجح',
          detail: this.languageFactor === 'en' ? 'Purchase created successfully' : 'تم إنشاء المشتريات بنجاح'
        });
        // Reload report to reflect changes
        this.loadReport();
      }
    });
  }

  getTotalMissingQuantity(): number {
    return this.filteredList.reduce((sum, item) => sum + item.MissingQuantity, 0);
  }

  getTotalEstimatedCost(): number {
    return this.filteredList.reduce((sum, item) => sum + item.EstimatedPurchaseCost, 0);
  }
}
