import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LanguagesService } from 'src/app/shared/services/languages.service';

@Pipe({
  name: 'localizedDate'
})
export class LocalizedDatePipe implements PipeTransform {
  constructor(private languageService: LanguagesService) {}

  transform(value: any): string {
    if (!value) return '';

    const datePipe = new DatePipe('en-US');
    const currentLang = this.languageService.getCurrentLanguage();
    
    // Format based on language: yyyy-MM-dd for EN, dd-MM-yyyy for AR
    const format = currentLang === 'ar' ? 'dd-MM-yyyy' : 'yyyy-MM-dd';
    
    return datePipe.transform(value, format) || '';
  }
}
