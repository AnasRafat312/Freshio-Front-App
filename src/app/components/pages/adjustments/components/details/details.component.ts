import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SharedModule } from 'src/app/shared/shared.module';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { AdjustmentModel } from '../../core/models/adjustment.model';
import { AdjustmentType } from '../../core/enums/adjustment-type.enum';
import { AdjustmentDirection } from '../../core/enums/adjustment-direction.enum';
import { AdjustmentAppliesTo } from '../../core/enums/adjustment-applies-to.enum';
import { CalculationType } from '../../core/enums/calculation-type.enum';

@Component({
  selector: 'app-adjustments-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class AdjustmentsDetailsComponent implements OnInit {
  adjustmentData: AdjustmentModel;
  languageFactor = 'en';
  adjustmentTypeLabel = '';
  directionLabel = '';
  appliesToLabel = '';
  calculationTypeLabel = '';

  constructor(
    public config: DynamicDialogConfig,
    private language: LanguagesService
  ) {
    this.adjustmentData = this.config.data;
  }

  ngOnInit(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
      this.setLabels();
    });
  }

  setLabels(): void {
    // Adjustment Type
    switch (this.adjustmentData.AdjustmentType) {
      case AdjustmentType.Tax:
        this.adjustmentTypeLabel = this.languageFactor === 'en' ? 'Tax' : 'ضريبة';
        break;
      case AdjustmentType.Fee:
        this.adjustmentTypeLabel = this.languageFactor === 'en' ? 'Fee' : 'رسوم';
        break;
      case AdjustmentType.Cashback:
        this.adjustmentTypeLabel = this.languageFactor === 'en' ? 'Cashback' : 'استرداد نقدي';
        break;
      case AdjustmentType.Commission:
        this.adjustmentTypeLabel = this.languageFactor === 'en' ? 'Commission' : 'عمولة';
        break;
      case AdjustmentType.Discount:
        this.adjustmentTypeLabel = this.languageFactor === 'en' ? 'Discount' : 'خصم';
        break;
    }

    // Direction
    switch (this.adjustmentData.Direction) {
      case AdjustmentDirection.Increase:
        this.directionLabel = this.languageFactor === 'en' ? 'Increase' : 'زيادة';
        break;
      case AdjustmentDirection.Decrease:
        this.directionLabel = this.languageFactor === 'en' ? 'Decrease' : 'نقصان';
        break;
    }

    // Applies To
    switch (this.adjustmentData.AppliesTo) {
      case AdjustmentAppliesTo.Sender:
        this.appliesToLabel = this.languageFactor === 'en' ? 'Sender' : 'المرسل';
        break;
      case AdjustmentAppliesTo.Receiver:
        this.appliesToLabel = this.languageFactor === 'en' ? 'Receiver' : 'المستقبل';
        break;
      case AdjustmentAppliesTo.System:
        this.appliesToLabel = this.languageFactor === 'en' ? 'System' : 'النظام';
        break;
    }

    // Calculation Type
    switch (this.adjustmentData.CalculationType) {
      case CalculationType.Fixed:
        this.calculationTypeLabel = this.languageFactor === 'en' ? 'Fixed' : 'ثابت';
        break;
      case CalculationType.Percentage:
        this.calculationTypeLabel = this.languageFactor === 'en' ? 'Percentage' : 'نسبة مئوية';
        break;
    }
  }
}
