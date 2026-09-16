import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ToolsList } from './tools-list';

describe('ToolsList', () => {
  let component: ToolsList;
  let fixture: ComponentFixture<ToolsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolsList],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
