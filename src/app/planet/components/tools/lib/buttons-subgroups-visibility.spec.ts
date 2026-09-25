import { ElementRef } from '@angular/core';

import {
  setNormalButtonsVisibility,
  toggleAuxillarySubgroupVisibility,
} from './buttons-subgroups-visibility';

function buttonEl(): HTMLButtonElement {
  return document.createElement('button');
}

function divRef(children: HTMLElement[]): ElementRef<HTMLElement> {
  const div = document.createElement('div');
  for (const child of children) {
    div.appendChild(child);
  }
  return { nativeElement: div };
}

describe('buttons-subgroups-visibility', () => {
  describe('setNormalButtonsVisibility', () => {
    it('shows the default host and hides the auxiliary hosts', () => {
      const defaultER = divRef([buttonEl()]);
      const hiddenER = divRef([buttonEl(), buttonEl()]);

      expect(setNormalButtonsVisibility(defaultER, hiddenER)).toBe(true);
      expect(defaultER.nativeElement.firstChild instanceof HTMLElement).toBe(true);
      expect((defaultER.nativeElement.firstChild as HTMLElement).style.display).toBe('block');
      for (const child of Array.from(hiddenER.nativeElement.children)) {
        expect(child instanceof HTMLElement).toBe(true);
        if (child instanceof HTMLElement) expect(child.style.display).toBe('none');
      }
    });

    it('returns false when default subgroup has no firstChild', () => {
      const defaultER = divRef([]);
      const hiddenER = divRef([buttonEl()]);

      expect(setNormalButtonsVisibility(defaultER, hiddenER)).toBe(false);
    });
  });

  describe('toggleAuxillarySubgroupVisibility', () => {
    it('toggles auxiliary host display between block and none', () => {
      const defaultER = divRef([buttonEl()]);
      const hiddenER = divRef([buttonEl(), buttonEl()]);
      setNormalButtonsVisibility(defaultER, hiddenER);

      expect(toggleAuxillarySubgroupVisibility(hiddenER)).toBe(true);
      for (const child of Array.from(hiddenER.nativeElement.children)) {
        expect(child instanceof HTMLElement).toBe(true);
        if (child instanceof HTMLElement) expect(child.style.display).toBe('block');
      }

      expect(toggleAuxillarySubgroupVisibility(hiddenER)).toBe(true);
      for (const child of Array.from(hiddenER.nativeElement.children)) {
        expect(child instanceof HTMLElement).toBe(true);
        if (child instanceof HTMLElement) expect(child.style.display).toBe('none');
      }
    });
  });
});
