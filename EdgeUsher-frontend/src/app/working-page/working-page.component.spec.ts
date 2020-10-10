import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingPageComponent } from './working-page.component';

describe('WorkingPageComponent', () => {
  let component: WorkingPageComponent;
  let fixture: ComponentFixture<WorkingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkingPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
