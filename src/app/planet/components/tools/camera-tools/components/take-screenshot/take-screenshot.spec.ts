import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { TakeScreenshot } from './take-screenshot';

describe('TakeScreenshot', () => {
  let component: TakeScreenshot;
  let fixture: ComponentFixture<TakeScreenshot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TakeScreenshot],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TakeScreenshot);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
