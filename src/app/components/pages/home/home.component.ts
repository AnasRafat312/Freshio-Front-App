import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeneralConfig } from 'src/app/core/common/generalConfig';
import { LanguageService } from 'src/app/core/languageLocalization/language.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PageNaming } from 'src/app/shared/components/page-info/core/page-naming';
import { SalesOrdersService } from '../sales-orders/services/sales-orders.service';
import { SalesOrdersStore } from '../sales-orders/store/sales-orders.store';
import { PurchasesService } from '../purchases/services/purchases.service';
import { PurchasesStore } from '../purchases/store/purchases.store';
import { WasteService } from '../waste/services/waste.service';
import { WasteStore } from '../waste/store/waste.store';
import { InventoryService } from '../inventory/services/inventory.service';
import { InventoryStore } from '../inventory/store/inventory.store';
import { ReportsService } from '../reports/services/reports.service';
import { ReportsStore } from '../reports/store/reports.store';
import { OrderStatus } from 'src/app/shared/model/freshio/sales-order.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends GeneralConfig implements OnInit, OnDestroy {
  languageFactor = 'ar';
  loading = true;
  
  // Dashboard Metrics
  pendingOrdersCount = 0;
  approvedOrdersToday = 0;
  totalSalesToday = 0;
  totalProfitToday = 0;
  purchasesToday = 0;
  wasteToday = 0;
  lowStockItemsCount = 0;
  shortageItemsCount = 0;

  // Latest data
  latestOrders: any[] = [];
  topShortages: any[] = [];
  lowStockItems: any[] = [];

  constructor(
    languageService: LanguageService,
    private language: LanguagesService,
    private sharedService: SharedService,
    private salesOrdersService: SalesOrdersService,
    private salesOrdersStore: SalesOrdersStore,
    private purchasesService: PurchasesService,
    private purchasesStore: PurchasesStore,
    private wasteService: WasteService,
    private wasteStore: WasteStore,
    private inventoryService: InventoryService,
    private inventoryStore: InventoryStore,
    private reportsService: ReportsService,
    private reportsStore: ReportsStore
  ) {
    super(languageService);
    this.language.currentLanguage.subscribe(data => {
      this.languageFactor = data;
    });
    sharedService.setPageLocalName(PageNaming.HOME_PAGE);
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    // Load all necessary data
    this.salesOrdersService.getSalesOrders();
    this.purchasesService.getPurchases();
    this.wasteService.getWasteRecords();
    this.inventoryService.getInventory();
    this.reportsService.getStockShortagesReport({});

    // Calculate metrics after a short delay to ensure data is loaded
    setTimeout(() => {
      this.calculateMetrics();
      this.loading = false;
    }, 1000);
  }

  private calculateMetrics(): void {
    debugger
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get data from stores
    const orders = this.salesOrdersStore.getSalesOrdersValue();
    const purchases = this.purchasesStore.getPurchasesValue();
    const wasteRecords = this.wasteStore.getWasteRecordsValue();
    const inventory = this.inventoryStore.getInventoryValue();
    const shortagesReport = this.reportsStore.getStockShortagesReportValue();

    // Pending Orders Count
    this.pendingOrdersCount = orders.filter(o => o.Status === OrderStatus.Pending).length;

    // Approved Orders Today
    this.approvedOrdersToday = orders.filter(o => {
      if (o.Status !== OrderStatus.Approved) return false;
      const orderDate = new Date(o.ModifiedDate || o.OrderDate);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    }).length;

    // Total Sales Today
    this.totalSalesToday = orders
      .filter(o => {
        if (o.Status !== OrderStatus.Approved && o.Status !== OrderStatus.PartiallyApproved) return false;
        const orderDate = new Date(o.ModifiedDate || o.OrderDate);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      })
      .reduce((sum, o) => sum + (o.TotalAmount || 0), 0);

    // Total Profit Today
    this.totalProfitToday = orders
      .filter(o => {
        if (o.Status !== OrderStatus.Approved && o.Status !== OrderStatus.PartiallyApproved) return false;
        const orderDate = new Date(o.ModifiedDate || o.OrderDate);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      })
      .reduce((sum, o) => sum + (o.TotalProfit || 0), 0);

    // Purchases Today
    this.purchasesToday = purchases
      .filter(p => {
        const purchaseDate = new Date(p.PurchaseDate);
        purchaseDate.setHours(0, 0, 0, 0);
        return purchaseDate.getTime() === today.getTime();
      })
      .reduce((sum, p) => sum + (p.TotalAmount || 0), 0);

    // Waste Today
    this.wasteToday = wasteRecords.filter(w => {
      const wasteDate = new Date(w.WasteDate);
      wasteDate.setHours(0, 0, 0, 0);
      return wasteDate.getTime() === today.getTime();
    }).length;

    // Low Stock Items Count
    this.lowStockItemsCount = inventory.filter(item => 
      item.AvailableQuantity <= (item.MinimumStockQuantity || 0)
    ).length;

    // Shortage Items Count
    if (shortagesReport && shortagesReport.Items) {
      this.shortageItemsCount = shortagesReport.Items.filter(item => item.MissingQuantity > 0).length;
      this.topShortages = shortagesReport.Items.slice(0, 5);
    }

    // Latest Orders (last 5)
    this.latestOrders = orders
      .sort((a, b) => new Date(b.OrderDate).getTime() - new Date(a.OrderDate).getTime())
      .slice(0, 5);

    // Low Stock Items (top 5)
    this.lowStockItems = inventory
      .filter(item => item.AvailableQuantity <= (item.MinimumStockQuantity || 0))
      .sort((a, b) => a.AvailableQuantity - b.AvailableQuantity)
      .slice(0, 5);
  }

  getStatusLabel(status: OrderStatus): string {
    const labels = {
      [OrderStatus.Pending]: this.languageFactor === 'en' ? 'Pending' : 'معلق',
      [OrderStatus.Approved]: this.languageFactor === 'en' ? 'Approved' : 'معتمد',
      [OrderStatus.PartiallyApproved]: this.languageFactor === 'en' ? 'Partially Approved' : 'معتمد جزئياً',
      [OrderStatus.Rejected]: this.languageFactor === 'en' ? 'Rejected' : 'مرفوض'
    };
    return labels[status] || '';
  }

  getStatusSeverity(status: OrderStatus): string {
    const severities = {
      [OrderStatus.Pending]: 'warning',
      [OrderStatus.Approved]: 'success',
      [OrderStatus.PartiallyApproved]: 'info',
      [OrderStatus.Rejected]: 'danger'
    };
    return severities[status] || 'secondary';
  }
}
