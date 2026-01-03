import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/shared/shared.module';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { TransactionFeeModel } from '../../core/models/transaction-fee.model';
import { FeeTypeEnum } from '../../core/enums/fee-type.enum';

@Component({
  selector: 'app-transaction-fees-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class TransactionFeesDetailsComponent implements OnInit {
  feeData: TransactionFeeModel;
  languageFactor = 'en';
  feeTypeLabel = '';

  constructor(
    public config: DynamicDialogConfig,
    private language: LanguagesService
  ) {
    this.feeData = this.config.data;
  }

  ngOnInit(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.setFeeTypeLabel();
    });
  }

  setFeeTypeLabel(): void {
    if (this.feeData.Type === FeeTypeEnum.Percentage) {
      this.feeTypeLabel = this.languageFactor === 'en' ? 'Percentage' : 'نسبة مئوية';
    } else if (this.feeData.Type === FeeTypeEnum.Fixed) {
      this.feeTypeLabel = this.languageFactor === 'en' ? 'Fixed' : 'ثابت';
    }
  }
}
