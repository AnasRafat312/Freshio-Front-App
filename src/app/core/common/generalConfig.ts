import { Component } from '@angular/core';
import { LanguageService } from '../languageLocalization/language.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class GeneralConfig  {
  constructor(protected languageService: LanguageService) {

   }
  translate(key: string): string {
    return this.languageService.getTranslation(key);
  }
}
