import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LoginService } from './login.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { UserProfileService } from 'src/app/shared/services/user-profile.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ConfigService } from 'src/app/shared/services/config.service';
import { ResponseModel } from 'src/app/shared/model/response';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    isloading: boolean = false;
    languageFactor = 'ar';
    form!: FormGroup;

    constructor(
        private constant: ConfigService,
        private router: Router,
        private loginService: LoginService,
        private messageService: MessageService,
        private language: LanguagesService,
        private sharedService: SharedService,
        private userProfileService: UserProfileService
    ) {
        constant.loadConfig();
        this.language.currentLanguage.subscribe((data) => {
            this.languageFactor = data;
        });
        this.form = new FormGroup({
            Username: new FormControl('', [Validators.required]),
            Password: new FormControl('', [Validators.required]),
        });
    }
    ngOnInit(): void {
        localStorage.removeItem('token');
    }
    hasRequiredValidator(FormGroup: any, ControlName) {
        if (FormGroup?.get(ControlName)) {
            return this.sharedService.hasValidator(
                FormGroup,
                ControlName,
                'required'
            );
        }
        return false;
    }
    submit() {
        this.isloading = true;
        this.loginService.login(this.form.value).subscribe({
            next: (res: ResponseModel) => {
                const data = res?.Data;
                this.isloading = false;
                if (res?.Data) {
                    localStorage.setItem('userName', data?.Username);
                    localStorage.setItem('token', data?.Token);
                    this.userProfileService.setImageName(data?.userProfileImage);
                    this.router.navigate(['/pages/home']);
                } else {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Warning',
                        detail: 'Please Confirm Your Email'
                    });
                }
            },
            error: (err: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error occurred while Sign in'
                });
                this.isloading = false;
            },
        });
    }

}
