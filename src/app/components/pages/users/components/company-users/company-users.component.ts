import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteModalComponent } from 'src/app/shared/components/delete-modal/delete-modal.component';
import { User } from '../../users.model';
import { GeneralConfig } from 'src/app/core/common/generalConfig';
import { LanguageService } from 'src/app/core/languageLocalization/language.service';
import { UsersService } from '../../users.service';
import { AddUserComponent } from '../../add-user/add-user.component';
import { PrivilegeChecked } from '../../../privilege/interfaces/privilege';
import { PrivilegeService } from '../../../privilege/privilege.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PageNaming } from 'src/app/shared/components/page-info/core/page-naming';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FilterType } from 'src/app/shared/core/enums/filter-type.enum';

@Component({
    selector: 'app-company-users',
    templateUrl: './company-users.component.html',
    styleUrls: ['./company-users.component.scss'],
})
export class CompanyUsersComponent extends GeneralConfig implements OnInit, OnDestroy {
    users: any[] = [];
    filteredUsers: any[] = [];
    dialogRef: any;
    selectedUsers: User[] = [];
    cols: any[] = [];
    model: any = {};
    actionsList: {
        icon: string;
        tooltip: string;
        styleClass: string;
        action: (row: any, index?: number) => void;
        condition?: (row: any) => boolean;
    }[] = [];
    rowsPerPageOptions = [5, 10, 20];
    EditCompanyUser: boolean = false;
    AddCompanyUser: boolean = false;
    DeleteCompanyUser: boolean = false;
    privilegecheckedList!: PrivilegeChecked[];
    languageFactor = 'ar';

    // Search Properties
    UserNameListInTable: any[] = [];
    UserRolesListInTable: any[] = [];
    PhoneListInTable: any[] = [];
    EmailListInTable: any[] = [];

    ref: DynamicDialogRef | undefined;

    constructor(
        private constant: Constant,
        private usersService: UsersService,
        languageService: LanguageService,
        public dialog: MatDialog,
        private privilegeService: PrivilegeService,
        private sharedService: SharedService,
        private language: LanguagesService,
        public dialogService: DialogService,
    ) {
        sharedService.setPageLocalName(PageNaming.COMPANY_USERS);
        super(languageService);
        localStorage.setItem('showRoleAdd', 'true');

        this.initializeModel();

        this.privilegeService.checkedPrivilegeList.subscribe((data) => {
            this.EditCompanyUser = false;
            this.AddCompanyUser = false;
            this.DeleteCompanyUser = false;
            this.privilegecheckedList = data;
            this.showActionBaseOnPrivilege(this.privilegecheckedList);
        });
    }

    ngOnInit() {
        this.getUsers();
        this.usersService.userSubject.subscribe((val) => {
            this.getUsers();
        });
    }

    private initializeModel(): void {
        this.language.currentLanguage.subscribe((data) => {
            this.languageFactor = data;

            this.model = {
                ProfilePicture: {
                    hideSorting: false,
                    filterType: 10,
                    header: this.languageFactor == 'en' ? 'Image' : 'الصورة الشخصية',
                },
                UserName: {
                    filterType: FilterType.multi,
                    filterList: [],
                    header: this.languageFactor == 'en' ? 'User Name' : 'اسم المستخدم',
                },
                Email: {
                    filterType: FilterType.multi,
                    filterList: [],
                    header: this.languageFactor == 'en' ? 'Email' : 'البريد الالكتروني',
                },
                PhoneNumber: {
                    filterType: FilterType.multi,
                    filterList: [],
                    header: this.languageFactor == 'en' ? 'Phone Number' : 'رقم الهاتف',
                }
            };
        });
    }

    showActionBaseOnPrivilege(pages: PrivilegeChecked[]) {
        this.actionsList = [];

        pages.forEach(page => {
            if (page.page === 'CompanyUsersList') {
                console.log(page);
                page.actions.forEach(action => {
                    if (action === 'DeleteCompanyUser') {
                        this.DeleteCompanyUser = true;
                        this.actionsList.push({
                            tooltip: 'Delete User',
                            icon: 'pi pi-trash',
                            styleClass: 'p-button-danger',
                            action: (row: any, index: number) => this.delete(row.ID)
                        });
                    }
                    else if (action === 'AddCompanyUser') {
                        this.AddCompanyUser = true;
                    }
                    else if (action === 'EditCompanyUser') {
                        this.EditCompanyUser = true;
                        this.actionsList.push({
                            tooltip: 'Edit User',
                            icon: 'pi pi-pencil',
                            styleClass: 'p-button-warning',
                            action: (row: any, index: number) => this.openForm(row)
                        });
                    }
                });
            }
        });
    }

