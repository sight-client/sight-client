import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ProgressSpinner } from './progress-spinner';

describe('ProgressSpinner', () => {
  let component: ProgressSpinner;
  let fixture: ComponentFixture<ProgressSpinner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressSpinner],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressSpinner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
