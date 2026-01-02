import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LanguagesService } from 'src/app/shared/services/languages.service';

@Component({
  selector: 'app-detail-header',
  templateUrl: './detail-header.component.html',
  styleUrls: ['./detail-header.component.scss']
})
export class DetailHeaderComponent {
  @Input() icon: string = 'pi pi-info-circle';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showBackButton: boolean = false;
  @Input() isSticky: boolean = false;
  @Output() onBack = new EventEmitter<void>();
  languageFactor: string = 'en';
  handleBack() {
    this.onBack.emit();
  }
  constructor(private languageService: LanguagesService){
    languageService.currentLanguage.subscribe((language) => {
      this.languageFactor = language;
    });
  }
}
