import { TestBed } from '@angular/core/testing';

import { ChainErrorCheckingServiceService } from './chain-error-checking-service.service';

describe('ChainErrorCheckingServiceService', () => {
  let service: ChainErrorCheckingServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChainErrorCheckingServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
