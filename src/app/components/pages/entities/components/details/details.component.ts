import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { EntityModel, EntityRole } from 'src/app/shared/model/freshio/entity.model';

@Component({
  selector: 'app-entities-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class EntitiesDetailsComponent implements OnInit {
  entity: EntityModel | null = null;
  languageFactor = 'en';

  constructor(
    public config: DynamicDialogConfig,
    private language: LanguagesService
  ) {}

  ngOnInit(): void {
    this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    if (this.config.data) {
      this.entity = this.config.data;
    }
  }

  getLabel(enLabel: string, arLabel: string): string {
    return this.languageFactor === 'en' ? enLabel : arLabel;
  }

  getRoleLabel(role: EntityRole): string {
    switch (role) {
      case EntityRole.Customer:
        return this.languageFactor === 'en' ? 'Customer' : 'عميل';
      case EntityRole.Supplier:
        return this.languageFactor === 'en' ? 'Supplier' : 'مورد';
      case EntityRole.Employee:
        return this.languageFactor === 'en' ? 'Employee' : 'موظف';
      case EntityRole.Driver:
        return this.languageFactor === 'en' ? 'Driver' : 'سائق';
      default:
        return '';
    }
  }

  getRoleSeverity(role: EntityRole): string {
    switch (role) {
      case EntityRole.Customer:
        return 'success';
      case EntityRole.Supplier:
        return 'info';
      case EntityRole.Employee:
        return 'warning';
      case EntityRole.Driver:
        return 'help';
      default:
        return 'secondary';
    }
  }

  openGoogleMap(): void {
    if (this.entity?.GoogleMapUrl) {
      window.open(this.entity.GoogleMapUrl, '_blank');
    }
  }
}
