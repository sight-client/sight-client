import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { FloatingWindowTabsPanel } from './floating-windows-tabs-panel';

describe('MainTabs', () => {
  let component: FloatingWindowTabsPanel;
  let fixture: ComponentFixture<FloatingWindowTabsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingWindowTabsPanel],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingWindowTabsPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
