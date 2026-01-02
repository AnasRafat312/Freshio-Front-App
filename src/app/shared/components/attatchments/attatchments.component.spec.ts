import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttatchmentsComponent } from './attatchments.component';

describe('AttatchmentsComponent', () => {
  let component: AttatchmentsComponent;
  let fixture: ComponentFixture<AttatchmentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttatchmentsComponent]
    });
    fixture = TestBed.createComponent(AttatchmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
