import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionMenuComponent } from './function-menu.component';

describe('FunctionMenuComponent', () => {
  let component: FunctionMenuComponent;
  let fixture: ComponentFixture<FunctionMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FunctionMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
