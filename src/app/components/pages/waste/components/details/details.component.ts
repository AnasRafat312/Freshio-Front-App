import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { WasteOrderModel, WasteOrderItemModel, WasteType } from 'src/app/shared/model/freshio/waste.model';

@Component({
  selector: 'app-waste-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class WasteDetailsComponent implements OnInit, OnDestroy {
  waste: WasteOrderModel;
  languageFactor = 'en';
  languageSubscription: Subscription;
  
  // Expose WasteType enum to template
  readonly WasteType = WasteType;

  constructor(
    private language: LanguagesService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    if (this.config.data) {
      this.waste = this.config.data;
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  getLabel(enLabel: string, arLabel: string): string {
    return this.languageFactor === 'en' ? enLabel : arLabel;
  }

  isItemOrMaterial(item: WasteOrderItemModel): boolean {
    return item.WasteType === WasteType.Items || item.WasteType === WasteType.Materials;
  }

  isDelivery(item: WasteOrderItemModel): boolean {
    return item.WasteType === WasteType.Delivery;
  }

  getItemDisplayName(item: WasteOrderItemModel): string {
    if (this.isDelivery(item)) {
      return this.getLabel('Delivery Waste', 'هالك توصيل');
    }
    return item.ItemName || '-';
  }

  onClose(): void {
    this.ref.close();
  }
}
