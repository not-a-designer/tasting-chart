import { TestBed } from '@angular/core/testing';

import { SavedProfilesService } from './saved-profiles.service';

describe('SavedProfilesService', () => {
  let service: SavedProfilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SavedProfilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
