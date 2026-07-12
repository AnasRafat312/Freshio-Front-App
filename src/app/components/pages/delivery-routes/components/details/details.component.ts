import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Subscription } from 'rxjs';
import { DeliveryRouteModel } from 'src/app/shared/model/freshio/delivery-route.model';

@Component({
  selector: 'app-delivery-routes-details',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DeliveryRoutesDetailsComponent implements OnInit, OnDestroy {
  route: DeliveryRouteModel;
  languageFactor = 'en';
  languageSubscription: Subscription;

  constructor(
    private language: LanguagesService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.languageSubscription = this.language.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
    });

    if (this.config.data) {
      this.route = this.config.data;
    }
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  getLabel(enLabel: string, arLabel: string): string {
    return this.languageFactor === 'en' ? enLabel : arLabel;
  }

  formatDistance(meters?: number): string {
    if (!meters) return '-';
    const km = meters / 1000;
    return `${km.toFixed(2)} ${this.languageFactor === 'en' ? 'km' : 'كم'}`;
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '-';
    const minutes = Math.round(seconds / 60);
    return `${minutes} ${this.languageFactor === 'en' ? 'min' : 'دقيقة'}`;
  }

  onOpenGoogleMaps(): void {
    const url = this.generateGoogleMapsUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }

  private generateGoogleMapsUrl(): string | null {
    if (!this.route.Stops || this.route.Stops.length === 0) return null;

    const stopsWithLocation = this.route.Stops.filter(s => s.Latitude && s.Longitude);
    if (stopsWithLocation.length === 0) return null;

    const origin = this.route.StartLocationLat && this.route.StartLocationLng
      ? `${this.route.StartLocationLat},${this.route.StartLocationLng}`
      : `${stopsWithLocation[0].Latitude},${stopsWithLocation[0].Longitude}`;

    const destination = `${stopsWithLocation[stopsWithLocation.length - 1].Latitude},${stopsWithLocation[stopsWithLocation.length - 1].Longitude}`;

    const waypoints = stopsWithLocation
      .slice(0, -1)
      .map(s => `${s.Latitude},${s.Longitude}`)
      .join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }

    return url;
  }

  onPrint(): void {
    window.print();
  }

  onClose(): void {
    this.ref.close();
  }
}
