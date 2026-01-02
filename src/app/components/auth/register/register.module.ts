import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { SharedModule } from 'src/app/shared/shared.module';
import { ConfirmationService } from 'primeng/api';
import { LoginRoutingModule } from '../login/login-routing.module';
import { RegisterComponent } from './register/register.component';
import { RouterModule } from '@angular/router';
import { PreparingAfterRegistrationPageComponent } from './preparing-after-registration-page/preparing-after-registration-page.component';

const router = RouterModule.forChild([
    { path: '', component: RegisterComponent },
    { path: 'preparing', component: PreparingAfterRegistrationPageComponent },
]);
@NgModule({
    imports: [
        CommonModule,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        FormsModule,
        PasswordModule,
        SharedModule,
        ReactiveFormsModule,
        router,
    ],
    declarations: [RegisterComponent, PreparingAfterRegistrationPageComponent],
    providers: [ConfirmationService],
})
export class RegisterModule {}
