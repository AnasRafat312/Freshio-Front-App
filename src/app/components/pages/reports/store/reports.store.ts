import { Injectable, signal } from '@angular/core';
import { 
  StockShortageReportDto, 
  DashboardStatsDto, 
  TopSellingItemDto, 
  LatestOrderDto 
} from 'src/app/shared/model/freshio/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportsStore {
  
  // Signal to store stock shortages report
  private stockShortagesReportSignal = signal<StockShortageReportDto | null>(null);
  
  // Read-only accessor for the signal
  readonly stockShortagesReport = this.stockShortagesReportSignal.asReadonly();

  // Signal to store dashboard stats
  private dashboardStatsSignal = signal<DashboardStatsDto | null>(null);
  
  // Read-only accessor for dashboard stats
  readonly dashboardStats = this.dashboardStatsSignal.asReadonly();

  // Signal to store top selling items
  private topSellingItemsSignal = signal<TopSellingItemDto[]>([]);
  
  // Read-only accessor for top selling items
  readonly topSellingItems = this.topSellingItemsSignal.asReadonly();

  // Signal to store latest orders
  private latestOrdersSignal = signal<LatestOrderDto[]>([]);
  
  // Read-only accessor for latest orders
  readonly latestOrders = this.latestOrdersSignal.asReadonly();

  /**
   * Set stock shortages report
   * @param report - Stock shortages report data
   */
  setStockShortagesReport(report: StockShortageReportDto): void {
    this.stockShortagesReportSignal.set(report);
  }

  /**
   * Clear stock shortages report
   */
  clearStockShortagesReport(): void {
    this.stockShortagesReportSignal.set(null);
  }

  /**
   * Get current stock shortages report value (non-reactive)
   */
  getStockShortagesReportValue(): StockShortageReportDto | null {
    return this.stockShortagesReportSignal();
  }

  /**
   * Set dashboard stats
   * @param stats - Dashboard statistics data
   */
  setDashboardStats(stats: DashboardStatsDto): void {
    this.dashboardStatsSignal.set(stats);
  }

  /**
   * Clear dashboard stats
   */
  clearDashboardStats(): void {
    this.dashboardStatsSignal.set(null);
  }

  /**
   * Get current dashboard stats value (non-reactive)
   */
  getDashboardStatsValue(): DashboardStatsDto | null {
    return this.dashboardStatsSignal();
  }

  /**
   * Set top selling items
   * @param items - Top selling items data
   */
  setTopSellingItems(items: TopSellingItemDto[]): void {
    this.topSellingItemsSignal.set(items);
  }

  /**
   * Clear top selling items
   */
  clearTopSellingItems(): void {
    this.topSellingItemsSignal.set([]);
  }

  /**
   * Get current top selling items value (non-reactive)
   */
  getTopSellingItemsValue(): TopSellingItemDto[] {
    return this.topSellingItemsSignal();
  }

  /**
   * Set latest orders
   * @param orders - Latest orders data
   */
  setLatestOrders(orders: LatestOrderDto[]): void {
    this.latestOrdersSignal.set(orders);
  }

  /**
   * Clear latest orders
   */
  clearLatestOrders(): void {
    this.latestOrdersSignal.set([]);
  }

  /**
   * Get current latest orders value (non-reactive)
   */
  getLatestOrdersValue(): LatestOrderDto[] {
    return this.latestOrdersSignal();
  }
}
