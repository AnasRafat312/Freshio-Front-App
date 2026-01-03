import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Constant } from 'src/app/core/constants/constant';
import { TransactionFeeModel } from '../../core/models/transaction-fee.model';
import { ResponseModel } from 'src/app/shared/model/response';
import { FeeTypeEnum } from '../../core/enums/fee-type.enum';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transaction-fees-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class TransactionFeesAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  isEditMode = false;
  feeId: number | null = null;
  languageSubscription: Subscription;
  
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
    this.typeOptions = this.sharedService.getTypeList(FeeTypeEnum);
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    if (this.config.data) {
      this.isEditMode = true;
      this.feeId = this.config.data.ID;
      this.form.patchValue(this.config.data);
    } else {
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.feeId = +params['id'];
          this.loadFeeData(this.feeId);
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
      Amount: [0, [Validators.required, Validators.min(0)]],
      Type: [null, Validators.required]
    });
  }

  private loadFeeData(id: number): void {
    const url = this.constant.SRM_API_ENDPOINT + `TransactionFees/GetById?id=${id}`;
    this.sharedService.confirm(url, '', 'Get').subscribe({
      next: (response: ResponseModel) => {
        if (response) {
          this.form.patchValue(response);
        }
      },
      error: (error) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load transaction fee data' 
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

    const feeData: TransactionFeeModel = {
      ...this.form.value,
      ID: this.feeId || 0,
      CreatedBy: this.isEditMode ? undefined : JSON.parse(localStorage.getItem('userId')),
      CreatedDateTime: this.isEditMode ? undefined : this.sharedService.getDateTime(new Date())
    };

    if (this.isEditMode) {
      const url = this.constant.SRM_API_ENDPOINT + 'TransactionFees/Update';
      this.sharedService.Update(url, feeData).subscribe({
        next: (response: ResponseModel) => {
          if (response.response) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: response.message || 'Transaction fee updated successfully'
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
            detail: 'An error occurred while updating the transaction fee' 
          });
        }
      });
    } else {
      const url = this.constant.SRM_API_ENDPOINT + 'TransactionFees/Add';
      this.sharedService.Create(url, feeData).subscribe({
        next: (response: ResponseModel) => {
          if (response.response) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: response.message || 'Transaction fee added successfully'
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
            detail: 'An error occurred while adding the transaction fee' 
          });
        }
      });
    }
  }

  onCancel(): void {
    if (this.ref) {
      this.ref.close(false);
    } else {
      this.router.navigate(['/pages/transaction-fees']);
    }
  }
}
