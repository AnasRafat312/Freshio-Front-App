import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckTreeComponent } from './check-tree.component';

describe('CheckTreeComponent', () => {
  let component: CheckTreeComponent;
  let fixture: ComponentFixture<CheckTreeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CheckTreeComponent]
    });
    fixture = TestBed.createComponent(CheckTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
