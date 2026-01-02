import { ChangeDetectorRef, Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Constant } from 'src/app/core/constants/constant';
import { MessageService } from 'primeng/api';
import { LanguagesService } from '../../services/languages.service';
import { PrivilegeService } from 'src/app/components/pages/privilege/privilege.service';

@Component({
  selector: 'app-switch-company',
  templateUrl: './switch-company.component.html',
  styleUrls: ['./switch-company.component.scss']
})
export class SwitchCompanyComponent {
    companiesList:any[] = []
    languageFactor = 'en';
    constructor(
        private constant: Constant,
        private cdr: ChangeDetectorRef,
        private sharedService: SharedService,
        private privilegeService: PrivilegeService,
        private messageService: MessageService,
        private language: LanguagesService,

    ) {
        this.languageFactor = this.language.getCurrentLanguage();
    }

    selectedCompany:any;

    ngOnInit() {
        this.sharedService.getAllCompaniesByUserID().subscribe((res) => {

            this.companiesList = res;
            const currentCompany = this.companiesList.find(ele => ele.ID == localStorage.getItem('companyId'))
            this.selectedCompany = currentCompany
            this.cdr.markForCheck()
        });
    }

    onCompanySelect() {
        if(this.selectedCompany ) {
            this.privilegeService
                .getUserRoleInCompanyAndPrivilege(this.selectedCompany?.ID)
                .subscribe((data: any) => {
                    localStorage.setItem("companyId", this.selectedCompany.ID.toString());
                    if(data.SelectedCompany?.AccountID){
                        localStorage.setItem("accountId", data.SelectedCompany?.AccountID.toString());
                    }
                    localStorage.setItem("roleId", data.RoleID.toString());
                    localStorage.setItem("companyName", data.SelectedCompany?.Name.toString());
                    localStorage.setItem('companyLogo',data.SelectedCompany?.Logo);
                    if(data.SelectedCompany?.EntityID) {
                        localStorage.setItem("entityId", data.SelectedCompany?.EntityID.toString());
                    }
                    localStorage.setItem('logo', this.constant.ATTACHMENT_FILES_SOURCE+ data.SelectedCompany?.profileImage);
                    this.privilegeService.updatCheckedPrivilegeList(this.privilegeService.getPages(data));
                    window.location.reload();
                });
        }
    }
}
