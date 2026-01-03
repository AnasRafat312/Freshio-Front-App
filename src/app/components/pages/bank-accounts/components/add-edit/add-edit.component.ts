import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Constant } from 'src/app/core/constants/constant';
import { BankAccountModel } from '../../core/models/bank-account.model';
import { ResponseModel } from 'src/app/shared/model/response';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bank-accounts-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class BankAccountsAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  isEditMode = false;
  bankAccountId: number | null = null;
  languageSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private language: LanguagesService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private constant: Constant,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    if (this.config.data) {
      this.isEditMode = true;
      this.bankAccountId = this.config.data.ID;
      this.form.patchValue(this.config.data);
    } else {
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.bankAccountId = +params['id'];
          this.loadBankAccountData(this.bankAccountId);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      AccountHolderName: ['', [Validators.required, Validators.minLength(3)]],
      PhoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      BankName: ['', [Validators.required, Validators.minLength(3)]],
      AccountNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      IBAN: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/)]],
      Balance: [0, [Validators.required, Validators.min(0)]]
    });
  }

  private loadBankAccountData(id: number): void {
    const url = this.constant.SRM_API_ENDPOINT + `BankAccounts/GetById?id=${id}`;
    this.sharedService.confirm(url, '', 'Get').subscribe({
      next: (response: BankAccountModel) => {
        if (response) {
          this.form.patchValue(response);
        }
      },
      error: (error) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load bank account data' 
        });
      }
    });
  }

  hasRequiredValidator(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    if (control && control.validator) {
      const validator = control.validator({} as any);
      return validator && validator['required'];
    }
    return false;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Warning', 
        detail: 'Please fill all required fields correctly' 
      });
      return;
    }

    const bankAccountData: BankAccountModel = {
      ...this.form.value,
      ID: this.bankAccountId || 0,
      CreatedBy: this.isEditMode ? undefined : JSON.parse(localStorage.getItem('userId')),
      CreatedDateTime: this.isEditMode ? undefined : this.sharedService.getDateTime(new Date()),
      ModifiedBy: this.isEditMode ? JSON.parse(localStorage.getItem('userId')) : undefined,
      ModifiedDateTime: this.isEditMode ? this.sharedService.getDateTime(new Date()) : undefined
    };

    if (this.isEditMode) {
      const url = this.constant.SRM_API_ENDPOINT + 'BankAccounts/Update';
      this.sharedService.Update(url, bankAccountData).subscribe({
        next: (response: ResponseModel) => {
          if (response.response) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: response.message || 'Bank account updated successfully'
            });
            this.ref.close(true);
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: response.message || 'Operation failed' 
            });
          }
        },
        error: (error) => {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'An error occurred while updating the bank account' 
          });
        }
      });
    } else {
      const url = this.constant.SRM_API_ENDPOINT + 'BankAccounts/Add';
      this.sharedService.Create(url, bankAccountData).subscribe({
        next: (response: ResponseModel) => {
          if (response.response) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: response.message || 'Bank account added successfully'
            });
            this.ref.close(true);
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: response.message || 'Operation failed' 
            });
          }
        },
        error: (error) => {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'An error occurred while adding the bank account' 
          });
        }
      });
    }
  }

  onCancel(): void {
    if (this.ref) {
      this.ref.close(false);
    } else {
      this.router.navigate(['/pages/bank-accounts']);
    }
  }
}
