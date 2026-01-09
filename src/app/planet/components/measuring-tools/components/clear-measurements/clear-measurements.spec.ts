import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ClearMeasurements } from './clear-measurements';

describe('ClearMeasurements', () => {
  let component: ClearMeasurements;
  let fixture: ComponentFixture<ClearMeasurements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClearMeasurements],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ClearMeasurements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
