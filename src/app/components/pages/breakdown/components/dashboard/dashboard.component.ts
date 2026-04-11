import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Subscription } from 'rxjs';
import { BoxesService } from '../../services/boxes.service';
import { BoxItemsService } from '../../services/box-items.service';
import { BoxResponseDto, BoxDetailsDto, BreakdownDashboardDto } from '../../core/models/box.model';
import { ResponseModel } from 'src/app/shared/model/response';
import { BreakdownAddEditComponent } from '../add-edit/add-edit.component';
import { BoxItemAddEditComponent } from '../box-item-add-edit/box-item-add-edit.component';

@Component({
  selector: 'app-breakdown-dashboard',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class BreakdownDashboardComponent implements OnInit, OnDestroy {
  languageFactor = 'en';
  languageSubscription: Subscription;
  ref: DynamicDialogRef | undefined;
  
  // View mode
  activeTabIndex = 0; // 0 = Table View, 1 = Card View
  
  // Data
  inBoxes: BoxDetailsDto[] = [];
  outBoxes: BoxDetailsDto[] = [];
  totalIn = 0;
  totalOut = 0;
  netBalance = 0;
  
  loading = false;

  constructor(
    private language: LanguagesService,
    private boxesService: BoxesService,
    private boxItemsService: BoxItemsService,
    private messageService: MessageService,
    public dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });
    
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load all boxes
    this.boxesService.getAll().subscribe({
      next: (response: ResponseModel) => {
        if (response?.Success && response?.Data) {
          const allBoxes: BoxResponseDto[] = response.Data;
          
          // Separate In and Out boxes
          const inBoxIds = allBoxes.filter(b => b.Type === 'In').map(b => b.Id);
          const outBoxIds = allBoxes.filter(b => b.Type === 'Out').map(b => b.Id);
          
          // Load details for each box
          this.loadBoxesDetails(inBoxIds, outBoxIds);
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading boxes:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.languageFactor === 'en' ? 'Failed to load dashboard data' : 'فشل تحميل بيانات لوحة المعلومات'
        });
      }
    });
  }

  loadBoxesDetails(inBoxIds: number[], outBoxIds: number[]): void {
    let loadedCount = 0;
    const totalBoxes = inBoxIds.length + outBoxIds.length;
    
    if (totalBoxes === 0) {
      this.loading = false;
      return;
    }

    // Load In boxes
    inBoxIds.forEach(id => {
      this.boxesService.getById(id).subscribe({
        next: (response: ResponseModel) => {
          if (response?.Success && response?.Data) {
            this.inBoxes.push(response.Data);
          }
          loadedCount++;
          if (loadedCount === totalBoxes) {
            this.calculateTotals();
            this.loading = false;
          }
        },
        error: () => {
          loadedCount++;
          if (loadedCount === totalBoxes) {
            this.calculateTotals();
            this.loading = false;
          }
        }
      });
    });

    // Load Out boxes
    outBoxIds.forEach(id => {
      this.boxesService.getById(id).subscribe({
        next: (response: ResponseModel) => {
          if (response?.Success && response?.Data) {
            this.outBoxes.push(response.Data);
          }
          loadedCount++;
          if (loadedCount === totalBoxes) {
            this.calculateTotals();
            this.loading = false;
          }
        },
        error: () => {
          loadedCount++;
          if (loadedCount === totalBoxes) {
            this.calculateTotals();
            this.loading = false;
          }
        }
      });
    });
  }

  calculateTotals(): void {
    this.totalIn = this.inBoxes.reduce((sum, box) => sum + box.TotalAmount, 0);
    this.totalOut = this.outBoxes.reduce((sum, box) => sum + box.TotalAmount, 0);
    this.netBalance = this.totalIn - this.totalOut;
  }

  addNewBox(type: 'In' | 'Out'): void {
    let header = '';
    if (this.languageFactor === 'en') {
      header = `Add ${type} Box`;
    } else {
      header = type === 'In' ? 'إضافة صندوق دخل' : 'إضافة صندوق مصروف';
    }

    this.ref = this.dialogService.open(BreakdownAddEditComponent, {
      header: header,
      width: '90%',
      contentStyle: { overflow: 'auto' },
      data: { Type: type },
      baseZIndex: 10000,
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.loadDashboardData();
      }
    });
  }

  editBox(box: BoxDetailsDto): void {
    let header = '';
    if (this.languageFactor === 'en') {
      header = 'Edit Box';
    } else {
      header = 'تعديل الصندوق';
    }

    this.ref = this.dialogService.open(BreakdownAddEditComponent, {
      header: header,
      width: '90%',
      contentStyle: { overflow: 'auto' },
      data: box,
      baseZIndex: 10000,
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.loadDashboardData();
      }
    });
  }

  addBoxItem(box: BoxDetailsDto): void {
    let header = '';
    if (this.languageFactor === 'en') {
      header = `Add Item to ${box.Name}`;
    } else {
      header = `إضافة عنصر إلى ${box.Name}`;
    }

    this.ref = this.dialogService.open(BoxItemAddEditComponent, {
      header: header,
      width: '600px',
      contentStyle: { overflow: 'auto' },
      data: { BoxId: box.Id, BoxName: box.Name },
      baseZIndex: 10000,
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.loadDashboardData();
      }
    });
  }

  editBoxItem(item: any, box: BoxDetailsDto): void {
    let header = '';
    if (this.languageFactor === 'en') {
      header = 'Edit Box Item';
    } else {
      header = 'تعديل عنصر الصندوق';
    }

    this.ref = this.dialogService.open(BoxItemAddEditComponent, {
      header: header,
      width: '600px',
      contentStyle: { overflow: 'auto' },
      data: { ...item, BoxId: box.Id, BoxName: box.Name },
      baseZIndex: 10000,
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.loadDashboardData();
      }
    });
  }

  deleteBoxItem(itemId: number): void {
    if (confirm(this.languageFactor === 'en' ? 'Are you sure you want to delete this item?' : 'هل أنت متأكد من حذف هذا العنصر؟')) {
      this.boxItemsService.delete(itemId).subscribe({
        next: (response: ResponseModel) => {
          if (response?.Success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: this.languageFactor === 'en' ? 'Item deleted successfully' : 'تم حذف العنصر بنجاح'
            });
            this.loadDashboardData();
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.languageFactor === 'en' ? 'Failed to delete item' : 'فشل حذف العنصر'
          });
        }
      });
    }
  }

  deleteBox(box: BoxDetailsDto): void {
    const confirmMessage = this.languageFactor === 'en' 
      ? `Are you sure you want to delete "${box.Name}" box with all its items?` 
      : `هل أنت متأكد من حذف صندوق "${box.Name}" مع جميع عناصره؟`;
    
    if (confirm(confirmMessage)) {
      this.boxesService.delete(box.Id).subscribe({
        next: (response: ResponseModel) => {
          if (response?.Success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: this.languageFactor === 'en' ? 'Box deleted successfully' : 'تم حذف الصندوق بنجاح'
            });
            this.loadDashboardData();
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.languageFactor === 'en' ? 'Failed to delete box' : 'فشل حذف الصندوق'
          });
        }
      });
    }
  }
}
