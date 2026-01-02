import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ChangePassword, LayoutService } from '../../service/app.layout.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedService } from 'src/app/shared/services/shared.service';
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  hide = true;
  hideConfirmPass = true;
  hideCurrentPass = true;
  file_store: FileList;
  form!: FormGroup;
  languageFactor = 'ar'

  constructor(private toastr: ToastrService,
    private layoutService:LayoutService,
    private router: Router,
    private messageService: MessageService,
    public dialoge: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private language:LanguagesService,
    private sharedService: SharedService
  )
  {
    this.form = new FormGroup({
      currentPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      PasswordConfirmation: new FormControl('', [Validators.required, Validators.minLength(6)]),
    }, {
      validators: this.matchingPasswordsValidator
    });
    this.language.currentLanguage.subscribe(
      data => {
        this.languageFactor = data
      }
    )
  }

  ngOnInit(): void {

  }

  matchingPasswordsValidator(formGroup: FormGroup) {
    const password = formGroup.get('newPassword').value;
    const confirmPassword = formGroup.get('PasswordConfirmation').value;
    return password === confirmPassword ? null : { passwordsNotMatch: true };
  }

  get f() {
    return this.form.controls;
  }

  submit() {
    const newPassword = this.form.get('newPassword').value;
    const repeatPassword = this.form.get('PasswordConfirmation').value;
    const currentPassword = this.form.get('currentPassword').value;
    const userId = Number(localStorage.getItem('userId'));

    const model:ChangePassword = {
      RepeatPassword:repeatPassword,
      UserId:userId,
      CurrentPassword:currentPassword,
      NewPassword:newPassword
    }
    this.layoutService.changePassword(model).subscribe(
      (res: any) => {
        if (res && res.response === true) {
          this.toastr.success(res.message);
          this.dialoge.close(true);
          this.router.navigate(['auth/login']);
        } else {
          this.toastr.error(res.message);
        }
      },
      err => {
        this.toastr.error('error while updating user password')
      }
    );
  }
  onCancel(): void {
    this.dialoge.close();
  }

  hasRequiredValidator(FormGroup: FormGroup, ControlName: string) {
    if (FormGroup?.get(ControlName)) {
      return this.sharedService.hasValidator(
        FormGroup,
        ControlName,
        'required'
      );
    }
    return false;
  }
}
