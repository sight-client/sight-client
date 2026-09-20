import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { DrawingsListEntityInfo } from './drawings-list-entity-info';

describe('DrawingsListEntityInfo', () => {
  let component: DrawingsListEntityInfo;
  let fixture: ComponentFixture<DrawingsListEntityInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawingsListEntityInfo],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DrawingsListEntityInfo);
    component = fixture.componentInstance;
    component.objInCollection = { groupId: 'g', entitiesList: [] };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
