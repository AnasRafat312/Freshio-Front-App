import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-input-field',
  templateUrl: './input-field.component.html',
  styleUrl: './input-field.component.scss'
})
export class InputFieldComponent {
    @Input() label: string = '';
    @Input() languageFactor: string = 'en';
    @Input() icon: string = '';
    @Input() isValid: boolean = false;
    @Input() isRequired: boolean = false;
}
