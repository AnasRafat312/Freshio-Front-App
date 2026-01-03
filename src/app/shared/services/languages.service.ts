import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PrimeNGConfig } from 'primeng/api';
@Injectable({
  providedIn: 'root'
})
export class LanguagesService {

  private currentLanguageSubject = new BehaviorSubject<string>('en');
  currentLanguage = this.currentLanguageSubject.asObservable();

  constructor(private primengConfig: PrimeNGConfig) {
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
    // Update the dir attribute for RTL support
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    // Update the current language subject, which components can subscribe to.
    this.currentLanguageSubject.next(language);

    // Set PrimeNG translations
    this.setPrimeNGTranslations(language);
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

  private setPrimeNGTranslations(language: string) {
    if (language === 'ar') {
      this.primengConfig.setTranslation({
        startsWith: 'يبدأ بـ',
        contains: 'يحتوي على',
        notContains: 'لا يحتوي على',
        endsWith: 'ينتهي بـ',
        equals: 'يساوي',
        notEquals: 'لا يساوي',
        noFilter: 'بدون فلتر',
        lt: 'أقل من',
        lte: 'أقل من أو يساوي',
        gt: 'أكبر من',
        gte: 'أكبر من أو يساوي',
        is: 'يكون',
        isNot: 'لا يكون',
        before: 'قبل',
        after: 'بعد',
        dateIs: 'التاريخ هو',
        dateIsNot: 'التاريخ ليس',
        dateBefore: 'التاريخ قبل',
        dateAfter: 'التاريخ بعد',
        clear: 'مسح',
        apply: 'تطبيق',
        matchAll: 'مطابقة الكل',
        matchAny: 'مطابقة أي',
        addRule: 'إضافة قاعدة',
        removeRule: 'حذف قاعدة',
        accept: 'نعم',
        reject: 'لا',
        choose: 'اختر',
        upload: 'رفع',
        cancel: 'إلغاء',
        dayNames: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
        dayNamesShort: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
        dayNamesMin: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
        monthNames: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        monthNamesShort: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        today: 'اليوم',
        weekHeader: 'أسبوع',
        weak: 'ضعيف',
        medium: 'متوسط',
        strong: 'قوي',
        passwordPrompt: 'أدخل كلمة المرور',
        emptyMessage: 'لا توجد نتائج',
        emptyFilterMessage: 'لا توجد نتائج',
        selectionMessage: '{0} عناصر محددة',
        emptySelectionMessage: 'لا يوجد عنصر محدد',
        aria: {
          trueLabel: 'صحيح',
          falseLabel: 'خطأ',
          nullLabel: 'غير محدد',
          pageLabel: 'صفحة',
          firstPageLabel: 'الصفحة الأولى',
          lastPageLabel: 'الصفحة الأخيرة',
          nextPageLabel: 'الصفحة التالية',
          previousPageLabel: 'الصفحة السابقة'
        }
      });
    } else {
      // Reset to default English translations
      this.primengConfig.setTranslation({});
    }
  }
}
