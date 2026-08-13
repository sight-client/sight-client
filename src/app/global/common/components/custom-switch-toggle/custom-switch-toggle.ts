import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'custom-switch-toggle',
  imports: [],
  template: `
    <label
      class="gui-switch"
      [for]="randomId"
      [style.--thumb-size]="thumbSize ? thumbSize : '0.9rem'"
      ><input
        [disabled]="disabled"
        type="checkbox"
        layerId
        [checked]="checked"
        [id]="randomId"
        (change)="emitToggle($event)"
      />
    </label>
  `,
  styleUrl: './custom-switch-toggle.scss',
})
export class CustomSwitchToggle {
  protected randomId: string = `${Math.round(Math.random() * 1000000)}`;
  @Input() disabled?: boolean;
  @Input() thumbSize?: string;
  @Input() layerId?: number;
  @Input() checked: boolean;
  @Output() checkedChange = new EventEmitter<Event>();
  protected emitToggle(event: Event): void {
    this.checkedChange.emit(event);
  }
}
