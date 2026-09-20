import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SetProgressSpinnerService {
  public isShowSpinner = signal<boolean>(false);
  public setSpinnerOn(): void {
    this.isShowSpinner.set(true);
  }
  public setSpinnerOff(): void {
    this.isShowSpinner.set(false);
  }
}
