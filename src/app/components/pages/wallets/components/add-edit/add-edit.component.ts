import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Constant } from 'src/app/core/constants/constant';
import { WalletModel } from '../../core/models/wallet.model';
import { ResponseModel } from 'src/app/shared/model/response';
import { WalletProviderEnum, WalletStatusEnum } from '../../core/enums/wallet-status.enum';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wallets-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class WalletsAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  isEditMode = false;
  walletId: number | null = null;
  languageSubscription: Subscription;
  
  statusOptions = [];
  
  typeOptions = [];

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
    this.statusOptions = sharedService.getTypeList(WalletStatusEnum)
    this.typeOptions = sharedService.getTypeList(WalletProviderEnum)
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    // Check if opened in dialog with data
    debugger
    if (this.config.data) {
      this.isEditMode = true;
      this.walletId = this.config.data.Id;
      if(this.walletId) {
        this.loadWalletData(this.walletId);
      }
    } else {
      // Check route params (for standalone page mode)
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.walletId = +params['id'];
          this.loadWalletData(this.walletId);
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
      PhoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      Name: ['', [Validators.required, Validators.minLength(3)]],
      NationalId: ['', [Validators.required, Validators.pattern(/^[0-9]{14}$/)]],
      MonthlyLimit: [200000, [Validators.required, Validators.min(0)]],
      DailyLimit: [60000, [Validators.required, Validators.min(0)]],
      Balance: [0, [Validators.required, Validators.min(0)]],
      // Status: [1],
      Provider: [WalletProviderEnum.Vodafone, Validators.required],
      MonthlyUsed: [0],
      DailyUsed: [0],
      Notes: ['']
    });
  }

  private loadWalletData(id: number): void {
    const url = this.constant.API_ENDPOINT + `ElectronicWallets/GetById/${id}`;
    this.sharedService.confirm(url, '', 'Get').subscribe({
      next: (response: ResponseModel) => {
        if (response?.Data) {
          const data = response.Data
          data.Provider = WalletProviderEnum[data?.Provider]
          this.form.patchValue(data);
          // Set status based on balance after loading data
          /* const status = data.Balance === 0 ? WalletStatusEnum.Unavailable : WalletStatusEnum.Available;
          this.form.get('Status')?.setValue(status, { emitEvent: false }); */
        }
      },
      error: (error) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load wallet data' 
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

    const walletData: WalletModel = {
      ...this.form.value,
      Id: this.walletId || 0,
      CreatedBy: this.isEditMode ? undefined : JSON.parse(localStorage.getItem('userId')),
      CreatedDateTime: this.isEditMode ? undefined : this.sharedService.getDateTime(new Date()),
    };

    if (this.isEditMode) {
      const url = this.constant.API_ENDPOINT + `ElectronicWallets/Update/${walletData.Id}`;
      this.sharedService.Update(url, walletData).subscribe({
        next: (response: ResponseModel) => {
          if (response.Success) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: response.Message || 'Wallet updated successfully'
            });
            this.ref.close(response?.Data);
          } else {
            this.messageService.add({ 
              severity: 'warn', 
              summary: 'Error', 
              detail: response.Message || 'Operation failed' 
            });
          }
        },
        error: (error) => {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'An error occurred while updating the wallet' 
          });
        }
      });
    } else {
      const url = this.constant.API_ENDPOINT + 'ElectronicWallets/Create';
      this.sharedService.Create(url, walletData).subscribe({
        next: (response: ResponseModel) => {
          if (response.Success) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: response.Message || 'Wallet added successfully'
            });
            this.ref.close(response?.Data);
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: response.Message || 'Operation failed' 
            });
          }
        },
        error: (error) => {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'An error occurred while adding the wallet' 
          });
        }
      });
    }
  }

  onCancel(): void {
    if (this.ref) {
      this.ref.close(false);
    } else {
      this.router.navigate(['/pages/wallets']);
    }
  }
}
