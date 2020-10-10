import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderOutputComponent } from './header-output.component';

describe('HeaderOutputComponent', () => {
  let component: HeaderOutputComponent;
  let fixture: ComponentFixture<HeaderOutputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderOutputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
