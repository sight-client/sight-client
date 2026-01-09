import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ThemeColorChanger } from './theme-color-changer';

describe('ThemeColorChanger', () => {
  let component: ThemeColorChanger;
  let fixture: ComponentFixture<ThemeColorChanger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeColorChanger],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeColorChanger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
