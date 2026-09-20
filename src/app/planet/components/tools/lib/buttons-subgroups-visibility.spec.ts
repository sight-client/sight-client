import { ElementRef } from '@angular/core';

import {
  setNormalButtonsVisibility,
  toggleAuxillarySubgroupVisibility,
} from './buttons-subgroups-visibility';

function buttonEl(): HTMLButtonElement {
  return document.createElement('button');
}

function divRef(children: HTMLElement[]): ElementRef {
  const div = document.createElement('div');
  for (const child of children) {
    div.appendChild(child);
  }
  return { nativeElement: div } as ElementRef;
}

describe('buttons-subgroups-visibility', () => {
  describe('setNormalButtonsVisibility', () => {
    it('sets button-visibility on default firstChild and hidden children', () => {
      const defaultER = divRef([buttonEl()]);
      const hiddenER = divRef([buttonEl(), buttonEl()]);

      expect(setNormalButtonsVisibility(defaultER, hiddenER)).toBe(true);
      expect(defaultER.nativeElement.firstChild?.getAttribute('button-visibility')).toBe('true');
      for (const child of Array.from(hiddenER.nativeElement.children)) {
        expect((child as HTMLElement).getAttribute('button-visibility')).toBe('false');
      }
    });

    it('returns false when default subgroup has no firstChild', () => {
      const defaultER = divRef([]);
      const hiddenER = divRef([buttonEl()]);

      expect(setNormalButtonsVisibility(defaultER, hiddenER)).toBe(false);
    });
  });

  describe('toggleAuxillarySubgroupVisibility', () => {
    it('toggles button-visibility between true and false', () => {
      const defaultER = divRef([buttonEl()]);
      const hiddenER = divRef([buttonEl(), buttonEl()]);
      setNormalButtonsVisibility(defaultER, hiddenER);

      expect(toggleAuxillarySubgroupVisibility(hiddenER)).toBe(true);
      for (const child of Array.from(hiddenER.nativeElement.children)) {
        expect((child as HTMLElement).getAttribute('button-visibility')).toBe('true');
      }

      expect(toggleAuxillarySubgroupVisibility(hiddenER)).toBe(true);
      for (const child of Array.from(hiddenER.nativeElement.children)) {
        expect((child as HTMLElement).getAttribute('button-visibility')).toBe('false');
      }
    });
  });
});
