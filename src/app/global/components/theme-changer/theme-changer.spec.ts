import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ThemeChanger } from './theme-changer';

describe('ThemeChanger', () => {
  let component: ThemeChanger;
  let fixture: ComponentFixture<ThemeChanger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeChanger],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeChanger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
