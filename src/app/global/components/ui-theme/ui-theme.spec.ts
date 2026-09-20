import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { UiTheme } from './ui-theme';

describe('UiTheme', () => {
  let component: UiTheme;
  let fixture: ComponentFixture<UiTheme>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTheme],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(UiTheme);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
