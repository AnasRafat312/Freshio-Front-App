import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appGenerateHTML]'
})
export class GenerateHTMLDirective {

  @Input() htmlContent: string;

  constructor(private elRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.setProperty(this.elRef.nativeElement, 'innerHTML', this.htmlContent);
  }
}
