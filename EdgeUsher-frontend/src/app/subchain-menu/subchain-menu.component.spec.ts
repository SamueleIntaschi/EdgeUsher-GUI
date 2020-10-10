import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubchainMenuComponent } from './subchain-menu.component';

describe('SubchainMenuComponent', () => {
  let component: SubchainMenuComponent;
  let fixture: ComponentFixture<SubchainMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubchainMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubchainMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
