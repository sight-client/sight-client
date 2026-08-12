import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { MeasuringToolsModal } from './measuring-tools-modal';

describe('MeasuringToolsModal', () => {
  let component: MeasuringToolsModal;
  let fixture: ComponentFixture<MeasuringToolsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasuringToolsModal],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MeasuringToolsModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
