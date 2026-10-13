import { finiteCssPx } from '@global/lib/common-global.lib';

export function measureHeightPanelNaturalWidth(box: HTMLElement): number {
  const prevWidth = box.style.width;
  const prevMax = box.style.maxWidth;
  box.style.width = 'max-content';
  box.style.maxWidth = 'none';
  try {
    const cs = getComputedStyle(box);
    const padX = finiteCssPx(cs.paddingLeft) + finiteCssPx(cs.paddingRight);
    const childrenW = [...box.children]
      .filter((el) => getComputedStyle(el).display !== 'none')
      .reduce((sum, el) => sum + el.getBoundingClientRect().width, 0);
    return childrenW + padX;
  } finally {
    box.style.width = prevWidth;
    box.style.maxWidth = prevMax;
  }
}
