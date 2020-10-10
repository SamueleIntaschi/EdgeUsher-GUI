import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgInfrastructureComponent } from './svg-infrastructure.component';

describe('SvgInfrastructureComponent', () => {
  let component: SvgInfrastructureComponent;
  let fixture: ComponentFixture<SvgInfrastructureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SvgInfrastructureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgInfrastructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
