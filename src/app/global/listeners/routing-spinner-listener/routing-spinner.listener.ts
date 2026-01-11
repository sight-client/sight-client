import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Event, Router, NavigationStart, NavigationEnd } from '@angular/router';

@Component({
  selector: 'routing-spinner',
  template: `
    @if (loading()) {
      <div
        class="routing-spinner"
        style="position: fixed; z-index: 998; left: 50%; top: 50%; transform: translate(-50%, -50%);"
      >
        Loading...
      </div>
    }
  `,
})
export class RoutingSpinnerListener {
  private router = inject(Router);
  loading = signal<boolean>(false);
  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.loading.set(true);
      }
      if (event instanceof NavigationEnd) {
        // setTimeout(() => {
        //   this.loading.set(false);
        // }, 1000);
        this.loading.set(false);
      }
    });
  }
}
