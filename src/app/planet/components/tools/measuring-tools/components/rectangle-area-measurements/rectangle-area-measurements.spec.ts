import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { RectangleAreaMeasurements } from './rectangle-area-measurements';

describe('RectangleAreaMeasurements', () => {
  let component: RectangleAreaMeasurements;
  let fixture: ComponentFixture<RectangleAreaMeasurements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RectangleAreaMeasurements],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(RectangleAreaMeasurements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
