import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressSpinnerDialogComponentComponent } from './progress-spinner-dialog-component.component';

describe('ProgressSpinnerDialogComponentComponent', () => {
  let component: ProgressSpinnerDialogComponentComponent;
  let fixture: ComponentFixture<ProgressSpinnerDialogComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressSpinnerDialogComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressSpinnerDialogComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
