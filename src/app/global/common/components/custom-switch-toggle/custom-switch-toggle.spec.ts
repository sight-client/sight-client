import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { CustomSwitchToggle } from './custom-switch-toggle';

describe('CustomSwitchToggle', () => {
  let component: CustomSwitchToggle;
  let fixture: ComponentFixture<CustomSwitchToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSwitchToggle],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomSwitchToggle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('checkbox change emits checkedChange', () => {
    const emitted: Event[] = [];
    component.checkedChange.subscribe((event) => emitted.push(event));
    fixture.nativeElement.querySelector('input')?.dispatchEvent(new Event('change'));
    expect(emitted.length).toBe(1);
  });
});
