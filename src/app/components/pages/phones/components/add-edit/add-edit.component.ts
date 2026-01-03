import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Constant } from 'src/app/core/constants/constant';
import { PhoneModel } from '../../core/models/phone.model';
import { ResponseModel } from 'src/app/shared/model/response';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-phones-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class PhonesAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  isEditMode = false;
  phoneId: number | null = null;
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
      this.phoneId = this.config.data.ID;
      this.form.patchValue(this.config.data);
    } else {
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.phoneId = +params['id'];
          this.loadPhoneData(this.phoneId);
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
      Name: ['', [Validators.required, Validators.minLength(3)]],
      PhoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]]
    });
  }

  private loadPhoneData(id: number): void {
    const url = this.constant.SRM_API_ENDPOINT + `Phones/GetById?id=${id}`;
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
          detail: 'Failed to load phone data' 
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

    const phoneData: PhoneModel = {
      ...this.form.value,
      ID: this.phoneId || 0,
      CreatedBy: this.isEditMode ? undefined : JSON.parse(localStorage.getItem('userId')),
      CreatedDateTime: this.isEditMode ? undefined : this.sharedService.getDateTime(new Date()),
      ModifiedBy: this.isEditMode ? JSON.parse(localStorage.getItem('userId')) : undefined,
      ModifiedDateTime: this.isEditMode ? this.sharedService.getDateTime(new Date()) : undefined
    };

    if (this.isEditMode) {
      const url = this.constant.SRM_API_ENDPOINT + 'Phones/Update';
      this.sharedService.Update(url, phoneData).subscribe({
        next: (response: ResponseModel) => {
          if (response.response) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: response.message || 'Phone updated successfully'
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
            detail: 'An error occurred while updating the phone' 
          });
        }
      });
    } else {
      const url = this.constant.SRM_API_ENDPOINT + 'Phones/Add';
      this.sharedService.Create(url, phoneData).subscribe({
        next: (response: ResponseModel) => {
          if (response.response) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: response.message || 'Phone added successfully'
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
            detail: 'An error occurred while adding the phone' 
          });
        }
      });
    }
  }

  onCancel(): void {
    if (this.ref) {
      this.ref.close(false);
    } else {
      this.router.navigate(['/pages/phones']);
    }
  }
}
