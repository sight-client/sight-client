import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LinearMeasurementsFloatingWindow } from './linear-measurements-floating-window';

describe('LinearMeasurementsFloatingWindow', () => {
  let component: LinearMeasurementsFloatingWindow;
  let fixture: ComponentFixture<LinearMeasurementsFloatingWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinearMeasurementsFloatingWindow],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LinearMeasurementsFloatingWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
