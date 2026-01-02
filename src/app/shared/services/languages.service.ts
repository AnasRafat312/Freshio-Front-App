import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class LanguagesService {

  private currentLanguageSubject = new BehaviorSubject<string>('en');
  currentLanguage = this.currentLanguageSubject.asObservable();

  constructor() {
    // You can initialize the language from local storage or other sources.
    // For this example, we start with 'en' (English).
    const savedLanguage = sessionStorage.getItem('lang');
    if (savedLanguage) {
      this.setLanguage(savedLanguage);
    }
  }

  setLanguage(language: string) {
    // Save the selected language to local storage or any other storage mechanism.
    sessionStorage.setItem('lang', language);
    // Update the lang attribute on the html tag.
    document.documentElement.lang = language;
    // Update the current language subject, which components can subscribe to.
    this.currentLanguageSubject.next(language);

    this.updateFontStyle(language);
  }
  private updateFontStyle(language: string) {

    const styleElementId = 'dynamic-font-style';
    let styleElement = document.getElementById(styleElementId);
    let textItem = document.querySelector('.p-inputtext');

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleElementId;
      document.head.appendChild(styleElement);
    }

    if (language === 'ar') {
      styleElement.innerHTML = `
        * ,
      .p-inputtext,
      .p-component,
      .mat-mdc-card-subtitle~.mat-mdc-card-title,
      .mat-mdc-card-title~.mat-mdc-card-subtitle,
      .mat-mdc-card-header .mat-mdc-card-header-text .mat-mdc-card-title,
      .mat-mdc-card-header .mat-mdc-card-header-text .mat-mdc-card-subtitle,
      .mat-mdc-card-title-group .mat-mdc-card-title,
      .mat-mdc-card-title-group .mat-mdc-card-subtitle,
      h1, h2, h3, h4, h5, h6
        {
          font-family: "GE SS Two",-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        }
        .p-dialog .p-dialog-header,.mat-mdc-card-header {
            direction: rtl
        }
      `;
    } else {
      styleElement.innerHTML = '';
    }
  }
  getCurrentLanguage() {
    return this.currentLanguageSubject.value;
  }
}
