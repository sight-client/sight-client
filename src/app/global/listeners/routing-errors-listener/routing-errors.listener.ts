import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Router,
  NavigationStart,
  NavigationError,
  NavigationCancel,
  NavigationCancellationCode,
} from '@angular/router';
@Component({
  selector: 'routing-errors-alert',
  template: `
    @if (errorMessage()) {
      <div class="routing-error-banner-wrapper">
        <div class="routing-error-banner">
          {{ errorMessage() }}
          <button (click)="dismissError()">Dismiss</button>
        </div>
      </div>
    }
  `,
  styleUrl: './routing-errors.listener.scss',
})
export class RoutingErrorsListener {
  private router = inject(Router);
  readonly errorMessage = signal('');
  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.errorMessage.set('');
      } else if (event instanceof NavigationError) {
        console.error('Navigation error:', event.error);
        this.errorMessage.set('Failed to load page. Please try again.');
      } else if (event instanceof NavigationCancel) {
        console.warn('Navigation cancelled:', event.reason);
        if (event.reason === `${NavigationCancellationCode.GuardRejected}`) {
          this.errorMessage.set(
            'Access denied. Please check your permissions.',
          );
        }
      }
    });
  }
  dismissError() {
    this.router.navigateByUrl('/client', {
      replaceUrl: true,
    });
    this.errorMessage.set('');
  }
}
