import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendAttatchmentsInEntityComponent } from './send-attatchments-in-entity.component';

describe('SendAttatchmentsInEntityComponent', () => {
  let component: SendAttatchmentsInEntityComponent;
  let fixture: ComponentFixture<SendAttatchmentsInEntityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SendAttatchmentsInEntityComponent]
    });
    fixture = TestBed.createComponent(SendAttatchmentsInEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
