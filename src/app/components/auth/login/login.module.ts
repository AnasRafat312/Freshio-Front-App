import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { SharedModule } from 'src/app/shared/shared.module';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AfterLoginComponent } from './components/after-login/after-login.component';
import { RouterModule } from '@angular/router';
const router = RouterModule.forChild([
    { path: 'preparing-environment', component: AfterLoginComponent },
]);
@NgModule({
    imports: [
        CommonModule,
        LoginRoutingModule,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        FormsModule,
        PasswordModule,
        ToastModule,
        SharedModule,
        ReactiveFormsModule,
        router,
    ],
    declarations: [LoginComponent, ForgetPasswordComponent, AfterLoginComponent],
    providers: [MessageService, ConfirmationService]
})
export class LoginModule { }
