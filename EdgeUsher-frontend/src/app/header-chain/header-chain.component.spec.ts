import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderChainComponent } from './header-chain.component';

describe('HeaderChainComponent', () => {
  let component: HeaderChainComponent;
  let fixture: ComponentFixture<HeaderChainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderChainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderChainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
