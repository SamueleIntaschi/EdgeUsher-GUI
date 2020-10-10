import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkingPageInfrastructureComponent } from './working-page-infrastructure.component';

describe('WorkingPageInfrastructureComponent', () => {
  let component: WorkingPageInfrastructureComponent;
  let fixture: ComponentFixture<WorkingPageInfrastructureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkingPageInfrastructureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkingPageInfrastructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
