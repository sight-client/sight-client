import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LinearMeasurements } from './linear-measurements';

describe('LinearMeasurements', () => {
  let component: LinearMeasurements;
  let fixture: ComponentFixture<LinearMeasurements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinearMeasurements],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LinearMeasurements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