    getUsers() {
        this.usersService
            .getUsersCompany(localStorage.getItem('companyId'))
            .subscribe(
                (res) => {
                    this.users = res;
                    this.filteredUsers = res;
                    this.setFilteredListInMultiSelected(this.filteredUsers);
                },
                (err) => {}
            );
    }

    openForm(user?: any) {
        let fromCompny = true;
        let header = '';

        if (this.languageFactor == 'en') {
            user && fromCompny ? header = 'Edit Company User' : header = 'Add Company User';
        } else {
            user && fromCompny ? header = 'تعديل مستخدم الشركة' : header = 'إضافة مستخدم الشركة';
        }

        this.ref = this.dialogService.open(AddUserComponent, {
            header: header,
            contentStyle: { overflow: 'auto' },
            data: { rowData: user, fromCompny: fromCompny },
            baseZIndex: 10000,
            maximizable: true,
            resizable: true,
            width: '60%',
            height: user ? '340px' : '60%',
            styleClass: 'md-dialog-width',
        });

        this.ref.onClose.subscribe((result) => {
            if (result) {
                this.getUsers();
            }
        });
    }

    delete(userId: number) {
        let url = this.constant.GETWAY_API_ENDPOINT + 'AssembleUser/DeleteUserCompanyByUserID';
        let model = {
            UserID: userId,
        };

        this.dialogRef = this.dialog.open(DeleteModalComponent, {
            width: '25%',
            data: { url: url, model },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            this.getUsers();
        });
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
            this.getUserRolesListInFilter(uniqueUserNameSet, entity);
            this.getEmialListInFilter(uniqueEmailSet, entity);
            this.getPhoneListInFilter(uniquePhoneSet, entity);
        });
    }

    // Email Filter Methods
    getEmialListInFilter(Set, element) {
        const name = element.Email;
        if (!Set.has(name)) {
            Set.add(name);
            this.EmailListInTable.push({ Name: name });
        }
    }

    filterEmial(event: any[]) {
        let users = this.users;
        if (event.length > 0) {
            this.filteredUsers = [];
            event.forEach((name) => {
                users = this.users.filter((ele) => ele?.Email == name?.Name);
                this.filteredUsers = [...this.filteredUsers, ...users];
            });
        } else {
            this.filteredUsers = this.users;
        }
    }

    // UserName Filter Methods
    getUserNamesListInFilter(Set, element) {
        const name = element.UserName;
        if (!Set.has(name)) {
            Set.add(name);
            this.UserNameListInTable.push({ Name: name });
        }
    }

    getUserRolesListInFilter(Set, element) {
        const name = element.RoleName;
        if (!Set.has(name)) {
            Set.add(name);
            this.UserRolesListInTable.push({ Name: name });
        }
    }

    filterUserName(event: any[]) {
        let users = this.users;
        if (event.length > 0) {
            this.filteredUsers = [];
            event.forEach((name) => {
                users = this.users.filter((ele) => ele?.UserName == name?.Name);
                this.filteredUsers = [...this.filteredUsers, ...users];
            });
        } else {
            this.filteredUsers = this.users;
        }
    }

    filterRoles(event: any[]) {
        let users = this.users;
        if (event.length > 0) {
            this.filteredUsers = [];
            event.forEach((name) => {
                users = this.users.filter((ele) => ele?.RoleName == name?.Name);
                this.filteredUsers = [...this.filteredUsers, ...users];
            });
        } else {
            this.filteredUsers = this.users;
        }
    }

    // Phone Filter Methods
    getPhoneListInFilter(Set, element) {
        const name = element.PhoneNumber;
        if (!Set.has(name)) {
            Set.add(name);
            this.PhoneListInTable.push({ Name: name });
        }
    }

    filterPhone(event: any[]) {
        let users = this.users;
        if (event.length > 0) {
            this.filteredUsers = [];
            event.forEach((name) => {
                users = this.users.filter((ele) => ele?.PhoneNumber == name?.Name);
                this.filteredUsers = [...this.filteredUsers, ...users];
            });
        } else {
            this.filteredUsers = this.users;
        }
    }

    ngOnDestroy(): void {
        this.users = [];
        this.filteredUsers = [];
        this.dialogRef = null;
        this.selectedUsers = [];
        this.cols = [];
        this.privilegecheckedList = [];
        this.UserNameListInTable = [];
        this.UserRolesListInTable = [];
        this.PhoneListInTable = [];
        this.EmailListInTable = [];
    }
}
