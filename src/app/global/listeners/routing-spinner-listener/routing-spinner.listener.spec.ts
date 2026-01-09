import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { RoutingSpinnerListener } from './routing-spinner.listener';

describe('UserDataService', () => {
  let listener: RoutingSpinnerListener;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    listener = TestBed.inject(RoutingSpinnerListener);
  });

  it('should be created', () => {
    expect(listener).toBeTruthy();
  });
});
