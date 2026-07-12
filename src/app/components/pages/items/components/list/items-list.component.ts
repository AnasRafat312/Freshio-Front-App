import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';
import { ItemModel } from 'src/app/shared/model/freshio/item.model';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { NewDeleteModalComponent } from 'src/app/shared/components/new-delete-modal/new-delete-modal.component';
import { ItemsAddEditComponent } from '../add-edit/add-edit.component';
import { ItemsDetailsComponent } from '../details/details.component';
import { ItemsService } from '../../services/items.service';
import { ItemsStore } from '../../store/items.store';

@Component({
  selector: 'app-items-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss']
})
export class ItemsList implements OnInit, OnDestroy {
  mainList: ItemModel[] = [];
  filteredList: ItemModel[] = [];
  model: any = {};
  actionsList: ActionData[] = [];
  Edit = true;
  Add = true;
  Delete = true;
  Details = true;
  ref: DynamicDialogRef | undefined;
  languageFactor = 'en';

  constructor(
    private itemsService: ItemsService,
    private sharedServices: SharedService,
    private language: LanguagesService,
    public dialogService: DialogService,
    private constant: Constant,
    private itemsStore: ItemsStore
  ) {
    this.initializeModel();

    // React to signal changes automatically
    effect(() => {
      this.mainList = this.itemsStore.items();
      this.filteredList = [...this.mainList];
    });
  }

  ngOnInit(): void {
    this.getAllRows();
    this.getActionsList();
  }

  ngOnDestroy(): void {
    this.mainList = [];
    this.filteredList = [];
  }

  /**
   * Fetch items data from API (service automatically stores in signal)
   */
  getAllRows(): void {
    this.itemsService.getItems();
  }

  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.model = {
        Name: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Name' : 'اسم الصنف',
        },
        UnitOfMeasure: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Unit' : 'وحدة القياس',
        },
        /* DefaultSellPrice: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Sell Price' : 'سعر البيع',
        },
        AveragePurchasePrice: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Avg Cost' : 'متوسط التكلفة',
        },
        MinimumStockQuantity: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Min Stock' : 'الحد الأدنى',
        }, */
        IsActive: {
          filterType: FilterType.checkbox,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Status' : 'الحالة',
        },
      };
    });
  }

  getActionsList() {
    if(this.Details) {
      this.actionsList.push({
        tooltip: this.languageFactor === 'en' ? 'Details' : 'تفاصيل',
        icon: 'pi pi-eye',
        styleClass: 'p-button-info',
        action: (row: any) => this.rowDetails(row),
      });
    }
    if(this.Edit) {
      this.actionsList.push({
        tooltip: this.languageFactor === 'en' ? 'Edit' : 'تعديل',
        icon: 'pi pi-pencil',
        styleClass: 'p-button-warning',
        action: (row: any) => this.addEdit(row),
      });
    }
    if(this.Delete) {
      this.actionsList.push({
        tooltip: this.languageFactor === 'en' ? 'Delete' : 'حذف',
        icon: 'pi pi-trash',
        styleClass: 'p-button-danger',
        action: (row: any) => this.deleteRow(row.ID),
      });
    }
  }

  addEdit(row?: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      row ? header = 'Edit Item' : header = 'Add Item';
    } else {
      row ? header = 'تعديل صنف' : header = 'إضافة صنف';
    }
    
    this.ref = this.dialogService.open(
      ItemsAddEditComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: row,
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'lg-dialog-width'
      }
    );
    
    this.ref.onClose.subscribe((product) => {
      if (product) {
        row ? this.itemsStore.updateItem(product):
        this.itemsStore.addItem(product)
      }
    });
  }

  deleteRow(ID: number): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Delete';
    } else {
      header = 'حذف';
    }
    let url = this.constant.API_ENDPOINT + `Items/DeleteItem`;
    
    this.ref = this.dialogService.open(NewDeleteModalComponent, {
      header: header,
      contentStyle: { overflow: 'auto' },
      data: { url: url, id: ID },
      baseZIndex: 10000,
      styleClass: 'xs-dialog-width',
    });
    this.ref.onClose.subscribe((product) => {
      if (product) {
        this.itemsStore.removeItem(ID);
      }
    });
  }

  rowDetails(row: any): void {
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
        data: row,
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'xl-dialog-width'
      }
    );
  }
}
