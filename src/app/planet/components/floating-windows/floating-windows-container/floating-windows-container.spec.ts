import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { FloatingWindowsContainer } from './floating-windows-container';

describe('FloatingWindowsContainer', () => {
  let component: FloatingWindowsContainer;
  let fixture: ComponentFixture<FloatingWindowsContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingWindowsContainer],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingWindowsContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
