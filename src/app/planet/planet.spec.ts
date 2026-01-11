import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { Planet } from './planet';

describe('MainSight', () => {
  let component: Planet;
  let fixture: ComponentFixture<Planet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planet],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Planet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
