import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { PolygonalAreaMeasurementsFloatingWindow } from './polygonal-area-measurements-floating-window';

describe('PolygonalAreaMeasurementsFloatingWindow', () => {
  let component: PolygonalAreaMeasurementsFloatingWindow;
  let fixture: ComponentFixture<PolygonalAreaMeasurementsFloatingWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolygonalAreaMeasurementsFloatingWindow],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PolygonalAreaMeasurementsFloatingWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
