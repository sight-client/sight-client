import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { CursorProgressSpinner } from './cursor-progress-spinner';

describe('CursorProgressSpinner', () => {
  let component: CursorProgressSpinner;
  let fixture: ComponentFixture<CursorProgressSpinner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CursorProgressSpinner],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(CursorProgressSpinner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
