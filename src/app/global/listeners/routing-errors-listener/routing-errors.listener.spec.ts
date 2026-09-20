import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { NavigationError, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { RoutingErrorsListener } from './routing-errors.listener';

describe('RoutingErrorsListener', () => {
  let fixture: ComponentFixture<RoutingErrorsListener>;
  let events$: Subject<unknown>;
  let navigateByUrl: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    events$ = new Subject();
    navigateByUrl = vi.fn().mockResolvedValue(true);
    await TestBed.configureTestingModule({
      imports: [RoutingErrorsListener],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: { events: events$, navigateByUrl } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoutingErrorsListener);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sets Failed to load page on NavigationError and dismissError clears it', () => {
    events$.next(new NavigationError(1, '/missing', new Error('boom')));
    expect(fixture.componentInstance.errorMessage()).toBe('Failed to load page. Please try again.');

    fixture.componentInstance.dismissError();
    expect(navigateByUrl).toHaveBeenCalledWith('', { replaceUrl: true });
    expect(fixture.componentInstance.errorMessage()).toBe('');
  });
});
