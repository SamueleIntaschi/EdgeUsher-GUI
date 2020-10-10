import { TestBed } from '@angular/core/testing';

import { InfrastructureOverlayService } from './infrastructure-overlay.service';

describe('InfrastructureOverlayService', () => {
  let service: InfrastructureOverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfrastructureOverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
