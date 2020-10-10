import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DotNavigationComponent } from './dot-navigation.component';

describe('DotNavigationComponent', () => {
  let component: DotNavigationComponent;
  let fixture: ComponentFixture<DotNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DotNavigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DotNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
