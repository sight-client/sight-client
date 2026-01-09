import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { MeasuringTools } from './measuring-tools';

describe('MeasuringTools', () => {
  let component: MeasuringTools;
  let fixture: ComponentFixture<MeasuringTools>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasuringTools],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MeasuringTools);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
