import { Component } from '@angular/core';
import { LanguagesService } from '../../services/languages.service';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss'],
})
export class LanguagesComponent {
  languageFactor = 'en'
  constructor(private languageService: LanguagesService) {
    this.languageFactor = this.languageService.getCurrentLanguage()
  }

  setLanguage(language: string) {
    sessionStorage.setItem('lang',language)
    this.languageService.setLanguage(language);
    this.languageFactor = language
  }
}
