import { TestBed } from '@angular/core/testing';

import { ChainErrorCheckingService } from './chain-error-checking.service';

describe('ChainErrorCheckingServiceService', () => {
  let service: ChainErrorCheckingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChainErrorCheckingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
