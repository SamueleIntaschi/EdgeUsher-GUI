import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderInfrastructureComponent } from './header-infrastructure.component';

describe('HeaderInfrastructureComponent', () => {
  let component: HeaderInfrastructureComponent;
  let fixture: ComponentFixture<HeaderInfrastructureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderInfrastructureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderInfrastructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
