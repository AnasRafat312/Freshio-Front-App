import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Constant } from 'src/app/core/constants/constant';
import { CreditCardModel } from '../../core/models/credit-card.model';
import { ResponseModel } from 'src/app/shared/model/response';
import { CreditCardStatusEnum } from '../../core/enums/credit-card-status.enum';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { CreditCardsService } from '../../services/credit-cards.service';

@Component({
  selector: 'app-credit-cards-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class CreditCardsAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  isEditMode = false;
  creditCardId: number | null = null;
  languageSubscription: Subscription;
  
  statusOptions = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private language: LanguagesService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private constant: Constant,
    private creditCardsService: CreditCardsService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.initializeForm();
    this.statusOptions = this.sharedService.getTypeList(CreditCardStatusEnum);
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    // Check if opened in dialog with data
    if (this.config.data) {
      this.isEditMode = true;
      this.creditCardId = this.config.data.Id;
      if(this.creditCardId) {
        this.loadCreditCardData(this.creditCardId);
      }
    } else {
      // Check route params (for standalone page mode)
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.creditCardId = +params['id'];
          this.loadCreditCardData(this.creditCardId);
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
      CardHolderName: ['', [Validators.required, Validators.minLength(3)]],
      CardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      NationalId: ['', [Validators.required, Validators.pattern(/^[0-9]{14}$/)]],
      CreditLimit: [0, [Validators.required, Validators.min(0)]],
      Balance: [0, [Validators.required, Validators.min(0)]],
      PaymentDueDayOfMonth: [null, [Validators.min(1), Validators.max(31)]],
      // Status: [null, Validators.required],
      ExpiryDate: ['', Validators.required],
      Notes: ['']
    });
  }

  private loadCreditCardData(id: number): void {
    this.creditCardsService.getCreditCardById(id).subscribe({
      next: (response: ResponseModel) => {
        if (response?.Success && response?.Data) {
          this.form.patchValue(response.Data);
        }
        this.form.get('ExpiryDate').setValue(new Date(response?.Data?.ExpiryDate))
      },
      error: (error) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load credit card data' 
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

    const creditCardData: CreditCardModel = {
      ...this.form.value,
      Id: this.creditCardId || 0,
      CreatedBy: this.isEditMode ? undefined : JSON.parse(localStorage.getItem('userId')),
      CreatedDateTime: this.isEditMode ? undefined : this.sharedService.getDateTime(new Date())
    };

    if (this.isEditMode) {
      this.creditCardsService.updateCreditCard(creditCardData).subscribe({
        next: (response: ResponseModel) => {
          if (response?.Success) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: response.Message || 'Credit card updated successfully'
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
            detail: error?.error?.Message || 'An error occurred while updating the credit card' 
          });
        }
      });
    } else {
      this.creditCardsService.addCreditCard(creditCardData).subscribe({
        next: (response: ResponseModel) => {
          if (response?.Success) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: response.Message || 'Credit card added successfully'
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
            detail: error?.error?.Message || 'An error occurred while adding the credit card' 
          });
        }
      });
    }
  }

  onCancel(): void {
    if (this.ref) {
      this.ref.close(false);
    } else {
      this.router.navigate(['/pages/credit-cards']);
    }
  }
}
