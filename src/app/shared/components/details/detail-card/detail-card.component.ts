import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-detail-card',
  templateUrl: './detail-card.component.html',
  styleUrls: ['./detail-card.component.scss']
})
export class DetailCardComponent {
  @Input() title: string = '';
  @Input() icon: string = 'pi pi-info-circle';
  @Input() columns: number = 0; // 0 = auto-responsive (lg:4, md:3, sm:2, xs:1), 2, 3, 4 = fixed columns
  @Input() fullWidth: boolean = false; // If true, content takes full width without grid
  @Input() collapsible: boolean = true; // If true, card can be collapsed
  @Input() collapsed: boolean = false; // Initial collapsed state

  isCollapsed: boolean = false;

  ngOnInit() {
    this.isCollapsed = this.collapsed;
  }

  toggleCollapse() {
    if (this.collapsible) {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  getRowClass(): string {
    if (this.fullWidth) {
      return '';
    }
    if (this.columns === 0) {
      return 'row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4';
    }
    return `row row-cols-1 row-cols-md-${this.columns}`;
  }
}
