import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { RectangleAreaMeasurementsFloatingWindow } from './rectangle-area-measurements-floating-window';

describe('RectangleAreaMeasurementsFloatingWindow', () => {
  let component: RectangleAreaMeasurementsFloatingWindow;
  let fixture: ComponentFixture<RectangleAreaMeasurementsFloatingWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RectangleAreaMeasurementsFloatingWindow],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(RectangleAreaMeasurementsFloatingWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
