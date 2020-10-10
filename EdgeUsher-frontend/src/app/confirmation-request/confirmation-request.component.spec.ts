import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationRequestComponent } from './confirmation-request.component';

describe('ConfirmationRequestComponent', () => {
  let component: ConfirmationRequestComponent;
  let fixture: ComponentFixture<ConfirmationRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
