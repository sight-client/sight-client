import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { RoutingSpinnerListener } from './routing-spinner.listener';

describe('RoutingSpinnerListener', () => {
  let fixture: ComponentFixture<RoutingSpinnerListener>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutingSpinnerListener],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RoutingSpinnerListener);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
