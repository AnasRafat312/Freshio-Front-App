import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeleteModalComponent } from 'src/app/shared/components/delete-modal/delete-modal.component';
import { GeneralConfig } from 'src/app/core/common/generalConfig';
import { LanguageService } from 'src/app/core/languageLocalization/language.service';
import { PrivilegeService } from 'src/app/components/pages/privilege/privilege.service';
import { AddRoleComponent } from '../add-role/add-role.component';
import { PrivilegeChecked } from 'src/app/components/pages/privilege/interfaces/privilege';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { Constant } from 'src/app/core/constants/constant';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PageNaming } from 'src/app/shared/components/page-info/core/page-naming';

@Component({
    selector: 'app-roles',
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.scss'],
})
export class RolesComponent extends GeneralConfig implements OnInit {
    roles: any = [];
    model: any = {};
    actionsList: {
        icon: string;
        tooltip: string;
        styleClass: string;
        action: (row: any, index?: number) => void;
        condition?: (row: any) => boolean;
    }[] = [];
    dialogRef: any;
    selectedUsers = [];
    rowsPerPageOptions = [5, 10, 20];
    EditRole: boolean = false;
    AddRole: boolean = false;
    DeleteRole: boolean = false;
    RolePrivileges: boolean = false;
    privilegecheckedList!: PrivilegeChecked[];
    languageFactor = 'ar';

    constructor(
        private constant: Constant,
        private privilegeService: PrivilegeService,
        languageService: LanguageService,
        public dialog: MatDialog,
        private language: LanguagesService,
        private sharedService: SharedService,
        private router: Router
    ) {
        sharedService.setPageLocalName(PageNaming.ROLES);
        super(languageService);

        this.initializeModel();

        this.privilegeService.checkedPrivilegeList.subscribe((data) => {
            this.EditRole = false;
            this.AddRole = false;
            this.DeleteRole = false;
            this.RolePrivileges = false;
            this.privilegecheckedList = data;
            this.showActionBaseOnPrivilege(this.privilegecheckedList);
        });
    }

    ngOnInit() {
        this.getRoles();
    }

    private initializeModel(): void {
        this.language.currentLanguage.subscribe((data) => {
            this.languageFactor = data;

            this.model = {
                name: {
                    hideSorting: false,
                    header: this.languageFactor === 'en' ? 'Name' : 'الأسم',
                },
            };
        });
    }

    showActionBaseOnPrivilege(pages: PrivilegeChecked[]) {
        this.actionsList = [];

        pages.forEach(page => {
            if (page.page === 'RolesList') {
                page.actions.forEach(action => {
                    if (action === 'RolePrivileges') {
                        this.RolePrivileges = true;
                        this.actionsList.push({
                            tooltip: this.languageFactor === 'en' ? 'Privileges' : 'الصلاحيات',
                            icon: 'fas fa-list-check fa-l',
                            styleClass: 'p-button-success',
                            action: (row: any) => this.goToPrivilege(row)
                        });
                    } else if (action === 'EditRole') {
                        this.EditRole = true;
                        this.actionsList.push({
                            tooltip: this.languageFactor === 'en' ? 'Role' : 'تعديل',
                            icon: 'pi pi-pencil',
                            styleClass: 'p-button-warning',
                            action: (row: any, index: number) => this.openForm(row)
                        });
                    } else if (action === 'DeleteRole') {
                        this.DeleteRole = true;
                        this.actionsList.push({
                            tooltip: this.languageFactor === 'en' ? 'Company' : 'حذف',
                            icon: 'pi pi-trash',
                            styleClass: 'p-button-danger',
                            action: (row: any, index: number) => this.delete(row.id)
                        });
                    } else if (action === 'AddRole') {
                        this.AddRole = true;
                    }
                });
            }
        });
    }

    goToPrivilege(role: any) {
        localStorage.setItem('newRoleId', JSON.stringify(role.id));
        this.router.navigate(['/pages/privilege']);
    }

    getRoles() {
        this.privilegeService.getRoles().subscribe(
            (res) => {
                this.roles = res;
            },
            (err) => {}
        );
    }

    openForm(user?: any) {
        this.dialogRef = this.dialog.open(AddRoleComponent, {
            disableClose: true,
            width: '25%',
            data: { rowData: user },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.getRoles();
            }
        });
    }

    delete(roleId: number) {
        console.log(roleId);

        let url = this.constant.GETWAY_API_ENDPOINT + 'Role/DeleteRole';
        let model = {
            DeletedBy: JSON.parse(localStorage.getItem('userId')),
            DeletedDateTime: this.getCurrentDate(),
            ID: roleId,
            companyId: JSON.parse(localStorage.getItem('companyId')),
        };

        this.dialogRef = this.dialog.open(DeleteModalComponent, {
            width: '25%',
            data: { url: url, model },
        });

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.getRoles();
            }
        });
    }

    getCurrentDate() {
        const startDate = new Date();
        const year = startDate.getFullYear();
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const day = String(startDate.getDate()).padStart(2, '0');
        const hours = String(startDate.getHours()).padStart(2, '0');
        const minutes = String(startDate.getMinutes()).padStart(2, '0');
        const seconds = String(startDate.getSeconds()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return formattedDate;
    }
}
