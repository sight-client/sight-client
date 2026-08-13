import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CursorPositionListener {
  constructor() {
    this.addListener();
  }
  public cursorXExport: number = 0;
  public cursorYExport: number = 0;
  public listenerExistence: boolean = false;
  public addListener(): void {
    document.addEventListener('mousemove', (event) => {
      this.cursorXExport = event.clientX;
      this.cursorYExport = event.clientY;
      // console.log(event.clientX, event.clientY);
    });
    this.listenerExistence = !this.listenerExistence;
  }
  public removeListener(): void {
    document.removeEventListener('mousemove', (event) => {
      this.cursorXExport = event.clientX;
      this.cursorYExport = event.clientY;
    });
    this.listenerExistence = !this.listenerExistence;
  }
  public addListenerOnce(): void {
    document.addEventListener(
      'mousemove',
      (event) => {
        this.cursorXExport = event.clientX;
        this.cursorYExport = event.clientY;
      },
      { once: true },
    );
  }
}
