import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Constant } from 'src/app/core/constants/constant';
import { YellowCardModel } from '../../core/models/yellow-card.model';
import { ResponseModel } from 'src/app/shared/model/response';
import { YellowCardStatusEnum } from '../../core/enums/yellow-card-status.enum';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-yellow-cards-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class YellowCardsAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  isEditMode = false;
  yellowCardId: number | null = null;
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
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.initializeForm();
    this.statusOptions = this.sharedService.getTypeList(YellowCardStatusEnum);
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    if (this.config.data) {
      this.isEditMode = true;
      this.yellowCardId = this.config.data.ID;
      this.form.patchValue(this.config.data);
    } else {
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.yellowCardId = +params['id'];
          this.loadYellowCardData(this.yellowCardId);
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
      NationalID: ['', [Validators.required, Validators.pattern(/^[0-9]{14}$/)]],
      ExpiryDate: ['', Validators.required],
      MonthlyLimit: [0, [Validators.required, Validators.min(0)]],
      DailyLimit: [0, [Validators.required, Validators.min(0)]],
      Balance: [0, [Validators.required, Validators.min(0)]],
      Status: [null, Validators.required],
      MonthlyUsed: [0],
      DailyUsed: [0],
      Notes: ['']
    });
  }

  private loadYellowCardData(id: number): void {
    const url = this.constant.SRM_API_ENDPOINT + `YellowCards/GetById?id=${id}`;
    this.sharedService.confirm(url, '', 'Get').subscribe({
      next: (response: YellowCardModel) => {
        if (response) {
          this.form.patchValue(response);
        }
      },
      error: (error) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load yellow card data' 
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

    const yellowCardData: YellowCardModel = {
      ...this.form.value,
      ID: this.yellowCardId || 0,
      CreatedBy: this.isEditMode ? undefined : JSON.parse(localStorage.getItem('userId')),
      CreatedDateTime: this.isEditMode ? undefined : this.sharedService.getDateTime(new Date()),
      ModifiedBy: this.isEditMode ? JSON.parse(localStorage.getItem('userId')) : undefined,
      ModifiedDateTime: this.isEditMode ? this.sharedService.getDateTime(new Date()) : undefined
    };

    if (this.isEditMode) {
      const url = this.constant.SRM_API_ENDPOINT + 'YellowCards/Update';
      this.sharedService.Update(url, yellowCardData).subscribe({
        next: (response: ResponseModel) => {
          if (response.response) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: response.message || 'Yellow card updated successfully'
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
            detail: 'An error occurred while updating the yellow card' 
          });
        }
      });
    } else {
      const url = this.constant.SRM_API_ENDPOINT + 'YellowCards/Add';
      this.sharedService.Create(url, yellowCardData).subscribe({
        next: (response: ResponseModel) => {
          if (response.response) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: response.message || 'Yellow card added successfully'
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
            detail: 'An error occurred while adding the yellow card' 
          });
        }
      });
    }
  }

  onCancel(): void {
    if (this.ref) {
      this.ref.close(false);
    } else {
      this.router.navigate(['/pages/yellow-cards']);
    }
  }
}
