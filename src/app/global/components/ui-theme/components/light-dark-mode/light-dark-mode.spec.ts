import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LightDarkMode } from './light-dark-mode';

describe('LightDarkThemeSwitcher', () => {
  let component: LightDarkMode;
  let fixture: ComponentFixture<LightDarkMode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightDarkMode],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LightDarkMode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
