import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDeleteModalComponent } from './new-delete-modal.component';

describe('NewDeleteModalComponent', () => {
  let component: NewDeleteModalComponent;
  let fixture: ComponentFixture<NewDeleteModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewDeleteModalComponent]
    });
    fixture = TestBed.createComponent(NewDeleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
