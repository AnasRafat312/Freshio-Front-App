import { Component, Inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PrivilegeService } from 'src/app/components/pages/privilege/privilege.service';
import { AddUserComponent } from 'src/app/components/pages/users/add-user/add-user.component';
import { UsersService } from 'src/app/components/pages/users/users.service';
import { UserEmailExistsValidator } from 'src/app/components/pages/users/user-email-exists.validator';
import { PrivilegeRoles } from 'src/app/components/pages/privilege/interfaces/privilege';
import { LanguagesService } from 'src/app/shared/services/languages.service';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent {
  hide = true;
  hideConfirmPass = true;
  selectedFile: any;
  roles:PrivilegeRoles[];
  profileImageAtt: FormControl = new FormControl();
  file_store: FileList;
  languageFactor = 'ar'
  constructor(private roleService: PrivilegeService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<AddUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private language: LanguagesService
  )
  {
    this.language.currentLanguage.subscribe(
      data => {
        this.languageFactor = data
      }
    )
    if(this.data?.rowData){
      console.log('aaaaaaaaaaaaaaaa'+this.data?.rowData)
      this.setFormValues(this.data?.rowData);
      if(this?.data?.view){
        this.form.disable()
      }
    }

  }

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  get f() {
    return this.form.controls;
  }


  submit() {
    const requestData: { Name: string; CompanyID: string; Id?: number } = {
      Name: this.form.value.name,
      CompanyID: localStorage.getItem('companyId')
    };

   //In Edit
   console.log(this.data?.rowData);
   console.log(this.data);

   if (this.data?.rowData) {
    requestData.Id = this.data?.rowData?.id;
    this.roleService.updateRole(requestData).subscribe(
      res => {
        this.dialogRef.close(true);
        this.toastr.success('update Role Successfuly');
        this.roleService.roleSubject.next(true);
      },
      err => {
        this.dialogRef.close();
        this.toastr.error('error while creating role')
      }
    )
  }
  //Create
  else {
    this.roleService.addRole(requestData).subscribe(
      res => {
        this.dialogRef.close(true);
        this.toastr.success('Add Role Successfuly');
        this.roleService.roleSubject.next(true);
      },
      err => {
        this.dialogRef.close();
        this.toastr.error('error while creating role')
      }
    )
  }
}

  setFormValues(data: any) {
    console.log(data)
    Object.keys(this.form?.controls).forEach((key) => {
      if (data[key]) {
        this.form.controls[key].setValue(data[key]);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
  hasRequiredValidator(controlName: string): boolean {
    const control = this.form.get(controlName);
    if (control?.validator) {
      const validator = control.validator({} as AbstractControl);
      if (validator && validator['required']) {
        return true;
      }
    }
    return false;
  }

  ngOnDestroy(): void {
    this.roles=[];
  }
}
