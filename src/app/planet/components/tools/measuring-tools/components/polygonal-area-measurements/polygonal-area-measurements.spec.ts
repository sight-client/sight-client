import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { PolygonalAreaMeasurements } from './polygonal-area-measurements';

describe('PolygonalAreaMeasurements', () => {
  let component: PolygonalAreaMeasurements;
  let fixture: ComponentFixture<PolygonalAreaMeasurements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolygonalAreaMeasurements],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PolygonalAreaMeasurements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
