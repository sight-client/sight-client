import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ToolsFloatingWindows } from './tools-floating-windows';

describe('ToolsFloatingWindows', () => {
  let component: ToolsFloatingWindows;
  let fixture: ComponentFixture<ToolsFloatingWindows>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolsFloatingWindows],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolsFloatingWindows);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
