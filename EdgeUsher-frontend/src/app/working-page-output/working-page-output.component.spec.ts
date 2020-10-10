import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingPageOutputComponent } from './working-page-output.component';

describe('WorkingPageOutputComponent', () => {
  let component: WorkingPageOutputComponent;
  let fixture: ComponentFixture<WorkingPageOutputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkingPageOutputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkingPageOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
