import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';
import { BreakdownModel } from '../../core/models/breakdown.model';
import { BoxResponseDto } from '../../core/models/box.model';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { PrivilegeService } from '../../../privilege/privilege.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { PrivilegeChecked } from '../../../privilege/interfaces/privilege';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { NewDeleteModalComponent } from 'src/app/shared/components/new-delete-modal/new-delete-modal.component';
import { BoxesService } from '../../services/boxes.service';
import { BoxItemsService } from '../../services/box-items.service';
import { BreakdownAddEditComponent } from '../add-edit/add-edit.component';
import { BreakdownDetailsComponent } from '../details/details.component';
import { BoxItemAddEditComponent } from '../box-item-add-edit/box-item-add-edit.component';
import { BoxDetailsDto } from '../../core/models/box.model';
import { ResponseModel } from 'src/app/shared/model/response';

@Component({
  selector: 'app-breakdown-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './breakdown-list.component.html',
  styleUrls: ['./breakdown-list.component.scss']
})
export class BreakdownList implements OnInit, OnDestroy {
  mainList: BoxResponseDto[] = [];
  filteredList: BoxResponseDto[] = [];
  model: any = {};
  actionsList: ActionData[] = [];
  Edit = true;
  Add = true;
  Delete = true;
  Details = true;
  privilegecheckedList!: PrivilegeChecked[];
  ref: DynamicDialogRef | undefined;
  languageFactor = 'en';
  loading = false;
  
  // Dashboard data
  activeTabIndex = 1; // 0 = Table View, 1 = Card View
  inBoxes: BoxDetailsDto[] = [];
  outBoxes: BoxDetailsDto[] = [];
  totalIn = 0;
  totalOut = 0;
  netBalance = 0;

  constructor(
    private privilegeService: PrivilegeService,
    private sharedServices: SharedService,
    private language: LanguagesService,
    public dialogService: DialogService,
    private constant: Constant,
    private boxesService: BoxesService,
    private boxItemsService: BoxItemsService,
    private messageService: MessageService
  ) {
    this.initializeModel();
    this.privilegeService.checkedPrivilegeList.subscribe((data) => {
      this.Edit = true;
      this.Add = true;
      this.Delete = true;
      this.Details = true;
      this.privilegecheckedList = data;
      this.showActionBaseOnPrivilege(this.privilegecheckedList);
      this.getActions();
    });
  }

  ngOnInit(): void {
    this.getAllBoxes();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {

  }

  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.model = {
        Name: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Name' : 'الأسم',
        },
        Type: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Type' : 'النوع',
        },
        TotalAmount: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Total Amount' : 'المبلغ الإجمالي',
        },
        ItemCount: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Item Count' : 'عدد العناصر',
        },
        CreatedAt: {
          filterType: FilterType.date,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Created At' : 'تاريخ الإنشاء',
        },
      };
    });
  }

  getAllBoxes(): void {
    this.loading = true;
    this.boxesService.getAll().subscribe({
      next: (response) => {
        if (response?.Success) {
          this.mainList = response.Data || [];
          this.filteredList = [...this.mainList];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading boxes:', error);
        this.loading = false;
      }
    });
  }

  showActionBaseOnPrivilege(pages: PrivilegeChecked[]) {
    this.actionsList = [];

    pages.forEach((page) => {
      if (page.page === 'BreakdownList') {
        page.actions.forEach((action) => {
          if (action === 'Delete') {
            this.Delete = true;
            
          }
          else if (action === 'Add') {
            this.Add = true;
          }
          else if (action === 'Edit') {
            this.Edit = true;
          }
          else if (action === 'Details') {
            this.Details = true;
            
          }
        });
      }
    });
  }
  getActions() {
    if(this.Edit) {
      this.actionsList.push({
        tooltip: 'Edit',
        icon: 'pi pi-pencil',
        styleClass: 'p-button-warning',
        action: (row: any) => this.addEdit(row),
      });
    }
    if(this.Details) {
        this.actionsList.push({
          tooltip: 'Details',
          icon: 'pi pi-eye',
          styleClass: 'p-button-info',
          action: (row: any) => this.rowDetails(row),
        });
    }
    if(this.Delete) {
        this.actionsList.push({
          tooltip: 'Delete ',
          icon: 'pi pi-trash',
          styleClass: 'p-button-danger',
          action: (row: any) => this.deleteRow(row.Id),
        });
    }
  }
  addEdit(row?: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = row ? 'Edit Box' : 'Add Box';
    } else {
      header = row ? 'تعديل الصندوق' : 'إضافة صندوق';
    }

    this.ref = this.dialogService.open(
      BreakdownAddEditComponent,
      {
        header: header,
        width: '90%',
        contentStyle: { overflow: 'auto' },
        data: row || null,
        baseZIndex: 10000,
      }
    );

    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.getAllBoxes();
      }
    });
  }

  deleteRow(id: number): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Delete Box';
    } else {
      header = 'حذف الصندوق';
    }
    
    this.ref = this.dialogService.open(NewDeleteModalComponent, {
      header: header,
      contentStyle: { overflow: 'auto' },
      data: { 
        url: `${this.constant.API_ENDPOINT}Boxes/Delete`,
        id: id 
      },
      baseZIndex: 10000,
      styleClass: 'xs-dialog-width',
    });
    
    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.getAllBoxes();
      }
    });
  }

  rowDetails(row: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Box Details';
    } else {
      header = 'تفاصيل الصندوق';
    }

    this.ref = this.dialogService.open(
      BreakdownDetailsComponent,
      {
        header: header,
        width: '90%',
        contentStyle: { overflow: 'auto' },
        data: row,
        baseZIndex: 10000,
      }
    );
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
      }
    });
  }

  loadBoxesDetails(inBoxIds: number[], outBoxIds: number[]): void {
    this.inBoxes = [];
    this.outBoxes = [];
    let loadedCount = 0;
    const totalBoxes = inBoxIds.length + outBoxIds.length;
    
    if (totalBoxes === 0) {
      this.loading = false;
      this.calculateTotals();
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
        this.getAllBoxes();
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
        this.getAllBoxes();
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
        this.getAllBoxes();
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
        this.getAllBoxes();
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
            this.getAllBoxes();
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
}
