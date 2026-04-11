import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { BoxesService } from '../../services/boxes.service';
import { BoxDetailsDto } from '../../core/models/box.model';
import { MessageService } from 'primeng/api';
import { ResponseModel } from 'src/app/shared/model/response';

@Component({
  selector: 'app-breakdown-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class BreakdownDetailsComponent implements OnInit, OnDestroy {
  languageFactor = 'en';
  languageSubscription: Subscription;
  boxDetails: BoxDetailsDto | null = null;
  loading = false;
  boxId: number;

  constructor(
    private language: LanguagesService,
    private boxesService: BoxesService,
    private messageService: MessageService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    if (this.config.data && this.config.data.Id) {
      this.boxId = this.config.data.Id;
      this.loadBoxDetails();
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  loadBoxDetails(): void {
    this.loading = true;
    this.boxesService.getById(this.boxId).subscribe({
      next: (response: ResponseModel) => {
        if (response?.Success && response?.Data) {
          this.boxDetails = response.Data;
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.languageFactor === 'en' ? 'Failed to load box details' : 'فشل تحميل تفاصيل الصندوق'
        });
        this.loading = false;
      }
    });
  }

  getTotalAmount(): number {
    if (!this.boxDetails?.Items) return 0;
    return this.boxDetails.Items.reduce((sum, item) => sum + item.Amount, 0);
  }

  onClose(): void {
    this.ref.close();
  }
}
