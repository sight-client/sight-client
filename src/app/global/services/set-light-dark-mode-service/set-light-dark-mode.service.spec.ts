import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SetLightDarkModeService } from './set-light-dark-mode.service';

describe('SetLightDarkModeService', () => {
  let service: SetLightDarkModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(SetLightDarkModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
