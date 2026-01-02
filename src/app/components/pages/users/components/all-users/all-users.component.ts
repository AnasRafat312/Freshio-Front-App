import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from '../../users.service';
import { AddUserComponent } from '../../add-user/add-user.component';
import { PrivilegeChecked } from '../../../privilege/interfaces/privilege';
import { PrivilegeService } from '../../../privilege/privilege.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PageNaming } from 'src/app/shared/components/page-info/core/page-naming';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';
import { Constant } from 'src/app/core/constants/constant';
import { DeleteModalComponent } from 'src/app/shared/components/delete-modal/delete-modal.component';
import { LanguageService } from 'src/app/core/languageLocalization/language.service';
import { GeneralConfig } from 'src/app/core/common/generalConfig';
import { User } from '../../users.model';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss'],
})
export class AllUsersComponent extends GeneralConfig implements OnInit, OnDestroy {
  users: any[] = [];
  filteredUsers: any[] = [];
  model: any = {};
  selectedUsers: User[] = [];
  actionsList: {
    icon: string;
    tooltip: string;
    styleClass: string;
    action: (row: any, index?: number) => void;
    condition?: (row: any) => boolean;
  }[] = [];
  EditUser = false;
  AddUser = false;
  DeleteUser = false;
  privilegecheckedList!: PrivilegeChecked[];
  languageFactor = 'ar';
  rowsPerPageOptions = [5, 10, 20];
  UserNameListInTable: any[] = [];
  PhoneListInTable: any[] = [];
  EmailListInTable: any[] = [];
  ref: DynamicDialogRef | undefined;

  constructor(
    private usersService: UsersService,
    private privilegeService: PrivilegeService,
    private sharedServices: SharedService,
    private language: LanguagesService,
    public dialogService: DialogService,
    private dialog: MatDialog,
    private constant: Constant,
    languageService: LanguageService
  ) {
    super(languageService);
    sharedServices.setPageLocalName(PageNaming.USERS_LIST);
    this.initializeModel();

    this.privilegeService.checkedPrivilegeList.subscribe((data) => {
      this.EditUser = false;
      this.AddUser = false;
      this.DeleteUser = false;
      this.privilegecheckedList = data;
      this.showActionBaseOnPrivilege(this.privilegecheckedList);
    });
  }

  ngOnInit() {
    this.getUsers();
    this.usersService.userSubject.subscribe(() => {
      this.getUsers();
    });
  }

  ngOnDestroy(): void {
    localStorage.setItem('showRoleAdd', 'true');
    this.users = [];
    this.filteredUsers = [];
    this.selectedUsers = [];
    this.actionsList = [];
    this.UserNameListInTable = [];
    this.PhoneListInTable = [];
    this.EmailListInTable = [];
  }

