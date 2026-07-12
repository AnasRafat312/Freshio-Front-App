import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { SalesOrderModel, OrderStatus } from 'src/app/shared/model/freshio/sales-order.model';
import { SalesOrdersService } from '../../../sales-orders/services/sales-orders.service';
import { InvoicesService } from '../../services/invoices.service';

@Component({
  selector: 'app-invoice-preview',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './invoice-preview.component.html',
  styleUrls: ['./invoice-preview.component.scss']
})
export class InvoicePreview implements OnInit, OnDestroy {
  order: SalesOrderModel;
  languageFactor = 'en';
  languageSubscription: Subscription;
  loading = false;
  
  // Company info (placeholder - can be loaded from app config/settings)
  companyName = 'Freshio';

  constructor(
    private language: LanguagesService,
    private salesOrdersService: SalesOrdersService,
    private invoicesService: InvoicesService,
    private messageService: MessageService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    if (this.config.data) {
      if (this.config.data.order) {
        // Order data passed directly
        this.order = this.config.data.order;
      } else if (this.config.data.Id) {
        // Load order by ID
        this.loadOrder(this.config.data.Id);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private loadOrder(orderId: number): void {
    this.loading = true;
    this.salesOrdersService.getSalesOrderDetails(orderId);
    // Note: In a real implementation, we'd subscribe to the store signal
    // For now, assuming order is passed directly
    this.loading = false;
  }

  getLabel(enLabel: string, arLabel: string): string {
    return this.languageFactor === 'en' ? enLabel : arLabel;
  }

  getInvoiceItems() {
    if (!this.order || !this.order.SalesOrderItems) return [];
    
    // Filter items based on approved quantities
    return this.order.SalesOrderItems.filter(item => {
      const quantity = this.getItemQuantity(item);
      return quantity > 0;
    });
  }

  getItemQuantity(item: any): number {
    // For approved orders, use ApprovedQuantity if available, otherwise RequestedQuantity
    // For partially approved, use ApprovedQuantity only
    if (this.order.Status === OrderStatus.Approved) {
      return item.ApprovedQuantity ?? item.RequestedQuantity;
    } else if (this.order.Status === OrderStatus.PartiallyApproved) {
      return item.ApprovedQuantity || 0;
    }
    return item.RequestedQuantity;
  }

  getItemTotal(item: any): number {
    const quantity = this.getItemQuantity(item);
    return quantity * item.UnitPrice;
  }

  getInvoiceTotal(): number {
    return this.getInvoiceItems().reduce((sum, item) => sum + this.getItemTotal(item), 0);
  }

  onPrint(): void {
    window.print();
  }

  onDownloadPdf(): void {
    if (!this.order?.ID) return;
    
    this.loading = true;
    this.invoicesService.downloadInvoicePdf(this.order.ID).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${this.order.OrderNumber}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: this.getLabel('Success', 'نجح'),
          detail: this.getLabel('Invoice downloaded successfully', 'تم تحميل الفاتورة بنجاح')
        });
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.getLabel('Error', 'خطأ'),
          detail: this.getLabel('Failed to download invoice', 'فشل تحميل الفاتورة')
        });
        this.loading = false;
      }
    });
  }

  onDownloadImage(): void {
    if (!this.order?.ID) return;
    
    this.loading = true;
    this.invoicesService.downloadInvoiceImage(this.order.ID).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${this.order.OrderNumber}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.messageService.add({
          severity: 'success',
          summary: this.getLabel('Success', 'نجح'),
          detail: this.getLabel('Invoice downloaded successfully', 'تم تحميل الفاتورة بنجاح')
        });
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.getLabel('Error', 'خطأ'),
          detail: this.getLabel('Failed to download invoice', 'فشل تحميل الفاتورة')
        });
        this.loading = false;
      }
    });
  }

  onShareWhatsApp(): void {
    if (!this.order?.ID) return;
    
    this.loading = true;
    this.invoicesService.sendInvoiceWhatsApp(this.order.ID).subscribe({
      next: (response) => {
        if (response?.Success) {
          this.messageService.add({
            severity: 'success',
            summary: this.getLabel('Success', 'نجح'),
            detail: this.getLabel('Invoice sent via WhatsApp successfully', 'تم إرسال الفاتورة عبر واتساب بنجاح')
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.getLabel('Error', 'خطأ'),
            detail: response?.Message || this.getLabel('Failed to send invoice', 'فشل إرسال الفاتورة')
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.getLabel('Error', 'خطأ'),
          detail: this.getLabel('Failed to send invoice', 'فشل إرسال الفاتورة')
        });
        this.loading = false;
      }
    });
  }

  onClose(): void {
    this.ref.close();
  }
}
