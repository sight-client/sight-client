import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ToolsListEntityInfo } from './tools-list-entity-info';

describe('ToolsListEntityInfo', () => {
  let component: ToolsListEntityInfo;
  let fixture: ComponentFixture<ToolsListEntityInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolsListEntityInfo],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolsListEntityInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
