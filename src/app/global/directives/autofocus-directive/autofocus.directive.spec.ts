import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AutofocusDirective } from './autofocus.directive';

@Component({
  selector: 'host-autofocus',
  imports: [AutofocusDirective],
  template: `<input autofocusDirective />`,
})
class HostAutofocus {}

@Component({
  selector: 'host-autofocus-off',
  imports: [AutofocusDirective],
  template: `<input autofocusDirective [appAutoFocus]="false" />`,
})
class HostAutofocusOff {}

describe('AutofocusDirective', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [HostAutofocus],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostAutofocus);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('focuses the host input after detectChanges', async () => {
    await TestBed.configureTestingModule({
      imports: [HostAutofocus],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostAutofocus);
    fixture.detectChanges();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('input'));
  });

  it('[appAutoFocus]=false still focuses on init because the input has no getter', async () => {
    await TestBed.configureTestingModule({
      imports: [HostAutofocusOff],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(HostAutofocusOff);
    fixture.detectChanges();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('input'));
  });
});
