import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreparingAfterRegistrationPageComponent } from './preparing-after-registration-page.component';

describe('PreparingAfterRegistrationPageComponent', () => {
  let component: PreparingAfterRegistrationPageComponent;
  let fixture: ComponentFixture<PreparingAfterRegistrationPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreparingAfterRegistrationPageComponent]
    });
    fixture = TestBed.createComponent(PreparingAfterRegistrationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
