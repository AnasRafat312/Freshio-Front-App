import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';
import { FawryMachineModel } from '../../core/models/fawry-machine.model';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { PrivilegeService } from '../../../privilege/privilege.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { FawryMachinesService } from '../../services/fawry-machines.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { PrivilegeChecked } from '../../../privilege/interfaces/privilege';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { NewDeleteModalComponent } from 'src/app/shared/components/new-delete-modal/new-delete-modal.component';
import { FawryMachinesAddEditComponent } from '../add-edit/add-edit.component';
import { FawryMachinesDetailsComponent } from '../details/details.component';
import { FawryMachinesStore } from '../../store/fawry-machines.store';

@Component({
  selector: 'app-fawry-machines-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './fawry-machines-list.component.html',
  styleUrls: ['./fawry-machines-list.component.scss']
})
export class FawryMachinesList implements OnInit, OnDestroy {
  mainList: FawryMachineModel[] = [];
  filteredList: FawryMachineModel[] = [];
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
    private fawryMachinesService: FawryMachinesService,
    private fawryMachinesStore: FawryMachinesStore,
  ) {
    this.initializeModel();
    this.privilegeService.checkedPrivilegeList.subscribe((data) => {
      this.Edit = true;
      this.Add = true;
      this.Delete = true;
      this.Details = true;
      this.privilegecheckedList = data;
      this.showActionBaseOnPrivilege(this.privilegecheckedList);
      this.getActionsList();
    });

    // React to signal changes automatically
    effect(() => {
      this.mainList = this.fawryMachinesStore.fawryMachines();
      this.filteredList = [...this.mainList];
    });
  }

  ngOnInit(): void {
    this.getAllRows();
  }

  ngOnDestroy(): void {
    this.mainList = []
    this.filteredList = []
  }

  /**
   * Fetch fawry machines data from API (service automatically stores in signal)
   */
  getAllRows(): void {
    this.fawryMachinesService.getFawryMachines();
  }

  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.model = {
        SerialNumber: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Serial Number' : 'الرقم التسلسلي',
        },
        PhoneNumber: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Phone Number' : 'رقم التيليفون',
        },
        Balance: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Balance' : 'الرصيد',
        },
        DailyUsed: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Daily Used' : 'الإستخدام اليومي',
        },
        MonthlyUsed: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Monthly Used' : 'الإستخدام الشهري',
        },
        Status: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Status' : 'الحالة',
        },
      };
    });
  }

  showActionBaseOnPrivilege(pages: PrivilegeChecked[]) {
    this.actionsList = [];

    pages.forEach((page) => {
      if (page.page === 'FawryMachinesList') {
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

  getActionsList() {
    this.actionsList = []
    if(this.Details) {
      this.actionsList.push({
        tooltip: 'Details',
        icon: 'pi pi-eye',
        styleClass: 'p-button-info',
        action: (row: any) => this.rowDetails(row),
      });
    }
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
      row ? header = 'Edit Fawry Machine' : header = 'Add Fawry Machine';
    } else {
      row ? header = 'تعديل ماكينة فوري' : header = 'إضافة ماكينة فوري';
    }
    
    this.ref = this.dialogService.open(
      FawryMachinesAddEditComponent,
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
        if(row) {
          this.fawryMachinesStore.updateFawryMachine(product)
        }
        else {
          this.fawryMachinesStore.addFawryMachine(product)
        }
      }
    });
  }

  deleteRow(id: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Delete';
    } else {
      header = 'حذف';
    }
    let url = this.constant.API_ENDPOINT + `FawryMachines/Delete`;
    this.ref = this.dialogService.open(NewDeleteModalComponent, {
      header: header,
      contentStyle: { overflow: 'auto' },
      data: { url: url, id: id },
      baseZIndex: 10000,
      styleClass: 'xs-dialog-width',
    });
    this.ref.onClose.subscribe((product) => {
      if (product) {
        this.fawryMachinesStore.removeFawryMachine(id)
      }
    });
  }

  rowDetails(row: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Fawry Machine Details';
    } else {
      header = 'تفاصيل ماكينة فوري';
    }
    
    this.ref = this.dialogService.open(
      FawryMachinesDetailsComponent,
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
