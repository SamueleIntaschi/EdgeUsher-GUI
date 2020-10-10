import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgOutputComponent } from './svg-output.component';

describe('SvgOutputComponent', () => {
  let component: SvgOutputComponent;
  let fixture: ComponentFixture<SvgOutputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SvgOutputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
