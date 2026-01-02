import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from './login.service';
import { CompainesService } from '../../pages/companies/compaines.service';
import { Company } from '../../pages/companies/compaines.model';
import { PrivilegeChecked } from '../../pages/privilege/interfaces/privilege';
import { PrivilegeService } from '../../pages/privilege/privilege.service';
import { IUserRole, RegistrationModel } from './login.model';
import { Constant } from 'src/app/core/constants/constant';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { MatDialog } from '@angular/material/dialog';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { ProfileComponent } from 'src/app/shared/components/profile/profile.component';
import { UserProfileService } from 'src/app/shared/services/user-profile.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ConfirmationService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { ConfigService } from 'src/app/shared/services/config.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
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
    PlanID!: number;
    trails = [
        /*     {
        ID: '1000',
        code: 'f230fh0g3',
        name: 'Bamboo Watch',
        description: 'Product Description',
        image: 'bamboo-watch.jpg',
        price: 65,
        category: 'Accessories',
        quantity: 24,
        inventoryStatus: 'INSTOCK',
        rating: 5
    },
    {
        ID: '1001',
        code: 'f230fh0g3',
        name: 'Bamboo Watch',
        description: 'Product Description',
        image: 'bamboo-watch.jpg',
        price: 65,
        category: 'Accessories',
        quantity: 24,
        inventoryStatus: 'INSTOCK',
        rating: 5
    },
    {
        ID: '1002',
        code: 'f230fh0g3',
        name: 'Bamboo Watch',
        description: 'Product Description',
        image: 'bamboo-watch.jpg',
        price: 65,
        category: 'Accessories',
        quantity: 24,
        inventoryStatus: 'INSTOCK',
        rating: 5
    }, */
    ];

    constructor(
        private constant: ConfigService,
        public http: HttpClient,
        private router: Router,
        private loginService: LoginService,
        private toastr: ToastrService,
        public dialog: MatDialog,
        private language: LanguagesService,
        private privilegeService: PrivilegeService,
        private sharedService: SharedService,
        //private trailService: TrailsService,
        private confirmationService: ConfirmationService,
        private cookieService: CookieService,
        private userProfileService: UserProfileService,

    ) {
        constant.loadConfig();
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
        });
        this.form = new FormGroup({
            Email: new FormControl('', [Validators.required, Validators.email]),
            Password: new FormControl('', [Validators.required]),
        });
        this.formCompany = new FormGroup({
            CompanyId: new FormControl('', [Validators.required]),
        });
        this.RegisterForm = new FormGroup(
            {
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
                IndustryID: new FormControl(null),
                Phone: new FormControl(null),
                CountryID: new FormControl(null),
                Address: new FormControl(null),
                CreatedDateTime: new FormControl(null),
            },
            {
                validators: [
                    this.matchingPasswordsValidator,
                    this.maxminPhoneNumbersValidator,
                ],
            }
        );
    }
    ngOnInit(): void {
        
        //this.cookieService.delete('token', '/');
        localStorage.removeItem('token');

        if (localStorage.getItem('Login')) {
            if (localStorage.getItem('Login') == '1') {
                this.showRegisteration = false;
                this.showLogin = true;
                this.showCom = false;
                this.showTrails = false;
            } else if (localStorage.getItem('Login') == '2') {
                this.showRegisteration = false;
                this.showLogin = false;
                this.showCom = true;
                this.showTrails = false;
            } else if (localStorage.getItem('Login') == '3') {
                this.showRegisteration = true;
                this.showLogin = false;
                this.showCom = false;
                this.showTrails = false;
            }
        } else {
            this.showRegisteration = false;
            this.showLogin = true;
            this.showCom = false;
            this.showTrails = false;
        }
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
            next: (res: any) => {
                
                this.isloading = false;
                if (Number(res.userID) > 0) {
                    localStorage.setItem('userName', res?.userName);
                    
                    this.showCom = true;
                    this.showLogin = false;
                    this.compaines = res.companyList;
                    localStorage.setItem('userId', res?.userID);
                    //this.cookieService.set('userId', res?.userID, { expires: 7, secure: true });
                    localStorage.setItem('userImage', res?.userProfileImage);
                    localStorage.setItem('token', res?.access_token);
                    this.userProfileService.setImageName(res?.userProfileImage)

                  const expires = new Date(new Date().getTime() + 9 * 60 * 60 * 1000); // 9 hours
                     //this.cookieService.set('token', res?.access_token, { expires: expires, secure: true });
                   /* this.cookieService.set('token', res?.access_token, {
                        expires,
                        secure: true,
                        sameSite: 'None',
                        path: '/'
                      }); */

                } else {
                    this.toastr.warning('Please Confirm Your Email');
                }
            },
            error: (err: any) => {
                this.toastr.error('Error ocure while Sign in ');
            },
        });
    }

    chooseCom() {
        var CompanyId = this.formCompany.value.CompanyId;
        if (CompanyId != null && CompanyId != undefined && CompanyId > 0) {
            localStorage.setItem('companyId', CompanyId);
            //set companyName
            this.compaines.forEach((company: any) => {
                if (company.ID == CompanyId) {
                    localStorage.setItem('companyName', company.Name);
                }
            });
            this.privilegeService.getUserRoleInCompanyAndPrivilege().subscribe(
                (data: any) => {
                    if (data.IsThereException) {
                        this.toastr.error(data.ExceptionMessage);
                        localStorage.removeItem('companyId');
                    } else {
                        localStorage.setItem(
                            'accountId',
                            data.SelectedCompany?.AccountID.toString()
                        );
                        localStorage.setItem(
                            'companyLogo',
                            data.SelectedCompany?.Logo
                        );
                        if(data.SelectedCompany?.EntityID) {
                            localStorage.setItem("entityId", data.SelectedCompany?.EntityID.toString());
                        }
                        localStorage.setItem('roleId', data.RoleID.toString());
                        this.privilegeService.updatCheckedPrivilegeList(
                            this.privilegeService.getPages(data)
                        );
                        this.router.navigate(['/pages/home']);
                        localStorage.setItem('Login', '1');
                    }
                },
                (err: any) => {
                    this.toastr.error(
                        'Error occures while selecting a complate'
                    );
                }
            );
        } else {
            this.toastr.error('Select a company to complate sing in');
        }
    }
    forgetPassword() {
        console.log('hello forget Password');
        this.dialogRef = this.dialog.open(ForgetPasswordComponent, {
            disableClose: true,
            data: {},
            width: '40%',
        });
    }
    registerationForm() {
        this.router.navigateByUrl('/auth/register');
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
        this.loginService.CreateRegistration(model).subscribe(
            (res: any) => {
                if (res.response) {
                    if (res.massageType == 1) {
                        this.confirmationService.confirm({
                            header: 'Congratulations!!!',
                            message:
                                'Please Check your InBox For Verification Process',
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
                        });
                    } else if (res.massageType == 2) {
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
                    }
                    //this.toastr.success(res.message)
                } else {
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
        this.showCom = false;
        this.showRegisteration = false;
        this.showTrails = false;
        this.showLogin = true;
        localStorage.setItem('Login', '1');
    }
    // Form Methods
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
    setPlanID(ID) {
        this.PlanID = ID;
    }


}
