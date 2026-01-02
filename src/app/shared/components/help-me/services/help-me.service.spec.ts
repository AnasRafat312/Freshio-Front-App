import { TestBed } from '@angular/core/testing';

import { HelpMeService } from './help-me.service';

describe('HelpMeService', () => {
  let service: HelpMeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HelpMeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
