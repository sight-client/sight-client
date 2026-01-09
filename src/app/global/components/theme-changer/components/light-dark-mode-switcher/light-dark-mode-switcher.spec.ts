import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { LightDarkModeSwitcher } from './light-dark-mode-switcher';

describe('LightDarkThemeSwitcher', () => {
  let component: LightDarkModeSwitcher;
  let fixture: ComponentFixture<LightDarkModeSwitcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LightDarkModeSwitcher],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(LightDarkModeSwitcher);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
