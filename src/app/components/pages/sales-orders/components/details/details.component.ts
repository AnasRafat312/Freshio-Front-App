import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { SalesOrderModel, OrderStatus, ApproveOrderResultDto } from 'src/app/shared/model/freshio/sales-order.model';
import { SalesOrdersService } from '../../services/sales-orders.service';
import { SalesOrdersStore } from '../../store/sales-orders.store';
import { SalesOrdersAddEditComponent } from '../add-edit/add-edit.component';
import { PartialApproveDialogComponent } from '../dialogs/partial-approve-dialog.component';
import { RejectOrderDialogComponent } from '../dialogs/reject-order-dialog.component';
import { OrderShortagesDialogComponent } from '../dialogs/order-shortages-dialog.component';
import { InvoicePreview } from '../../../invoices/components/invoice-preview/invoice-preview.component';

@Component({
  selector: 'app-sales-orders-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  providers: [ConfirmationService]
})
export class SalesOrdersDetailsComponent implements OnInit, OnDestroy {
  order: SalesOrderModel;
  languageFactor = 'en';
  languageSubscription: Subscription;
  loading = false;
  OrderStatus = OrderStatus;

  constructor(
    private language: LanguagesService,
    private salesOrdersService: SalesOrdersService,
    private salesOrdersStore: SalesOrdersStore,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public dialogService: DialogService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    if (this.config.data) {
      this.order = this.config.data;
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  getLabel(enLabel: string, arLabel: string): string {
    return this.languageFactor === 'en' ? enLabel : arLabel;
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return this.languageFactor === 'en' ? 'Pending' : 'معلق';
      case OrderStatus.Approved:
        return this.languageFactor === 'en' ? 'Approved' : 'مقبول';
      case OrderStatus.PartiallyApproved:
        return this.languageFactor === 'en' ? 'Partially Approved' : 'مقبول جزئياً';
      case OrderStatus.Rejected:
        return this.languageFactor === 'en' ? 'Rejected' : 'مرفوض';
      case OrderStatus.Delivered:
        return this.languageFactor === 'en' ? 'Delivered' : 'تم التوصيل';
      default:
        return '';
    }
  }

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

  isPending(): boolean {
    return this.order?.Status === OrderStatus.Pending;
  }

  isApprovedOrPartial(): boolean {
    return this.order?.Status === OrderStatus.Approved || this.order?.Status === OrderStatus.PartiallyApproved;
  }

  onEdit(): void {
    const header = this.languageFactor === 'en' ? 'Edit Order' : 'تعديل أوردر';
    
    const editRef = this.dialogService.open(
      SalesOrdersAddEditComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: this.order,
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'xl-dialog-width'
      }
    );
    
    editRef.onClose.subscribe((result) => {
      if (result) {
        this.salesOrdersStore.updateSalesOrder(result);
        // Reload order details
        this.order = result;
      }
    });
  }

  onFullApproval(): void {
    this.confirmationService.confirm({
      message: this.languageFactor === 'en'
        ? 'Do you want to fully approve this order? Full quantities will be deducted from inventory.'
        : 'هل تريد الموافقة الكاملة على الأوردر؟ سيتم خصم الكميات بالكامل من المخزون.',
      header: this.getLabel('Full Approval', 'الموافقة الكاملة'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.approveOrderFull();
      }
    });
  }

  private approveOrderFull(): void {
    this.loading = true;
    this.salesOrdersService.approveSalesOrder(this.order.ID!).subscribe({
      next: (response) => {
        if (response?.Success) {
          const approvalResult = response.Data as ApproveOrderResultDto;
          
          // Check if approval was successful or has shortages
          if (approvalResult?.Success) {
            this.messageService.add({
              severity: 'success',
              summary: this.getLabel('Success', 'نجح'),
              detail: this.getLabel('Order approved successfully', 'تم اعتماد الأوردر بنجاح')
            });
            
            // Reload order
            this.salesOrdersService.getSalesOrders();
            this.ref.close(true);
          } else if (approvalResult?.Shortages && approvalResult.Shortages.length > 0) {
            // Show shortages dialog
            this.messageService.add({
              severity: 'warn',
              summary: this.getLabel('Shortages Detected', 'تم اكتشاف نواقص'),
              detail: this.getLabel('Cannot approve because stock is insufficient', 'لا يمكن الموافقة بسبب نقص المخزون')
            });
            this.openShortagesDialog(approvalResult.Shortages);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.getLabel('Error', 'خطأ'),
              detail: approvalResult?.Message || this.getLabel('Operation failed', 'فشلت العملية')
            });
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.getLabel('Error', 'خطأ'),
            detail: response?.Message || this.getLabel('Operation failed', 'فشلت العملية')
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.getLabel('Error', 'خطأ'),
          detail: this.getLabel('An error occurred', 'حدث خطأ')
        });
        this.loading = false;
      }
    });
  }

  onPartialApproval(): void {
    const dialogRef = this.dialogService.open(
      PartialApproveDialogComponent,
      {
        header: this.getLabel('Partial Approval', 'الموافقة الجزئية'),
        contentStyle: { overflow: 'auto' },
        data: {
          orderId: this.order.ID,
          items: this.order.Items
        },
        baseZIndex: 10000,
        maximizable: false,
        resizable: true,
        styleClass: 'lg-dialog-width'
      }
    );

    dialogRef.onClose.subscribe((result) => {
      if (result) {
        this.salesOrdersService.getSalesOrders();
        this.ref.close(true);
      }
    });
  }

  onReject(): void {
    const dialogRef = this.dialogService.open(
      RejectOrderDialogComponent,
      {
        header: this.getLabel('Reject Order', 'رفض الأوردر'),
        contentStyle: { overflow: 'auto' },
        data: {
          orderId: this.order.ID
        },
        baseZIndex: 10000,
        maximizable: false,
        resizable: false,
        styleClass: 'sm-dialog-width'
      }
    );

    dialogRef.onClose.subscribe((result) => {
      if (result) {
        this.salesOrdersService.getSalesOrders();
        this.ref.close(true);
      }
    });
  }

  onViewShortages(): void {
    this.loading = true;
    this.salesOrdersService.getOrderShortages(this.order.ID!).subscribe({
      next: (response) => {
        if (response?.Success && response.Data) {
          this.openShortagesDialog(response.Data);
        } else {
          this.messageService.add({
            severity: 'info',
            summary: this.getLabel('Info', 'معلومات'),
            detail: this.getLabel('No shortages found', 'لا توجد نواقص')
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.getLabel('Error', 'خطأ'),
          detail: this.getLabel('Failed to load shortages', 'فشل تحميل النواقص')
        });
        this.loading = false;
      }
    });
  }

  private openShortagesDialog(shortages: any[]): void {
    this.dialogService.open(
      OrderShortagesDialogComponent,
      {
        header: this.getLabel('Order Shortages', 'نواقص الأوردر'),
        contentStyle: { overflow: 'auto' },
        data: {
          shortages: shortages
        },
        baseZIndex: 10000,
        maximizable: false,
        resizable: true,
        styleClass: 'lg-dialog-width'
      }
    );
  }

  onInvoice(): void {
    const header = this.getLabel('Order Invoice', 'فاتورة طلب');
    
    this.dialogService.open(
      InvoicePreview,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: {
          order: this.order
        },
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'xl-dialog-width'
      }
    );
  }

  onClose(): void {
    this.ref.close();
  }
}
