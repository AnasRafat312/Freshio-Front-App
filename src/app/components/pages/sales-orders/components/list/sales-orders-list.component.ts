import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';
import { SalesOrderModel, OrderStatus } from 'src/app/shared/model/freshio/sales-order.model';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { SalesOrdersAddEditComponent } from '../add-edit/add-edit.component';
import { SalesOrdersDetailsComponent } from '../details/details.component';
import { SalesOrdersService } from '../../services/sales-orders.service';
import { SalesOrdersStore } from '../../store/sales-orders.store';
import { RejectOrderDialogComponent } from '../dialogs/reject-order-dialog.component';
import { PartialApproveDialogComponent } from '../dialogs/partial-approve-dialog.component';
import { OrderShortagesDialogComponent } from '../dialogs/order-shortages-dialog.component';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-sales-orders-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './sales-orders-list.component.html',
  styleUrls: ['./sales-orders-list.component.scss']
})
export class SalesOrdersList implements OnInit, OnDestroy {
  mainList: SalesOrderModel[] = [];
  filteredList: SalesOrderModel[] = [];
  totalProfit:number = 0
  model: any = {};
  actionsList: ActionData[] = [];
  Add = true;
  ref: DynamicDialogRef | undefined;
  languageFactor = 'en';
  
  // Status filter options
  statusFilterOptions: any[] = [];
  selectedStatusFilter: string = 'All';

  constructor(
    private salesOrdersService: SalesOrdersService,
    private sharedServices: SharedService,
    private language: LanguagesService,
    public dialogService: DialogService,
    private constant: Constant,
    private salesOrdersStore: SalesOrdersStore,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.initializeModel();

    // React to signal changes automatically
    effect(() => {
      this.mainList = this.salesOrdersStore.salesOrders();
      this.applyStatusFilter();
      this.calculateTotalProfit()
    });
  }

  ngOnInit(): void {
    this.initializeStatusFilterOptions();
    this.getAllRows();
    this.getActionsList();
  }

  ngOnDestroy(): void {
    this.mainList = [];
    this.filteredList = [];
  }

  /**
   * Fetch sales orders data from API
   */
  getAllRows(): void {
    this.salesOrdersService.getSalesOrders();
  }

