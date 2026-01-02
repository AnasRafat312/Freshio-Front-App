import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ForgetPasswordComponent } from '../../login/components/forget-password/forget-password.component';
import { RegistrationModel } from '../../login/login.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginService } from '../../login/login.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { PrivilegeService } from 'src/app/components/pages/privilege/privilege.service';
import { SharedService } from 'src/app/shared/services/shared.service';
//import { TrailsService } from 'src/app/components/pages/trails/services/trails.service';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
    loginCheck: boolean = true;
    valCheck: string[] = ['remember'];
    password!: string;
    showLogin: boolean = true;
    showCom: boolean;
    isloading: boolean;
    dialogRef: any;
    compaines: { name: string; code: string }[];
    languageFactor = 'ar';
    //login Probs
    //registration Probs
    form!: FormGroup;
    formCompany!: FormGroup;
    RegisterForm!: FormGroup;
    showRegisteration: boolean = false;
    modulesList: any[] = [];
    countriesList: any[] = [];
    industriesList: any[] = [];
    // trails
    showTrails: boolean = false;
    responsiveOptions: any[] | undefined;
    PlanID: number = 2;
    trails = [];

    constructor(
        public http: HttpClient,
        private router: Router,
        private loginService: LoginService,
        private toastr: ToastrService,
        public dialog: MatDialog,
        private language: LanguagesService,
        private privilegeService: PrivilegeService,
        private sharedSarvice: SharedService,
        //private trailService: TrailsService,
        private confirmationService: ConfirmationService
    ) {
        localStorage.setItem('Login', '1');
        this.responsiveOptions = [
            {
                breakpoint: '1199px',
                numVisible: 1,
                numScroll: 1,
            },
            {
                breakpoint: '991px',
                numVisible: 2,
                numScroll: 1,
            },
            {
                breakpoint: '767px',
                numVisible: 1,
                numScroll: 1,
            },
        ];
        this.language.currentLanguage.subscribe((data) => {
            this.languageFactor = data;
            this.getAllLists();
        });
        this.RegisterForm = new FormGroup({
            Email: new FormControl(null, [
                Validators.required,
                Validators.email,
            ]),
            Password: new FormControl(null, [
                Validators.required,
                Validators.minLength(6),
            ]),
            ConfirmPassword: new FormControl(null, [Validators.required]),
            CompanyName: new FormControl(null, [Validators.required]),
            UserName: new FormControl(null, [Validators.required]),
            IndustryID: new FormControl(null, [Validators.required]),
            Phone: new FormControl(null, [Validators.required]),
            CountryID: new FormControl(null, [Validators.required]),
            Address: new FormControl(null),
            CreatedDateTime: new FormControl(null),
        },
        {
            validators: [
                this.matchingPasswordsValidator,
                this.maxminPhoneNumbersValidator,
            ],
        });
    }
    ngOnInit(): void {
        this.getAllLists();
    }
    // getAllLists
    getAllLists() {
        // get all country
        this.loginService.getAllcountries().subscribe((res: any) => {
            this.countriesList = res;
        });
        // get all modules
        this.loginService.getAllModules().subscribe((res: any) => {
            this.modulesList = res;
        });
        // get all industry
        this.loginService.getAllIndustries().subscribe((res: any) => {
            this.industriesList = res;
            console.log(this.industriesList);
        });
        /* this.trailService.getAllTrails().subscribe((res) => {
            this.trails = res;
        }); */
    }

    RegistrationSubmit() {
        const model: RegistrationModel = {
            Email: this.RegisterForm.value.Email,
            Password: this.RegisterForm.value.Password,
            Address: this.RegisterForm.value.Address,
            UserName: this.RegisterForm.value.UserName,
            CompanyName: this.RegisterForm.value.CompanyName,
            Phone: this.RegisterForm.value.Phone,
            IndustryID: this.RegisterForm.value.IndustryID,
            CountryID: this.RegisterForm.value.CountryID,
            SelectedPlanID: this.PlanID,
            CreatedDateTime: this.getDatetimeNow(),
        };
        /* this.confirmationService.confirm({
            header: 'Congratulations!!!',
            message:
                'Please Check Your Mail For Verification Process',
            rejectButtonStyleClass: 'd-none text-center',
            acceptLabel: 'Ok',
            acceptIcon: 'none',
            icon: 'fa-regular fa-face-smile-beam text-5xl',
            accept: () => {
                this.showRegisteration = false;
                this.showLogin = true;
                this.showCom = false;
                this.showTrails = false;
                localStorage.setItem('Login', '1');
            },
        }); */
        this.loginService.CreateRegistration(model).subscribe(
            (res: any) => {

                if (res.response) {
                    localStorage.setItem('registUserName',this.RegisterForm.value.UserName)
                    this.router.navigate(['auth/register/preparing'])
                    /* else if (res.massageType == 2) {
                        this.confirmationService.confirm({
                            header: 'Sorry!!!',
                            message: 'This Email Is Already Exist',
                            rejectButtonStyleClass: 'd-none text-center',
                            acceptLabel: 'Ok',
                            acceptButtonStyleClass: 'btn-danger',
                            acceptIcon: 'none',
                            icon: 'fa-regular fa-face-meh text-5xl',
                            accept: () => {
                                this.showRegisteration = false;
                                this.showLogin = true;
                                this.showCom = false;
                                this.showTrails = false;
                                localStorage.setItem('Login', '1');
                            },
                        });
                    } */
                }
                 else {
                    this.toastr.error(res.message);
                }
            },
            (err: any) => {
                this.toastr.error(err.message);
            }
        );
    }
    showTials() {
        this.showRegisteration = false;
        this.showLogin = false;
        this.showCom = false;
        this.showTrails = true;
    }
    login() {
        JSON.parse(localStorage.getItem('emails')!).forEach(
            (item: any, i: number) => {
                console.log(i);
                if (
                    item.email === this.form.get('email')!.value &&
                    item.password === this.form.get('password')!.value
                ) {
                    localStorage.setItem(
                        'user',
                        JSON.stringify({ item: item, index: i })
                    );
                    this.router.navigate(['/home']);
                } else {
                    this.loginCheck = false;
                }
            }
        );
    }
    getDatetimeNow() {
        // Create a new Date object for the current date and time
        const now = new Date();

        // Extract date and time components
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // Create the formatted date-time string
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    // back to login
    backToLogin() {
        this.router.navigateByUrl('/auth/login');
    }
    matchingPasswordsValidator(formGroup: FormGroup) {
         ;
        const password = formGroup.get('Password').value;
        const confirmPassword = formGroup.get('ConfirmPassword').value;
        return password === confirmPassword
            ? null
            : { passwordsNotMatch: true };
    }
    maxminPhoneNumbersValidator(formGroup: FormGroup) {
         ;
        const phone = formGroup.get('Phone').value;
        if (phone == null) {
            return null;
        }
        const phoneCount = Math.floor(Math.log10(phone)) + 1;
        if (phoneCount > 15) {
            return { bigNumber: true };
        } else if (phoneCount < 10) {
            return { smallNumber: true };
        }
        return null;
    }
    ngOnDestroy(): void {
        localStorage.removeItem('Login');
    }
}
