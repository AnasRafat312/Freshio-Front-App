import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';
import { AdjustmentModel } from '../../core/models/adjustment.model';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { PrivilegeService } from '../../../privilege/privilege.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { PrivilegeChecked } from '../../../privilege/interfaces/privilege';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { NewDeleteModalComponent } from 'src/app/shared/components/new-delete-modal/new-delete-modal.component';
import { AdjustmentsAddEditComponent } from '../add-edit/add-edit.component';
import { AdjustmentsDetailsComponent } from '../details/details.component';
import { AdjustmentsService } from '../../services/adjustments.service';
import { AdjustmentsStore } from '../../store/adjustments.store';
import { ResponseModel } from 'src/app/shared/model/response';

@Component({
  selector: 'app-adjustments-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './adjustments-list.component.html',
  styleUrls: ['./adjustments-list.component.scss']
})
export class AdjustmentsList implements OnInit, OnDestroy {
  mainList: AdjustmentModel[] = [];
  filteredList: AdjustmentModel[] = [];
  model: any = {};
  actionsList: ActionData[] = [];
  Edit = true;
  Add = true;
  Delete = true;
  Details = true;
  privilegecheckedList!: PrivilegeChecked[];
  ref: DynamicDialogRef | undefined;
  languageFactor = 'en';

  constructor(
    private privilegeService: PrivilegeService,
    private sharedServices: SharedService,
    private language: LanguagesService,
    public dialogService: DialogService,
    private constant: Constant,
    private adjustmentsService: AdjustmentsService,
    private adjustmentsStore: AdjustmentsStore
  ) {
    this.initializeModel();
    this.privilegeService.checkedPrivilegeList.subscribe((data) => {
      this.Edit = true;
      this.Add = true;
      this.Delete = true;
      this.Details = true;
      this.privilegecheckedList = data;
      this.showActionBaseOnPrivilege(this.privilegecheckedList);
    });
    this.getActionsList();
    // React to signal changes automatically
    effect(() => {
      this.mainList = this.adjustmentsStore.adjustments();
      this.filteredList = [...this.mainList];
    });
  }

  ngOnInit(): void {
    this.getAllRows();
  }

  ngOnDestroy(): void {
    this.mainList = [];
    this.filteredList = [];
  }

  /**
   * Fetch adjustments data from API (service automatically stores in AdjustmentsStore)
   */
  getAllRows(): void {
    this.adjustmentsService.getAdjustments().subscribe({
      next: (res: ResponseModel) => {
        // Service already stored in AdjustmentsStore via tap operator
        // Now assign to mainList and filteredList from store
        this.mainList = this.adjustmentsStore.getAdjustmentsValue();
        this.filteredList = [...this.mainList];
      },
      error: (error) => {
        console.error('Error loading adjustments:', error);
      }
    });
  }

  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.model = {
        Name: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Name' : 'الاسم',
        },
        AdjustmentTypeName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Adjustment Type' : 'نوع التعديل',
        },
        DirectionName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Direction' : 'الاتجاه',
        },
        CalculationTypeName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Calculation Type' : 'نوع الحساب',
        },
        Value: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Value' : 'القيمة',
        },
        AppliesToName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Applies To' : 'ينطبق على',
        },
        IsActive: {
          filterType: FilterType.checkbox,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Status' : 'الحالة',
        },
      };
    });
  }

  getActionsList() {
    this.actionsList = []
    if(this.Edit) {
      this.actionsList.push({
        tooltip: 'Edit',
        icon: 'pi pi-pencil',
        styleClass: 'p-button-warning',
        action: (row: any) => this.addEdit(row),
      });
    }
    if(this.Delete) {
      this.actionsList.push({
        tooltip: 'Delete',
        icon: 'pi pi-trash',
        styleClass: 'p-button-danger',
        action: (row: any) => this.deleteRow(row.Id),
      });
    }
  }

  showActionBaseOnPrivilege(pages: PrivilegeChecked[]) {
    this.actionsList = [];

    pages.forEach((page) => {
      if (page.page === 'AdjustmentsList') {
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
            this.actionsList.push({
              tooltip: 'Details',
              icon: 'pi pi-eye',
              styleClass: 'p-button-info',
              action: (row: any) => this.rowDetails(row),
            });
          }
        });
      }
    });
  }

  addEdit(row?: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      row ? header = 'Edit Adjustment' : header = 'Add Adjustment';
    } else {
      row ? header = 'تعديل التعديل' : header = 'إضافة تعديل';
    }
    
    this.ref = this.dialogService.open(
      AdjustmentsAddEditComponent,
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
        row ? this.adjustmentsStore.updateAdjustment(product) : this.adjustmentsStore.addAdjustment(product)
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
    let url = this.constant.API_ENDPOINT + `Adjustments/Delete`;

    this.ref = this.dialogService.open(NewDeleteModalComponent, {
      header: header,
      contentStyle: { overflow: 'auto' },
      data: { url: url, id: ID },
      baseZIndex: 10000,
      styleClass: 'xs-dialog-width',
    });
    this.ref.onClose.subscribe((product) => {
      if (product) {
        this.adjustmentsStore.removeAdjustment(ID)
      }
    });
  }

  rowDetails(row: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Adjustment Details';
    } else {
      header = 'تفاصيل التعديل';
    }
    
    this.ref = this.dialogService.open(
      AdjustmentsDetailsComponent,
      {
        header: header,
        contentStyle: { overflow: 'auto' },
        data: row,
        baseZIndex: 10000,
        maximizable: true,
        resizable: true,
        styleClass: 'md-dialog-width'
      }
    );
  }
}
