import { Component, Input, HostBinding, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-detail-item',
  templateUrl: './detail-item.component.html',
  styleUrls: ['./detail-item.component.scss']
})
export class DetailItemComponent implements OnChanges {
  @Input() icon: string = 'pi pi-info-circle';
  @Input() label: string = '';
  @Input() value: any;
  @Input() valueType: 'text' | 'date' | 'amount' | 'number' = 'text';
  @Input() fullWidth: boolean = false;
  @Input() customClass: string = '';
  @Input() currencySymbol: string = '';
  @Input() minFractionDigits: number = 0;
  @Input() maxFractionDigits: number = 4;
  @Input() dateFormat: string = 'yyyy-MM-dd'; // Will be overridden by pipe based on language

  @ViewChild('valueContainer', { static: false }) valueContainer!: ElementRef;
  
  hasProjectedContent: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    // Trigger change detection when value input changes
    if (changes['value']) {
      //this.cdr.detectChanges();
    }
  }

  @HostBinding('class') get hostClasses(): string {
    if (this.customClass) {
      return this.customClass + ' mb-3';
    }
    if (this.fullWidth) {
      return 'col-12 mb-3';
    }
    return 'col mb-3';
  }
}