  private initializeModel(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.model = {
        ProfilePicture: {
          hideSorting: false,
          filterType: 10,
          header: this.languageFactor === 'en' ? 'Image' : 'الصورة الشخصية',
        },
        UserName: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'User Name' : 'اسم المستخدم',
        },
        Email: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Email' : 'البريد الالكتروني',
        },
        PhoneNumber: {
          filterType: FilterType.multi,
          filterList: [],
          header: this.languageFactor === 'en' ? 'Phone Number' : 'رقم الهاتف',
        },
      };
    });
  }

  showActionBaseOnPrivilege(pages: PrivilegeChecked[]) {
    this.actionsList = [];

    pages.forEach((page) => {
      if (page.page === 'AllUsersList') {
        page.actions.forEach((action) => {
          if (action === 'DeleteUser') {
            this.DeleteUser = true;
            this.actionsList.push({
              tooltip: 'Delete User',
              icon: 'pi pi-trash',
              styleClass: 'p-button-danger',
              action: (row: any) => this.delete(row.ID),
            });
          } else if (action === 'AddUser') {
            this.AddUser = true;
          } else if (action === 'EditUser') {
            this.EditUser = true;
            this.actionsList.push({
              tooltip: 'Edit User',
              icon: 'pi pi-pencil',
              styleClass: 'p-button-warning',
              action: (row: any) => this.openForm(row),
            });
          }
        });
      }
    });
  }

  getUsers() {
    this.usersService.getAllusers().subscribe((res) => {
      this.users = res;
      this.filteredUsers = res;
      this.setFilteredListInMultiSelected(this.filteredUsers);
    });
  }

  openForm(user?: any, fromCompany?: boolean) {
    const header =
      this.languageFactor === 'en'
        ? user && !fromCompany
          ? 'Edit User'
          : 'Add User'
        : user && !fromCompany
        ? 'تعديل المستخدم'
        : 'إضافة المستخدم';

    this.ref = this.dialogService.open(AddUserComponent, {
      header: header,
      contentStyle: { overflow: 'auto' },
      data: { rowData: user, fromCompny: fromCompany },
      baseZIndex: 10000,
      maximizable: true,
      resizable: true,
      width: '60%',
      height: user ? '340px' : '60%',
      styleClass: 'sm-dialog-width',
    });

    this.ref.onClose.subscribe((result) => {
      if (result) {
        this.getUsers();
      }
    });
  }

  delete(userId: number) {
    const url = this.constant.GETWAY_API_ENDPOINT + 'AssembleUser/DeleteAssembleUserByID';
    const dialogRef = this.dialog.open(DeleteModalComponent, {
      width: '25%',
      data: { url, id: userId },
    });

    dialogRef.afterClosed().subscribe(() => this.getUsers());
  }

  getImageSRC(imageName: string): string {
    return this.constant.USER_PROFILE_IMAGE_SOURCE + imageName;
  }

  setFilteredListInMultiSelected(list: any[]) {
    const uniqueUserNameSet = new Set<string>();
    const uniqueEmailSet = new Set<string>();
    const uniquePhoneSet = new Set<string>();
    list.forEach((entity) => {
      this.getUserNamesListInFilter(uniqueUserNameSet, entity);
      this.getEmailListInFilter(uniqueEmailSet, entity);
      this.getPhoneListInFilter(uniquePhoneSet, entity);
    });
  }

  private getEmailListInFilter(set: Set<string>, element: any) {
    const name = element.Email;
    if (!set.has(name)) {
      set.add(name);
      this.EmailListInTable.push({ Name: name });
    }
  }

  filterEmail(event: any[]) {
    if (event.length > 0) {
      this.filteredUsers = [];
      event.forEach((name) => {
        const matched = this.users.filter((u) => u?.Email === name?.Name);
        this.filteredUsers = [...this.filteredUsers, ...matched];
      });
    } else {
      this.filteredUsers = this.users;
    }
  }

  private getUserNamesListInFilter(set: Set<string>, element: any) {
    const name = element.UserName;
    if (!set.has(name)) {
      set.add(name);
      this.UserNameListInTable.push({ Name: name });
    }
  }

  filterUserName(event: any[]) {
    if (event.length > 0) {
      this.filteredUsers = [];
      event.forEach((name) => {
        const matched = this.users.filter((u) => u?.UserName === name?.Name);
        this.filteredUsers = [...this.filteredUsers, ...matched];
      });
    } else {
      this.filteredUsers = this.users;
    }
  }

  private getPhoneListInFilter(set: Set<string>, element: any) {
    const name = element.PhoneNumber;
    if (!set.has(name)) {
      set.add(name);
      this.PhoneListInTable.push({ Name: name });
    }
  }

  filterPhone(event: any[]) {
    if (event.length > 0) {
      this.filteredUsers = [];
      event.forEach((name) => {
        const matched = this.users.filter((u) => u?.PhoneNumber === name?.Name);
        this.filteredUsers = [...this.filteredUsers, ...matched];
      });
    } else {
      this.filteredUsers = this.users;
    }
  }
}
