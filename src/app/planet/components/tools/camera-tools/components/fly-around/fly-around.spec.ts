import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { FlyAround } from './flyAround';

describe('FlyAround', () => {
  let component: FlyAround;
  let fixture: ComponentFixture<FlyAround>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlyAround],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(FlyAround);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
