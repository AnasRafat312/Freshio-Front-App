import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageDetailsComponent } from './page-details.component';

describe('PageDetailsComponent', () => {
  let component: PageDetailsComponent;
  let fixture: ComponentFixture<PageDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PageDetailsComponent]
    });
    fixture = TestBed.createComponent(PageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
