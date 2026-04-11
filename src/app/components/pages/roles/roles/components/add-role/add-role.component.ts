import { Component, Inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PrivilegeService } from 'src/app/components/pages/privilege/privilege.service';
import { PrivilegeRoles } from 'src/app/components/pages/privilege/interfaces/privilege';
import { LanguagesService } from 'src/app/shared/services/languages.service';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent {}
