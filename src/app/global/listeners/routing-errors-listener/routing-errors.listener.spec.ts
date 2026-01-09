import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { RoutingErrorsListener } from './routing-errors.listener';

describe('UserDataService', () => {
  let listener: RoutingErrorsListener;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    listener = TestBed.inject(RoutingErrorsListener);
  });

  it('should be created', () => {
    expect(listener).toBeTruthy();
  });
});
