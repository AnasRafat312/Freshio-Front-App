import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-varifacation',
  templateUrl: './varifacation.component.html',
  styleUrls: ['./varifacation.component.scss']
})
export class VarifacationComponent implements OnInit {
  userName!:string
  
  ngOnInit(): void {
     // this.userName = localStorage.getItem('registUserName')
  }

}
