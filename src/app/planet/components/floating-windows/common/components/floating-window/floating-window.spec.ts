import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { FloatingWindow } from './floating-window';

describe('FloatingWindow', () => {
  let component: FloatingWindow;
  let fixture: ComponentFixture<FloatingWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingWindow],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
