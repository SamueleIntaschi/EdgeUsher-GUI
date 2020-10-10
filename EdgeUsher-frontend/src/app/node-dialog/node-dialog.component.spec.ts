import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NodeDialogComponent } from './node-dialog.component';

describe('NodeDialogComponent', () => {
  let component: NodeDialogComponent;
  let fixture: ComponentFixture<NodeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NodeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
