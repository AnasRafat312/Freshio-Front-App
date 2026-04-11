import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';
import { PhoneModel } from '../../core/models/phone.model';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { PrivilegeService } from '../../../privilege/privilege.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { PrivilegeChecked } from '../../../privilege/interfaces/privilege';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { NewDeleteModalComponent } from 'src/app/shared/components/new-delete-modal/new-delete-modal.component';
import { PhonesAddEditComponent } from '../add-edit/add-edit.component';
import { PhonesService } from '../../services/phones.service';
import { PhonesStore } from '../../store/phones.store';
import { ResponseModel } from 'src/app/shared/model/response';
import { UsersService } from '../../../users/services/users.service';

@Component({
  selector: 'app-phones-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './phones-list.component.html',
  styleUrls: ['./phones-list.component.scss']
})
export class PhonesList implements OnInit, OnDestroy {
  mainList: PhoneModel[] = [];
  filteredList: PhoneModel[] = [];
  model: any = {};
  actionsList: ActionData[] = [];
  Edit = false;
  Add = false;
  Delete = false;
  Details = false;
  privilegecheckedList!: PrivilegeChecked[];
  ref: DynamicDialogRef | undefined;
  languageFactor = 'en';

  constructor(
    private usersService: UsersService,
    private privilegeService: PrivilegeService,
    private sharedServices: SharedService,
    private language: LanguagesService,
    public dialogService: DialogService,
    private constant: Constant,
    private phonesService: PhonesService,
    private phonesStore: PhonesStore
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
    this.getActionsList(); // Call after privileges are set

    // React to signal changes automatically
    effect(() => {
      this.mainList = this.phonesStore.phones();
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
   * Fetch phones data from API (service automatically stores in signal)
   */
  getAllRows(): void {
    this.phonesService.getPhones();
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
        Number: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Phone Number' : 'رقم التيليفون',
        },
      };
    });
  }

  showActionBaseOnPrivilege(pages: PrivilegeChecked[]) {
    this.actionsList = [];

    pages.forEach((page) => {
      if (page.page === 'PhonesList') {
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
      row ? header = 'Edit Phone' : header = 'Add Phone';
    } else {
      row ? header = 'تعديل الهاتف' : header = 'إضافة هاتف';
    }
    
    this.ref = this.dialogService.open(
      PhonesAddEditComponent,
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
    
    this.ref.onClose.subscribe((phone) => {
      if (phone) {
        row ? this.phonesStore.updatePhone(phone) : this.phonesStore.addPhone(phone)
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
    let url = this.constant.API_ENDPOINT + `PhoneNumbers/Delete`;
    this.ref = this.dialogService.open(NewDeleteModalComponent, {
      header: header,
      contentStyle: { overflow: 'auto' },
      data: { url: url, id: ID },
      baseZIndex: 10000,
      styleClass: 'xs-dialog-width',
    });
    this.ref.onClose.subscribe((product) => {
      if (product) {
        this.phonesStore.removePhone(ID)
      }
    });
  }

  rowDetails(row: any): void {

  }
}
