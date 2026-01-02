import { Component, Input, HostBinding, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-detail-item',
  templateUrl: './detail-item.component.html',
  styleUrls: ['./detail-item.component.scss']
})
export class DetailItemComponent implements AfterViewInit, OnChanges {
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
    debugger
    if (changes['value']) {
      this.cdr.markForCheck();
    }
  }

  ngAfterViewInit() {
    // Check if there's any projected content
    if (this.valueContainer && this.valueContainer.nativeElement) {
      const children = this.valueContainer.nativeElement.childNodes;
      // Check if there are any non-comment, non-empty text nodes
      this.hasProjectedContent = Array.from(children).some((node: any) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          return true;
        }
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent?.trim().length > 0;
        }
        return false;
      });
      this.cdr.detectChanges();
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
