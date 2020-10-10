import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowMenuComponent } from './flow-menu.component';

describe('FlowMenuComponent', () => {
  let component: FlowMenuComponent;
  let fixture: ComponentFixture<FlowMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlowMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
