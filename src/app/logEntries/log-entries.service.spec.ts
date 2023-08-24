import { TestBed } from '@angular/core/testing';

import { LogEntriesService } from "./DATABASE_NAME";

describe('LogEntriesService', () => {
  let service: LogEntriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogEntriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
