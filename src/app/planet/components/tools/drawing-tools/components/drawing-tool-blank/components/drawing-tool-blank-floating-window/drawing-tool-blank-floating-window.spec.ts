import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { DrawingToolBlankFloatingWindow } from './drawing-tool-blank-floating-window';

describe('DrawingToolBlankFloatingWindow', () => {
  let component: DrawingToolBlankFloatingWindow;
  let fixture: ComponentFixture<DrawingToolBlankFloatingWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawingToolBlankFloatingWindow],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DrawingToolBlankFloatingWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
