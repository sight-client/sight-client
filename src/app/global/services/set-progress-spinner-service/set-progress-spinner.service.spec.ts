import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SetProgressSpinnerService } from './set-progress-spinner.service';

describe('SetProgressSpinnerService', () => {
  let service: SetProgressSpinnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(SetProgressSpinnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setSpinnerOn then setSpinnerOff toggles isShowSpinner', () => {
    service.setSpinnerOn();
    expect(service.isShowSpinner()).toBe(true);
    service.setSpinnerOff();
    expect(service.isShowSpinner()).toBe(false);
  });
});
