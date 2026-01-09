import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SetUserThemeService } from './set-user-theme.service';

describe('SetUserThemeService', () => {
  let service: SetUserThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(SetUserThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
