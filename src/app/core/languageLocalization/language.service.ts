// language.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguage = 'ar';
  private translations: any = {}; // Store loaded translations here

  constructor(private http: HttpClient) {}

  setLanguage(lang: string): void {
    this.currentLanguage = lang;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  loadTranslations(): Promise<any> {
    return this.http
      .get(`assets/i18n/${this.currentLanguage}.json`)
      .toPromise()
      .then((translations) => {
        this.translations = translations;
      });
  }

  getTranslation(key: string): string {
    const translation = this.translations[key];
    return translation || key;
  }
}


