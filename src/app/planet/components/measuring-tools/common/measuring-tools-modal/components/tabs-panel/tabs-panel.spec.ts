import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { TabsPanel } from './tabs-panel';

describe('MainTabs', () => {
  let component: TabsPanel;
  let fixture: ComponentFixture<TabsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsPanel],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TabsPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
