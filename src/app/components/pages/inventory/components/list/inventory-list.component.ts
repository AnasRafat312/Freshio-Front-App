import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';
import { InventoryModel, StockStatus } from 'src/app/shared/model/freshio/inventory.model';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { InventoryService } from '../../services/inventory.service';
import { InventoryStore } from '../../store/inventory.store';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { ItemsDetailsComponent } from '../../../items/components/details/details.component';
import { ItemsStore } from '../../../items/store/items.store';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss']
})
export class InventoryList implements OnInit, OnDestroy {
  mainList: InventoryModel[] = [];
  filteredList: InventoryModel[] = [];
  model: any = {};
  actionsList: ActionData[] = [];
  ref: DynamicDialogRef | undefined;
  languageFactor = 'en';
  
  // Stock status filter options
  stockStatusOptions: any[] = [];
  selectedStockStatus: string = 'All';

  // Computed property for total cost
  get totalCost(): number {
    return this.filteredList.reduce((sum, item) => sum + (item.TotalCost || 0), 0);
  }

  constructor(
    private inventoryService: InventoryService,
    private language: LanguagesService,
    private inventoryStore: InventoryStore,
    private itemsStore: ItemsStore,
    public dialogService: DialogService
  ) {
    this.initializeModel();

    // React to signal changes automatically
    effect(() => {
      const inventory = this.inventoryStore.inventory();
      // Calculate stock status on frontend if not provided
      this.mainList = inventory.map(item => ({
        ...item,
        StockStatus: this.calculateStockStatus(item)
      }));
      this.applyStockStatusFilter();
    });
  }

  ngOnInit(): void {
    this.initializeStockStatusOptions();
    this.getAllRows();
    this.getActionsList();
  }

  ngOnDestroy(): void {
    this.mainList = [];
    this.filteredList = [];
  }

  /**
   * Fetch inventory data from API
   */
  getAllRows(): void {
    this.inventoryService.getInventory();
  }

  /**
   * Calculate stock status based on available quantity and minimum stock
   */
  private calculateStockStatus(item: InventoryModel): StockStatus {
    if (item.AvailableQuantity <= 0) {
      return StockStatus.OutOfStock;
    } else if (item.MinimumStockQuantity != null && item.AvailableQuantity <= item.MinimumStockQuantity) {
      return StockStatus.LowStock;
    } else {
      return StockStatus.Normal;
    }
  }

  /**
   * Get stock status label
   */
  getStockStatusLabel(status: StockStatus): string {
    switch (status) {
      case StockStatus.OutOfStock:
        return this.languageFactor === 'en' ? 'Out of Stock' : 'نفد المخزون';
      case StockStatus.LowStock:
        return this.languageFactor === 'en' ? 'Low Stock' : 'مخزون منخفض';
      case StockStatus.Normal:
      default:
        return this.languageFactor === 'en' ? 'Normal' : 'طبيعي';
    }
  }

  /**
   * Get stock status severity for badge
   */
  getStockStatusSeverity(status: StockStatus): string {
    switch (status) {
      case StockStatus.OutOfStock:
        return 'danger';
      case StockStatus.LowStock:
        return 'warning';
      case StockStatus.Normal:
      default:
        return 'success';
    }
  }

  /**
   * Get row background color based on stock status
   */
  getRowStyle = (row: InventoryModel): any => {
    switch (row.StockStatus) {
      case StockStatus.OutOfStock:
        return { 'background-color': '#fee2e2', 'color': '#991b1b' }; // Light red background, dark red text
      case StockStatus.LowStock:
        return { 'background-color': '#fef3c7', 'color': '#92400e' }; // Light yellow background, dark yellow text
      case StockStatus.Normal:
      default:
        return {}; // Default styling
    }
  }

  private initializeStockStatusOptions(): void {
    this.stockStatusOptions = [
      { label: this.languageFactor === 'en' ? 'All' : 'الكل', value: 'All' },
      { label: this.languageFactor === 'en' ? 'Normal' : 'طبيعي', value: 'Normal' },
      { label: this.languageFactor === 'en' ? 'Low Stock' : 'مخزون منخفض', value: 'LowStock' },
      { label: this.languageFactor === 'en' ? 'Out of Stock' : 'نفد المخزون', value: 'OutOfStock' }
    ];
  }

  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.initializeStockStatusOptions();
      this.model = {
        Name: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Item Name' : 'اسم الصنف',
        },
        /* UnitOfMeasure: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Unit' : 'وحدة القياس',
        }, */
        AvailableQuantity: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Available Qty' : 'الكمية المتاحة',
        },
        AveragePurchasePrice: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Avg Cost' : 'متوسط تكلفة الوحدة',
        },
        TotalCost: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Total Cost' : 'تكلفة الصنف',
        },
        /* MinimumStockQuantity: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Min Stock' : 'الحد الأدنى',
        },
        StockStatus: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Status' : 'الحالة',
        }, */
      };
    });
  }

  getActionsList() {
    /* this.actionsList.push({
      tooltip: this.languageFactor === 'en' ? 'View Item' : 'عرض الصنف',
      icon: 'pi pi-eye',
      styleClass: 'p-button-info',
      action: (row: any) => this.viewItemDetails(row),
    }); */
  }

  viewItemDetails(row: any): void {
    // Find the full item details from items store if available
    const items = this.itemsStore.getItemsValue();
    const item = items.find(i => i.ID === row.ItemId);
    
    if (item) {
      let header = '';
      if (this.languageFactor == 'en') {
        header = 'Item Details';
      } else {
        header = 'تفاصيل الصنف';
      }
      
      this.ref = this.dialogService.open(
        ItemsDetailsComponent,
        {
          header: header,
          contentStyle: { overflow: 'auto' },
          data: item,
          baseZIndex: 10000,
          maximizable: true,
          resizable: true,
          styleClass: 'xl-dialog-width'
        }
      );
    }
  }

  onStockStatusFilterChange(event: any): void {
    this.selectedStockStatus = event.value;
    this.applyStockStatusFilter();
  }

  private applyStockStatusFilter(): void {
    if (this.selectedStockStatus === 'All') {
      this.filteredList = [...this.mainList];
    } else {
      const statusValue = StockStatus[this.selectedStockStatus as keyof typeof StockStatus];
      this.filteredList = this.mainList.filter(item => item.StockStatus === statusValue);
    }
  }

  refresh(): void {
    this.getAllRows();
  }
}
