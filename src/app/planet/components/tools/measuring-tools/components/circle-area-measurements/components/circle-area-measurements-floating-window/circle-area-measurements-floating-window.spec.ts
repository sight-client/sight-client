import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { CircleAreaMeasurementsFloatingWindow } from './circle-area-measurements-floating-window';

describe('CircleAreaMeasurementsFloatingWindow', () => {
  let component: CircleAreaMeasurementsFloatingWindow;
  let fixture: ComponentFixture<CircleAreaMeasurementsFloatingWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircleAreaMeasurementsFloatingWindow],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(CircleAreaMeasurementsFloatingWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
