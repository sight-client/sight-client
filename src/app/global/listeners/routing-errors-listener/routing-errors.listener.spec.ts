import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { RoutingErrorsListener } from './routing-errors.listener';

describe('RoutingErrorsListener', () => {
  let fixture: ComponentFixture<RoutingErrorsListener>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutingErrorsListener],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RoutingErrorsListener);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
