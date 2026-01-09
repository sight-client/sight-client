import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { CursorProgressSpiner } from './cursor-progress-spiner';

describe('CursorProgressSpiner', () => {
  let component: CursorProgressSpiner;
  let fixture: ComponentFixture<CursorProgressSpiner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CursorProgressSpiner],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(CursorProgressSpiner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
