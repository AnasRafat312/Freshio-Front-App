import { Component, effect, ElementRef, HostBinding, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordComponent } from './component/change-password/change-password.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProfileComponent } from '../shared/components/profile/profile.component';
import { UserProfileService } from '../shared/services/user-profile.service';
import { Constant } from 'src/app/core/constants/constant';
import { Router } from '@angular/router';
import { SharedService } from '../shared/services/shared.service';
import { LanguagesService } from '../shared/services/languages.service';
import { PrivilegeService } from '../components/pages/privilege/privilege.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  styleUrls: ['./app.topbar.component.scss']
})
export class AppTopBarComponent {
    ref: DynamicDialogRef | undefined;
    selectedOption: string; // To store the selected option
    options: any[]; // An array of options
    items!: MenuItem[];
    dialogRef: any;
    userName!:string;
    userImagePath:string;
    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;
    languageFactor = 'ar'
    isDetails:boolean;
    lastSegment:any;
    companiesList: any[] = [];
    constructor(
        private constant: Constant,public layoutService: LayoutService,
        public dialog: MatDialog,
        private language:LanguagesService,
        private profileService:UserProfileService,
        private router:Router,
        private sharedService:SharedService,
        public dialogService: DialogService,
        private privilegeService: PrivilegeService,
        ) {
        this.options = [
            { label: 'Profile', value: 'Profile', icon: 'pi pi-user' },
            { label: 'Change Password', value: 'changePassword', icon: 'pi pi-globe' },
          ];
          this.languageFactor = language.getCurrentLanguage()
          this.userName = localStorage.getItem('userName');
          effect(() => {
            const name = this.profileService.imageSignal();
            if (name && name !== '') {
                this.userImagePath = this.constant.USER_PROFILE_IMAGE_SOURCE + name;
            } else {
                this.userImagePath =
                    this.constant.USER_PROFILE_IMAGE_SOURCE +
                    localStorage.getItem('userImage');
                    localStorage.setItem('Logo', this.constant.USER_PROFILE_IMAGE_SOURCE + localStorage.getItem('userImage'));
            }
        });
          this.sharedService.getIsDetails().subscribe(
            res => {

              this.isDetails = res
            }
          )
        this.getCompanies();
     }

    getCompanies() {
        this.sharedService.getAllCompaniesByUserID().subscribe((res) => {
            this.companiesList = res;
        });
    }

    switchCompany(company: any) {
        if (company) {
            this.privilegeService
                .getUserRoleInCompanyAndPrivilege(company.ID)
                .subscribe((data: any) => {
                    localStorage.setItem("companyId", company.ID.toString());
                    if(data.SelectedCompany?.AccountID){
                        localStorage.setItem("accountId", data.SelectedCompany?.AccountID.toString());
                    }
                    localStorage.setItem("roleId", data.RoleID.toString());
                    localStorage.setItem("companyName", data.SelectedCompany?.Name.toString());
                    localStorage.setItem('companyLogo', data.SelectedCompany?.Logo);
                    if (data.SelectedCompany?.EntityID) {
                        localStorage.setItem("entityId", data.SelectedCompany?.EntityID.toString());
                    }
                    localStorage.setItem('logo', this.constant.ATTACHMENT_FILES_SOURCE + data.SelectedCompany?.profileImage);
                    this.privilegeService.updatCheckedPrivilegeList(this.privilegeService.getPages(data));
                    window.location.reload();
                });
        }
    }
    logout(){
        this.layoutService.logout();
        localStorage.clear()
    }
    openForm(user?: any) {
        // this.dialogRef = this.dialog.open(ChangePasswordComponent, {
        //   disableClose: true,
        //   data: { rowData: user }
        // });
    let header = '';
    if (this.languageFactor == 'en') {
     header = 'Change Password';
    } else  {
     header = 'تعديل الباسورد' ;
    }
    this.ref = this.dialogService.open(
      ChangePasswordComponent,
        {
            header: header,
            contentStyle: { overflow: 'auto'},
            data: {user},
            baseZIndex: 10000,
            maximizable: true,
            resizable:true,
            styleClass: 'sm-dialog-width'
        }
    );
      }
      openProfile() {
        this.ref = this.dialogService.open(ProfileComponent, {
            header:null ,
            showHeader:false,
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            styleClass:'profile-popup sm-dialog-width',
            position: 'center',
            height: '300px',
            dismissableMask: true, // Enables closing the popup by clicking outside it
        })
      }
      changSidbarList() {

        this.sharedService.setIsDetails(false)
        this.layoutService.setSidebareItemsList('mainList');
        localStorage.setItem('ListTypeName','mainList')
      }
      goToSupportsList() {
        this.router.navigate(['pages/support/my'])
    }

    toggleLanguage() {
      const newLang = this.languageFactor === 'en' ? 'ar' : 'en';
      this.language.setLanguage(newLang);
      window.location.reload();
    }
}
