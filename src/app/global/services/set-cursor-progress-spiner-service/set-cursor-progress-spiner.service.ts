import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SetCursorProgressSpinerService {
  public isShowSpiner = signal<boolean>(false);
  public setSpinnerOn(): void {
    this.isShowSpiner.set(true);
  }
  public setSpinnerOff(): void {
    this.isShowSpiner.set(false);
  }
}
