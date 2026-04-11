import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Constant } from 'src/app/core/constants/constant';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { TransactionsService } from '../../services/transactions.service';
import { TransactionsStore } from '../../store/transactions.store';
import { 
  TransactionCreateRequest, 
  TransactionPreviewRequest,
  EntitySelectionModel,
  TransactionAttachmentUpload
} from '../../core/models/transaction.model';
import { AdjustmentPreviewComponent } from '../adjustment-preview/adjustment-preview.component';
import { AccountTypeEnum } from '../../core/enums/account-type.enum';
import { ChannelTypeEnum } from '../../core/enums/channel-type.enum';
import { TransactionTypeEnum } from '../../core/enums/transaction-type.enum';
import { ResponseModel } from 'src/app/shared/model/response';
import { TransactionTypeConfigHelper } from '../../core/helpers/transaction-type-config.helper';

/**
 * Updated Transaction Add/Edit Component
 * Supports Sender/Receiver entities, phone numbers, internal transfers, and attachments
 */
@Component({
  selector: 'app-transactions-add-edit',
  standalone: true,
  imports: [CommonModule, SharedModule, AdjustmentPreviewComponent],
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss']
})
export class TransactionsAddEditComponent implements OnInit, OnDestroy {
  form: FormGroup;
  languageFactor = 'en';
  languageSubscription: Subscription;
  
  // Dropdown Options
  entityTypeOptions = [];
  transactionTypeOptions = [];
  channelOptions = [];
  
  // Filtered options based on transaction type
  senderEntityTypeOptions = [];
  receiverEntityTypeOptions = [];
  
  // Entity lists
  senderEntityOptions: EntitySelectionModel[] = [];
  receiverEntityOptions: EntitySelectionModel[] = [];
  
  // UI State based on transaction type
  showSenderSection: boolean = false;
  showReceiverSection: boolean = false;
  senderEntityTypeFixed: boolean = false;
  senderPhoneRequired: boolean = false;
  receiverPhoneRequired: boolean = false;
  receiverEntityRequired: boolean = false;
  
  // Loading states
  isLoadingSenderEntities: boolean = false;
  isLoadingReceiverEntities: boolean = false;
  
  // Attachments
  pendingAttachments: TransactionAttachmentUpload[] = [];
  maxAttachments: number = 5;
  maxFileSize: number = 5 * 1024 * 1024; // 5MB
  allowedFileTypes: string[] = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private language: LanguagesService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private constant: Constant,
    private transactionsService: TransactionsService,
    private transactionsStore: TransactionsStore,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.initializeForm();
    this.initializeDropdownOptions();
    
