import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { ItemModel } from 'src/app/shared/model/freshio/item.model';

@Component({
  selector: 'app-items-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class ItemsDetailsComponent implements OnInit {
  item: ItemModel | null = null;
  languageFactor = 'en';

  constructor(
    public config: DynamicDialogConfig,
    private language: LanguagesService
  ) {}

  ngOnInit(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    if (this.config.data) {
      this.item = this.config.data;
    }
  }

  getLabel(enLabel: string, arLabel: string): string {
    return this.languageFactor === 'en' ? enLabel : arLabel;
  }
}
