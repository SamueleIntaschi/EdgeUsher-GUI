import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MatDialog} from '@angular/material/dialog';

import { WorkingPageComponent } from './working-page.component';

describe('WorkingPageComponent', () => {
  let component: WorkingPageComponent;
  let fixture: ComponentFixture<WorkingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkingPageComponent ],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: MatDialog, useValue: {} },
      ]
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
