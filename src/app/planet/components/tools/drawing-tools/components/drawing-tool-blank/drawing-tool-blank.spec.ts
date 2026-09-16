import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { DrawingToolBlank } from './drawing-tool-blank';

describe('DrawingToolBlank', () => {
  let component: DrawingToolBlank;
  let fixture: ComponentFixture<DrawingToolBlank>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawingToolBlank],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DrawingToolBlank);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
