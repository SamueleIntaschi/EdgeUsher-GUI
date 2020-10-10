import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgChainComponent } from './svg-chain.component';

describe('SvgChainComponent', () => {
  let component: SvgChainComponent;
  let fixture: ComponentFixture<SvgChainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SvgChainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgChainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