  /**
   * Get status label
   */
  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return this.languageFactor === 'en' ? 'Pending' : 'معلق';
      case OrderStatus.Approved:
        return this.languageFactor === 'en' ? 'Approved' : 'معتمد';
      case OrderStatus.PartiallyApproved:
        return this.languageFactor === 'en' ? 'Partially Approved' : 'معتمد جزئياً';
      case OrderStatus.Rejected:
        return this.languageFactor === 'en' ? 'Rejected' : 'مرفوض';
      case OrderStatus.Delivered:
        return this.languageFactor === 'en' ? 'Delivered' : 'تم التوصيل';
      default:
        return '';
    }
  }
  calculateTotalProfit() {
    this.totalProfit = 0
    this.filteredList.forEach(row => {
      this.totalProfit += row.TotalProfit
    })
  }
  /**
   * Get status badge severity
   */
  getStatusSeverity(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'warning';
      case OrderStatus.Approved:
        return 'success';
      case OrderStatus.PartiallyApproved:
        return 'info';
      case OrderStatus.Rejected:
        return 'danger';
      case OrderStatus.Delivered:
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  private initializeStatusFilterOptions(): void {
    this.statusFilterOptions = [
      { label: this.languageFactor === 'en' ? 'All' : 'الكل', value: 'All' },
      { label: this.languageFactor === 'en' ? 'Pending' : 'معلق', value: OrderStatus.Pending },
      { label: this.languageFactor === 'en' ? 'Approved' : 'معتمد', value: OrderStatus.Approved },
      { label: this.languageFactor === 'en' ? 'Partially Approved' : 'معتمد جزئياً', value: OrderStatus.PartiallyApproved },
      { label: this.languageFactor === 'en' ? 'Rejected' : 'مرفوض', value: OrderStatus.Rejected }
    ];
  }

  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.initializeStatusFilterOptions();
      this.model = {
        OrderNumber: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Order #' : 'رقم الأوردر',
        },
        OrderDate: {
          filterType: FilterType.date,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Date' : 'التاريخ',
        },
        CustomerName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Customer' : 'العميل',
        },
        TotalAmount: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Total' : 'الإجمالي',
        },
        TotalProfit: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Profit' : 'الربح',
        },
        StatusName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Status' : 'الحالة',
        }
      };
    });
  }

  getActionsList() {
    // Define all possible actions with conditions based on order status
    this.actionsList = [
      // Edit - only for Pending orders
      {
        tooltip: this.languageFactor === 'en' ? 'Edit' : 'تعديل',
        icon: 'pi pi-pencil',
        styleClass: 'p-button-warning',
        action: (row: SalesOrderModel) => this.addEdit(row),
        condition: (row: SalesOrderModel) => row.Status === OrderStatus.Pending
      },
      // Approve Full - only for Pending orders
      {
        tooltip: this.languageFactor === 'en' ? 'Approve Full' : 'موافقة كاملة',
        icon: 'pi pi-check-circle',
        styleClass: 'p-button-success',
        action: (row: SalesOrderModel) => this.approveFull(row),
        condition: (row: SalesOrderModel) => row.Status === OrderStatus.Pending
      },
      // Partial Approve - only for Pending orders
      {
        tooltip: this.languageFactor === 'en' ? 'Partial Approve' : 'موافقة جزئية',
        icon: 'pi pi-check',
        styleClass: 'p-button-help',
        action: (row: SalesOrderModel) => this.partialApprove(row),
        condition: (row: SalesOrderModel) => row.Status === OrderStatus.Pending
      },
      // Reject - only for Pending orders
      {
        tooltip: this.languageFactor === 'en' ? 'Reject' : 'رفض',
        icon: 'pi pi-times-circle',
        styleClass: 'p-button-danger',
        action: (row: SalesOrderModel) => this.rejectOrder(row),
        condition: (row: SalesOrderModel) => row.Status === OrderStatus.Pending
      },
/*       // View Shortages - only for Pending orders
      {
        tooltip: this.languageFactor === 'en' ? 'View Shortages' : 'عرض النواقص',
        icon: 'pi pi-exclamation-triangle',
        styleClass: 'p-button-warning',
        action: (row: SalesOrderModel) => this.viewShortages(row),
        condition: (row: SalesOrderModel) => row.Status === OrderStatus.Pending
      }, */
      // Return - only for Approved, PartiallyApproved, and Rejected orders
      {
        tooltip: this.languageFactor === 'en' ? 'Return' : 'إرجاع',
        icon: 'pi pi-replay',
        styleClass: 'p-button-warning',
        action: (row: SalesOrderModel) => this.returnOrder(row),
        condition: (row: SalesOrderModel) => row.Status === OrderStatus.Approved || row.Status === OrderStatus.PartiallyApproved || row.Status === OrderStatus.Rejected
      },
      // View Details - available for all statuses
      {
        tooltip: this.languageFactor === 'en' ? 'View Details' : 'عرض التفاصيل',
        icon: 'pi pi-eye',
        styleClass: 'p-button-info',
        action: (row: SalesOrderModel) => this.rowDetails(row),
      },
      // Invoice - only for Approved or PartiallyApproved orders
      {
        tooltip: this.languageFactor === 'en' ? 'Invoice' : 'فاتورة',
        icon: 'pi pi-file-pdf',
        styleClass: 'p-button-secondary',
        action: (row: SalesOrderModel) => this.viewInvoice(row)
      },
      // View Delete
      {
        tooltip: this.languageFactor === 'en' ? 'Delete' : 'حذف',
        icon: 'pi pi-trash',
        styleClass: 'p-button-danger',
        action: (row: SalesOrderModel) => this.deleteRow(row),
      },
    ];
  }

  addEdit(row?: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      row ? header = 'Edit Order' : header = 'Add Order';
    } else {
      row ? header = 'تعديل أوردر' : header = 'إضافة أوردر';
    }
    
    this.ref = this.dialogService.open(
      SalesOrdersAddEditComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: row,
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'xl-dialog-width',
        focusOnShow: false
      }
    );
    
    this.ref.onClose.subscribe((product) => {
      if (product) {
        row ? this.salesOrdersStore.updateSalesOrder(product):
        this.salesOrdersStore.addSalesOrder(product)
      }
    });
  }

  rowDetails(row: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Order Details';
    } else {
      header = 'تفاصيل الأوردر';
    }
    
    this.ref = this.dialogService.open(
      SalesOrdersDetailsComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: row,
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'xl-dialog-width',
        focusOnShow: false
      }
    );
  }

  onStatusFilterChange(event: any): void {
    this.selectedStatusFilter = event.value;
    this.applyStatusFilter();
  }

  private applyStatusFilter(): void {
    if (this.selectedStatusFilter === 'All') {
      this.filteredList = [...this.mainList];
    } else {
      const statusValue = Number(this.selectedStatusFilter) as OrderStatus;
      this.filteredList = this.mainList.filter(order => order.Status === statusValue);
    }
  }

  refresh(): void {
    this.getAllRows();
  }

  /**
   * Approve order fully
   */
  approveFull(row: SalesOrderModel): void {
    debugger
    const message = this.languageFactor === 'en' 
      ? 'Do you want to fully approve this order? All quantities will be deducted from inventory.'
      : 'هل تريد الموافقة الكاملة على الأوردر؟ سيتم خصم الكميات بالكامل من المخزون.';

    const header = this.languageFactor === 'en' ? 'Confirm Full Approval' : 'تأكيد الموافقة الكاملة';

    this.confirmationService.confirm({
      message: message,
      header: header,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.salesOrdersService.approveSalesOrder(row.ID!).subscribe({
          next: (response) => {
            if (response?.Success) {
              this.messageService.add({
                severity: 'success',
                summary: this.languageFactor === 'en' ? 'Success' : 'نجح',
                detail: this.languageFactor === 'en' ? 'Order approved successfully' : 'تم اعتماد الأوردر بنجاح'
              });
              // Update the order status in the signal
              const updatedOrder = { ...row, Status: OrderStatus.Approved };
              this.salesOrdersStore.updateSalesOrder(updatedOrder);
            } else {
              // Check if there are shortages
              if (response?.Shortages && response.Shortages.length > 0) {
                this.showShortagesDialog(response.Shortages);
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
                  detail: response?.Message || (this.languageFactor === 'en' ? 'Operation failed' : 'فشلت العملية')
                });
              }
            }
          },
          error: (error) => {
            // Check if there are shortages
              if (error?.error?.Shortages && error?.error?.Shortages.length > 0) {
                this.showShortagesDialog(error?.error.Shortages);
              }
            this.messageService.add({
              severity: 'error',
              summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
              detail: this.languageFactor === 'en' ? 'An error occurred' : 'حدث خطأ'
            });
          }
        });
      }
    });
  }

  /**
   * Partial approve order
   */
  partialApprove(row: SalesOrderModel): void {
    const header = this.languageFactor === 'en' ? 'Partial Approval' : 'موافقة جزئية';

    this.ref = this.dialogService.open(
      PartialApproveDialogComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: { 
          orderId: row.ID,
          items: row.SalesOrderItems
        },
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'lg-dialog-width',
        focusOnShow: false
      }
    );

    this.ref.onClose.subscribe((result) => {
      if (result) {
        // If result is an object (updated order data), use it; otherwise update status only
        if (typeof result === 'object' && result.ID) {
          this.salesOrdersStore.updateSalesOrder(result);
        } else {
          const updatedOrder = { ...row, Status: OrderStatus.PartiallyApproved };
          this.salesOrdersStore.updateSalesOrder(updatedOrder);
        }
      }
    });
  }

  /**
   * Reject order
   */
  rejectOrder(row: SalesOrderModel): void {
    const header = this.languageFactor === 'en' ? 'Reject Order' : 'رفض الأوردر';

    this.ref = this.dialogService.open(
      RejectOrderDialogComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: { orderId: row.ID },
        baseZIndex: 10000,
        styleClass: 'md-dialog-width',
        focusOnShow: false
      }
    );

    this.ref.onClose.subscribe((result) => {
      if (result) {
        // If result is an object (updated order data), use it; otherwise update status only
        if (typeof result === 'object' && result.ID) {
          this.salesOrdersStore.updateSalesOrder(result);
        } else {
          const updatedOrder = { ...row, Status: OrderStatus.Rejected };
          this.salesOrdersStore.updateSalesOrder(updatedOrder);
        }
      }
    });
  }

  /**
   * View order shortages
   */
  viewShortages(row: SalesOrderModel): void {
    this.salesOrdersService.getOrderShortages(row.ID!).subscribe({
      next: (response) => {
        if (response?.Success) {
          const shortages = response.Data || [];
          if (shortages.length === 0) {
            this.messageService.add({
              severity: 'info',
              summary: this.languageFactor === 'en' ? 'Info' : 'معلومات',
              detail: this.languageFactor === 'en' ? 'No shortages found for this order' : 'لا توجد نواقص لهذا الأوردر'
            });
          } else {
            this.showShortagesDialog(shortages);
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
            detail: response?.Message || (this.languageFactor === 'en' ? 'Failed to load shortages' : 'فشل تحميل النواقص')
          });
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
          detail: this.languageFactor === 'en' ? 'An error occurred' : 'حدث خطأ'
        });
      }
    });
  }

  /**
   * Show shortages dialog
   */
  private showShortagesDialog(shortages: any[]): void {
    const header = this.languageFactor === 'en' ? 'Stock Shortages' : 'نواقص المخزون';

    this.ref = this.dialogService.open(
      OrderShortagesDialogComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: { shortages: shortages },
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'lg-dialog-width',
        focusOnShow: false
      }
    );
  }

  /**
   * Return sales order (change status back to Pending)
   */
  returnOrder(row: SalesOrderModel): void {
    const message = this.languageFactor === 'en' 
      ? `Are you sure you want to return order ${row.OrderNumber}? The order status will be changed back to Pending.`
      : `هل أنت متأكد من إرجاع الأوردر ${row.OrderNumber}؟ سيتم تغيير حالة الأوردر إلى معلق.`;

    const header = this.languageFactor === 'en' ? 'Confirm Return' : 'تأكيد الإرجاع';

    this.confirmationService.confirm({
      message: message,
      header: header,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.salesOrdersService.returnSalesOrder(row.ID!).subscribe({
          next: (response) => {
            if (response?.Success) {
              this.messageService.add({
                severity: 'success',
                summary: this.languageFactor === 'en' ? 'Success' : 'نجح',
                detail: this.languageFactor === 'en' ? 'Order returned to pending successfully' : 'تم إرجاع الأوردر إلى معلق بنجاح'
              });
              // Update the order status in the signal
              const updatedOrder = { ...row, Status: OrderStatus.Pending };
              this.salesOrdersStore.updateSalesOrder(updatedOrder);
            } else {
              this.messageService.add({
                severity: 'error',
                summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
                detail: response?.Message || (this.languageFactor === 'en' ? 'Failed to return order' : 'فشل إرجاع الأوردر')
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
              detail: this.languageFactor === 'en' ? 'An error occurred while returning the order' : 'حدث خطأ أثناء إرجاع الأوردر'
            });
          }
        });
      }
    });
  }

  /**
   * View invoice (placeholder - implement when invoice component is ready)
   */
  viewInvoice(row: SalesOrderModel): void {
    this.messageService.add({
      severity: 'info',
      summary: this.languageFactor === 'en' ? 'Info' : 'معلومات',
      detail: this.languageFactor === 'en' ? 'Invoice feature coming soon' : 'ميزة الفاتورة قريباً'
    });
    // TODO: Implement invoice preview/print functionality
  }

  /**
   * Delete sales order
   */
  deleteRow(row: SalesOrderModel): void {
    const message = this.languageFactor === 'en' 
      ? `Are you sure you want to delete order ${row.OrderNumber}? This action cannot be undone.`
      : `هل أنت متأكد من حذف الأوردر ${row.OrderNumber}؟ لا يمكن التراجع عن هذا الإجراء.`;

    const header = this.languageFactor === 'en' ? 'Confirm Delete' : 'تأكيد الحذف';

    this.confirmationService.confirm({
      message: message,
      header: header,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.salesOrdersService.deleteSalesOrder(row.ID!).subscribe({
          next: (response) => {
            if (response?.Success) {
              this.messageService.add({
                severity: 'success',
                summary: this.languageFactor === 'en' ? 'Success' : 'نجح',
                detail: this.languageFactor === 'en' ? 'Order deleted successfully' : 'تم حذف الأوردر بنجاح'
              });
              this.salesOrdersStore.removeSalesOrder(row.ID!);
            } else {
              this.messageService.add({
                severity: 'error',
                summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
                detail: response?.Message || (this.languageFactor === 'en' ? 'Failed to delete order' : 'فشل حذف الأوردر')
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: this.languageFactor === 'en' ? 'Error' : 'خطأ',
              detail: this.languageFactor === 'en' ? 'An error occurred while deleting the order' : 'حدث خطأ أثناء حذف الأوردر'
            });
          }
        });
      }
    });
  }
}
