import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActionData } from 'src/app/shared/core/normalTableColumn.model';
import { YellowCardModel } from '../../core/models/yellow-card.model';
import { DynamicDialogRef, DialogService } from 'primeng/dynamicdialog';
import { UsersService } from '../../../users/users.service';
import { PrivilegeService } from '../../../privilege/privilege.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { PrivilegeChecked } from '../../../privilege/interfaces/privilege';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { NewDeleteModalComponent } from 'src/app/shared/components/new-delete-modal/new-delete-modal.component';
import { YellowCardsAddEditComponent } from '../add-edit/add-edit.component';

@Component({
  selector: 'app-yellow-cards-list',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './yellow-cards-list.component.html',
  styleUrls: ['./yellow-cards-list.component.scss']
})
export class YellowCardsList implements OnInit, OnDestroy {
  mainList: YellowCardModel[] = [];
  filteredList: YellowCardModel[] = [];
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
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.model = {
        CardHolderName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Card Holder Name' : 'اسم حامل البطاقة',
        },
        CardNumber: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Card Number' : 'رقم البطاقة',
        },
        /* ExpiryDate: {
          filterType: FilterType.date,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Expiry Date' : 'تاريخ الانتهاء',
        }, */
        MonthlyLimit: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Monthly Limit' : 'الحد الشهري',
        },
        MonthlyUsed: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Monthly Used' : 'الإستخدام الشهري',
        },
        DailyLimit: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Daily Limit' : 'الحد اليومي',
        },
        DailyUsed: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Daily Used' : 'الإستخدام اليومي',
        },
        Balance: {
          filterType: FilterType.number,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Balance' : 'الرصيد',
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
      if (page.page === 'YellowCardsList') {
        page.actions.forEach((action) => {
          if (action === 'Delete') {
            this.Delete = true;
            this.actionsList.push({
              tooltip: 'Delete ',
              icon: 'pi pi-trash',
              styleClass: 'p-button-danger',
              action: (row: any) => this.deleteRow(row.ID),
            });
          }
          else if (action === 'Add') {
            this.Add = true;
          }
          else if (action === 'Edit') {
            this.Edit = true;
            this.actionsList.push({
              tooltip: 'Edit',
              icon: 'pi pi-pencil',
              styleClass: 'p-button-warning',
              action: (row: any) => this.addEdit(row),
            });
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
      row ? header = 'Edit Yellow Card' : header = 'Add Yellow Card';
    } else {
      row ? header = 'تعديل البطاقة الصفراء' : header = 'إضافة بطاقة صفراء';
    }
    
    this.ref = this.dialogService.open(
      YellowCardsAddEditComponent,
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
        //this.getAllRows();
      }
    });
  }

  deleteRow(row: any): void {
    let header = '';
    if (this.languageFactor == 'en') {
      header = 'Delete';
    } else {
      header = 'حذف';
    }
    let url = this.constant.SRM_API_ENDPOINT + `YellowCards/Delete`;
    let model = {
      DeletedBy: JSON.parse(localStorage.getItem('userId')),
      DeletedDateTime: this.sharedServices.getDateTime(new Date()),
      ItemID: row.ID,
    };
    this.ref = this.dialogService.open(NewDeleteModalComponent, {
      header: header,
      contentStyle: { overflow: 'auto' },
      data: { url: url, id: model.ItemID },
      baseZIndex: 10000,
      styleClass: 'xs-dialog-width',
    });
    this.ref.onClose.subscribe((product) => {
      if (product) {
        //this.getAllRows();
      }
    });
  }

  rowDetails(row: any): void {

  }
}
