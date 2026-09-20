import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ThemeColorPalette } from './theme-color-palette';

describe('ThemeColorPalette', () => {
  let component: ThemeColorPalette;
  let fixture: ComponentFixture<ThemeColorPalette>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeColorPalette],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeColorPalette);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
