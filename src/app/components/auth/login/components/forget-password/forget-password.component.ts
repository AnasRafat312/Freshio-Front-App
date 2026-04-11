import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<ForgetPasswordComponent>,
    private loginService: LoginService,
    private router: Router){
    this.form = this.fb.group({
      email:['',[Validators.required, Validators.email]]
    })
  }
  ngOnInit(): void {
    console.log('i am in forget password')
  }
  get f() {
    return this.form.controls;
  }
  submit() {
    const email = {UserEmail: this.form.get('email').value}
    this.loginService.sendForgetPasswordEmail(email).subscribe(
      (res: any) => {

          this.toastr.success('Check You Email InBox');
          this.dialogRef.close();
          this.router.navigate(['auth/login']);
        },
      (error:any) => {
        this.toastr.error('error while Sending Email')
      }
    );
  }
  onCancel(): void {
    this.dialogRef.close();
  }

}
