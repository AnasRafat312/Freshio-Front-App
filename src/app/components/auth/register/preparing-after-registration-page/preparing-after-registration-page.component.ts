import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-preparing-after-registration-page',
  templateUrl: './preparing-after-registration-page.component.html',
  styleUrls: ['./preparing-after-registration-page.component.scss']
})
export class PreparingAfterRegistrationPageComponent implements OnInit {
    userName!:string
    ngOnInit(): void {
        this.userName = localStorage.getItem('registUserName')
    }
}
