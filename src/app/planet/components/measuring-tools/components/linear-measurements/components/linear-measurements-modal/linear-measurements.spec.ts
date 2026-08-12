import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LinearMeasurementsModal } from './linear-measurements-modal';

describe('LinearMeasurementsModal', () => {
  let component: LinearMeasurementsModal;
  let fixture: ComponentFixture<LinearMeasurementsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinearMeasurementsModal],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LinearMeasurementsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
