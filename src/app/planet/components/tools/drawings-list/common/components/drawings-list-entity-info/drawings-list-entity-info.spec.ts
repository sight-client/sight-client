import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import * as Cesium from 'cesium';

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
    fixture.componentRef.setInput('objInCollection', { groupId: 'g', entitiesList: [] });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows defaultEntity name in the template', () => {
    fixture.componentRef.setInput('objInCollection', {
      groupId: 'g',
      entitiesList: [],
      defaultEntity: new Cesium.Entity({ id: 'g-mark', name: 'TestMark' }),
    });
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.drawings-list-entity-info-text');
    expect(label?.textContent?.trim()).toBe('TestMark');
  });
});
