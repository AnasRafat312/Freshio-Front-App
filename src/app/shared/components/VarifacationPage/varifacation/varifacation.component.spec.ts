import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VarifacationComponent } from './varifacation.component';

describe('VarifacationComponent', () => {
  let component: VarifacationComponent;
  let fixture: ComponentFixture<VarifacationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VarifacationComponent]
    });
    fixture = TestBed.createComponent(VarifacationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
