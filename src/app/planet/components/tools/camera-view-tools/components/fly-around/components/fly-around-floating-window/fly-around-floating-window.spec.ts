import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { FlyAroundFloatingWindow } from './fly-around-floating-window';

describe('FlyAroundFloatingWindow', () => {
  let component: FlyAroundFloatingWindow;
  let fixture: ComponentFixture<FlyAroundFloatingWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlyAroundFloatingWindow],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(FlyAroundFloatingWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
