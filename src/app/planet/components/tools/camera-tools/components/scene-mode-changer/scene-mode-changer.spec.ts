import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SceneModeChanger } from './scene-mode-changer';

describe('SceneModeChanger', () => {
  let component: SceneModeChanger;
  let fixture: ComponentFixture<SceneModeChanger>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SceneModeChanger],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SceneModeChanger);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