    // React to store changes
    effect(() => {
      this.senderEntityOptions = this.transactionsStore.availableSenderEntities();
      this.receiverEntityOptions = this.transactionsStore.availableReceiverEntities();
      this.pendingAttachments = this.transactionsStore.pendingAttachments();
    });
  }

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    // Setup form value change listeners
    this.setupFormListeners();
    
    // Reset form state in store
    this.transactionsStore.resetFormState();
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  /**
   * Initialize form with Sender/Receiver structure
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      // Transaction Type & Amount
      TransactionType: [null, Validators.required],
      Amount: [0, [Validators.required, Validators.min(1)]],
      
      // Sender Section
      SenderEntityType: [null],
      SenderEntityId: [null],
      SenderPhoneNumber: [''],
      
      // Receiver Section
      ReceiverEntityType: [null],
      ReceiverEntityId: [null],
      ReceiverPhoneNumber: [''],
      
      // Channel
      Channel: [null, Validators.required],
      
      // Description
      Description: [''],
      ReferenceNumber: [''],
      
      // Adjustments
      AdjustmentIds: [[]]
    });
  }

  /**
   * Initialize dropdown options from enums
   */
  private initializeDropdownOptions(): void {
    this.entityTypeOptions = this.sharedService.getTypeList(AccountTypeEnum);
    this.transactionTypeOptions = this.sharedService.getTypeList(TransactionTypeEnum);
    this.channelOptions = this.sharedService.getTypeList(ChannelTypeEnum);
  }

  /**
   * Setup form value change listeners
   */
  private setupFormListeners(): void {
    // Listen to TransactionType changes - THIS IS THE KEY LISTENER
    this.form.get('TransactionType')?.valueChanges.subscribe(transactionType => {
      if (transactionType) {
        this.onTransactionTypeChange(transactionType);
      }
    });

    // Listen to SenderEntityType changes
    this.form.get('SenderEntityType')?.valueChanges.subscribe(entityType => {
      if (entityType) {
        debugger
        this.loadSenderEntitiesByType(entityType);
        this.form.patchValue({ SenderEntityId: null }, { emitEvent: false });
      } else {
        this.senderEntityOptions = [];
        this.transactionsStore.clearAvailableSenderEntities();
      }
    });

    // Listen to ReceiverEntityType changes
    this.form.get('ReceiverEntityType')?.valueChanges.subscribe(entityType => {
      if (entityType) {
        this.loadReceiverEntitiesByType(entityType);
        this.form.patchValue({ ReceiverEntityId: null }, { emitEvent: false });
      } else {
        this.receiverEntityOptions = [];
        this.transactionsStore.clearAvailableReceiverEntities();
      }
    });

    // Listen to SenderEntityId changes to auto-fill phone number
    this.form.get('SenderEntityId')?.valueChanges.subscribe(entityId => {
      if (entityId) {
        this.autoFillSenderPhoneNumber(entityId);
      }
    });

    // Listen to ReceiverEntityId changes to auto-fill phone number
    this.form.get('ReceiverEntityId')?.valueChanges.subscribe(entityId => {
      if (entityId) {
        this.autoFillReceiverPhoneNumber(entityId);
      }
    });

    // Listen to changes that affect preview calculation
    this.form.valueChanges
      .pipe(
        debounceTime(600),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.calculatePreviewIfReady();
      });
  }

  /**
   * Handle transaction type change
   * This configures the entire form based on transaction type
   */
  private onTransactionTypeChange(transactionType: TransactionTypeEnum): void {
    const config = TransactionTypeConfigHelper.getConfig(transactionType);
    
    // Update UI state
    this.showSenderSection = config.showSenderSection;
    this.showReceiverSection = config.showReceiverSection;
    this.senderEntityTypeFixed = config.senderEntityTypeFixed;
    this.senderPhoneRequired = config.senderPhoneRequired;
    this.receiverPhoneRequired = config.receiverPhoneRequired;
    this.receiverEntityRequired = config.receiverEntityRequired;
    
    // Filter entity type options
    this.senderEntityTypeOptions = TransactionTypeConfigHelper.getFilteredEntityTypeOptions(
      transactionType, 
      true, 
      this.entityTypeOptions
    );
    this.receiverEntityTypeOptions = TransactionTypeConfigHelper.getFilteredEntityTypeOptions(
      transactionType, 
      false, 
      this.entityTypeOptions
    );
    
    // Configure form validators
    this.configureSenderValidators(config);
    this.configureReceiverValidators(config);
    
    // If sender entity type is fixed, set it automatically
    if (config.senderEntityTypeFixed && config.fixedSenderEntityType) {
      this.form.patchValue({ 
        SenderEntityType: config.fixedSenderEntityType 
      }, { emitEvent: true });
    } else {
      this.form.patchValue({ 
        SenderEntityType: null,
        SenderEntityId: null,
        SenderPhoneNumber: ''
      }, { emitEvent: false });
    }
    
    // Reset receiver fields
    this.form.patchValue({ 
      ReceiverEntityType: null,
      ReceiverEntityId: null,
      ReceiverPhoneNumber: ''
    }, { emitEvent: false });
    
    // Store current transaction type
    this.transactionsStore.setCurrentTransactionType(transactionType);
  }

  /**
   * Configure sender field validators based on transaction type
   */
  private configureSenderValidators(config: any): void {
    const senderEntityTypeControl = this.form.get('SenderEntityType');
    const senderEntityIdControl = this.form.get('SenderEntityId');
    const senderPhoneControl = this.form.get('SenderPhoneNumber');
    
    if (config.showSenderSection) {
      // Set sender entity validators based on senderEntityRequired
      if (config.senderEntityRequired) {
        senderEntityTypeControl?.setValidators(Validators.required);
        senderEntityIdControl?.setValidators(Validators.required);
      } else {
        senderEntityTypeControl?.clearValidators();
        senderEntityIdControl?.clearValidators();
      }
      
      // Set phone validator independently
      if (config.senderPhoneRequired) {
        senderPhoneControl?.setValidators([Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]);
      } else {
        senderPhoneControl?.clearValidators();
      }
    } else {
      senderEntityTypeControl?.clearValidators();
      senderEntityIdControl?.clearValidators();
      senderPhoneControl?.clearValidators();
    }
    
    senderEntityTypeControl?.updateValueAndValidity();
    senderEntityIdControl?.updateValueAndValidity();
    senderPhoneControl?.updateValueAndValidity();
  }

  /**
   * Configure receiver field validators based on transaction type
   */
  private configureReceiverValidators(config: any): void {
    const receiverEntityTypeControl = this.form.get('ReceiverEntityType');
    const receiverEntityIdControl = this.form.get('ReceiverEntityId');
    const receiverPhoneControl = this.form.get('ReceiverPhoneNumber');
    
    if (config.showReceiverSection && config.receiverEntityRequired) {
      receiverEntityTypeControl?.setValidators(Validators.required);
      receiverEntityIdControl?.setValidators(Validators.required);
    } else {
      receiverEntityTypeControl?.clearValidators();
      receiverEntityIdControl?.clearValidators();
    }
    
    if (config.receiverPhoneRequired) {
      receiverPhoneControl?.setValidators([Validators.required]);
    } else {
      receiverPhoneControl?.clearValidators();
    }
    
    receiverEntityTypeControl?.updateValueAndValidity();
    receiverEntityIdControl?.updateValueAndValidity();
    receiverPhoneControl?.updateValueAndValidity();
  }

  /**
   * Load sender entities by type
   */
  private loadSenderEntitiesByType(entityType: AccountTypeEnum): void {
    this.isLoadingSenderEntities = true;
    this.transactionsService.getAccountsByType(entityType).subscribe({
      next: (response: ResponseModel) => {
        if (response?.Success && response?.Data) {
          debugger
          const entities = this.transactionsService.transformToEntitySelection(
            entityType, 
            response.Data
          );
          this.transactionsStore.setAvailableSenderEntities(entities);
        }
        this.isLoadingSenderEntities = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load sender entities'
        });
        this.isLoadingSenderEntities = false;
      }
    });
  }

  /**
   * Load receiver entities by type
   */
  private loadReceiverEntitiesByType(entityType: AccountTypeEnum): void {
    this.isLoadingReceiverEntities = true;
    this.transactionsService.getAccountsByType(entityType).subscribe({
      next: (response: ResponseModel) => {
        if (response?.Success && response?.Data) {
          const entities = this.transactionsService.transformToEntitySelection(
            entityType, 
            response.Data
          );
          this.transactionsStore.setAvailableReceiverEntities(entities);
        }
        this.isLoadingReceiverEntities = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load receiver entities'
        });
        this.isLoadingReceiverEntities = false;
      }
    });
  }

  /**
   * Auto-fill sender phone number from selected entity
   */
  private autoFillSenderPhoneNumber(entityId: number): void {
    const entity = this.senderEntityOptions.find(e => e.Id === entityId);
    if (entity && entity.PhoneNumber) {
      this.form.patchValue({ 
        SenderPhoneNumber: entity.PhoneNumber 
      }, { emitEvent: false });
    }
  }

  /**
   * Auto-fill receiver phone number from selected entity
   */
  private autoFillReceiverPhoneNumber(entityId: number): void {
    const entity = this.receiverEntityOptions.find(e => e.Id === entityId);
    if (entity && entity.PhoneNumber) {
      this.form.patchValue({ 
        ReceiverPhoneNumber: entity.PhoneNumber 
      }, { emitEvent: false });
    }
  }

  /**
   * Calculate preview if all required fields are filled
   */
  private calculatePreviewIfReady(): void {
    const formValue = this.form.value;
    
    // Check if all required fields for preview calculation are present
    if (!formValue.TransactionType || 
        !formValue.Amount || 
        formValue.Amount <= 0 ||
        !formValue.SenderEntityType || 
        !formValue.SenderEntityId || 
        !formValue.Channel) {
      // Clear preview if required fields are missing
      this.transactionsStore.clearTransactionPreview();
      return;
    }

    // If receiver entity is required, check it
    const config = TransactionTypeConfigHelper.getConfig(formValue.TransactionType);
    if (config.receiverEntityRequired) {
      if (!formValue.ReceiverEntityType || !formValue.ReceiverEntityId) {
        this.transactionsStore.clearTransactionPreview();
        return;
      }
    }

    // Validate different entities for InternalTransfer
    if (formValue.TransactionType === TransactionTypeEnum.InternalTransfer) {
      if (!this.transactionsService.validateDifferentEntities(
        formValue.SenderEntityType,
        formValue.SenderEntityId,
        formValue.ReceiverEntityType,
        formValue.ReceiverEntityId
      )) {
        this.transactionsStore.clearTransactionPreview();
        return;
      }
    }

    this.calculatePreview();
  }

  /**
   * Calculate transaction preview with adjustments from backend
   */
  private calculatePreview(): void {
    const formValue = this.form.value;
  if(!formValue?.AdjustmentIds?.length) return;
    
    const request: TransactionPreviewRequest = {
      TransactionType: formValue.TransactionType,
      BaseAmount: formValue.Amount,
      SenderEntityType: formValue.SenderEntityType,
      SenderEntityId: formValue.SenderEntityId,
      Channel: formValue.Channel,
      ReceiverEntityType: formValue.ReceiverEntityType,
      ReceiverEntityId: formValue.ReceiverEntityId,
      AdjustmentIds: formValue.AdjustmentIds || []
    };

    this.transactionsStore.setPreviewLoading(true);
    this.transactionsService.calculateTransactionPreview(request).subscribe({
      next: (response) => {
        // Service already stored data in TransactionsStore via tap operator
        this.transactionsStore.setPreviewLoading(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to calculate transaction preview'
        });
        this.transactionsStore.setPreviewLoading(false);
      }
    });
  }

  /**
   * Handle file selection for attachments
   */
  async onFileSelect(event: any): Promise<void> {
    const files: FileList = event.target.files;
    
    if (!files || files.length === 0) {
      return;
    }

    // Check max attachments limit
    if (this.pendingAttachments.length + files.length > this.maxAttachments) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: `Maximum ${this.maxAttachments} attachments allowed`
      });
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!this.allowedFileTypes.includes(file.type)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: `File type ${file.type} is not allowed`
        });
        continue;
      }
      
      // Validate file size
      if (file.size > this.maxFileSize) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: `File ${file.name} exceeds maximum size of 5MB`
        });
        continue;
      }

      try {
        const base64Data = await this.transactionsService.convertFileToBase64(file);
        const attachment: TransactionAttachmentUpload = {
          FileName: file.name,
          FileType: file.type,
          FileSize: file.size,
          FileData: base64Data
        };
        
        this.transactionsStore.addPendingAttachment(attachment);
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to process file ${file.name}`
        });
      }
    }
  }

  /**
   * Remove attachment from pending list
   */
  removeAttachment(fileName: string): void {
    this.transactionsStore.removePendingAttachment(fileName);
  }

  /**
   * Submit transaction
   */
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

    const formValue = this.form.value;
    
    // Validate different entities for InternalTransfer
    if (formValue.TransactionType === TransactionTypeEnum.InternalTransfer) {
      if (!this.transactionsService.validateDifferentEntities(
        formValue.SenderEntityType,
        formValue.SenderEntityId,
        formValue.ReceiverEntityType,
        formValue.ReceiverEntityId
      )) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Sender and receiver cannot be the same entity for internal transfers'
        });
        return;
      }
    }
    
    const transactionRequest: TransactionCreateRequest = {
      TransactionType: formValue.TransactionType,
      Amount: formValue.Amount,
      SenderEntityType: formValue.SenderEntityType,
      SenderEntityId: formValue.SenderEntityId,
      SenderPhoneNumber: formValue.SenderPhoneNumber || undefined,
      ReceiverEntityType: formValue.ReceiverEntityType || undefined,
      ReceiverEntityId: formValue.ReceiverEntityId || undefined,
      ReceiverPhoneNumber: formValue.ReceiverPhoneNumber || undefined,
      Channel: formValue.Channel,
      Description: formValue.Description,
      ReferenceNumber: formValue.ReferenceNumber || undefined,
      AdjustmentIds: formValue.AdjustmentIds || [],
      Attachments: this.pendingAttachments.length > 0 ? this.pendingAttachments : undefined,
    };

    this.transactionsService.createTransaction(transactionRequest).subscribe({
      next: (response: ResponseModel) => {
        if (response?.Success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.Message || 'Transaction created successfully'
          });
          
          // Clear pending attachments
          this.transactionsStore.clearPendingAttachments();
          
          this.ref.close(response?.Data);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.Message || 'Transaction failed'
          });
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.error?.Message || 'An error occurred while creating the transaction'
        });
      }
    });
  }

  /**
   * Cancel and close dialog
   */
  onCancel(): void {
    this.transactionsStore.clearPendingAttachments();
    
    if (this.ref) {
      this.ref.close(false);
    } else {
      this.router.navigate(['/pages/transactions']);
    }
  }

  /**
   * Helper method to check if field has required validator
   */
  hasRequiredValidator(form: FormGroup,controlName: string): boolean {
    const control = form.get(controlName);
    if (control && control.validator) {
      const validator = control.validator({} as any);
      return validator && validator['required'];
    }
    return false;
  }

  /**
   * Get selected sender entity display name
   */
  getSelectedSenderEntityDisplay(): string {
    const entityId = this.form.get('SenderEntityId')?.value;
    if (!entityId) return '';
    
    const entity = this.senderEntityOptions.find(e => e.Id === entityId);
    return entity ? entity.DisplayName : '';
  }

  /**
   * Get selected receiver entity display name
   */
  getSelectedReceiverEntityDisplay(): string {
    const entityId = this.form.get('ReceiverEntityId')?.value;
    if (!entityId) return '';
    
    const entity = this.receiverEntityOptions.find(e => e.Id === entityId);
    return entity ? entity.DisplayName : '';
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
