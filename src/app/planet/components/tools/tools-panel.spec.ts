import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ToolsPanel } from './drawing-tools/drawing-tools';

describe('ToolsPanel', () => {
  let component: ToolsPanel;
  let fixture: ComponentFixture<ToolsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolsPanel],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolsPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
