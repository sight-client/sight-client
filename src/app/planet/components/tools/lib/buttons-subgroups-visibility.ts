import { reportError } from '@global/lib/report-error.lib';
import { ElementRef } from '@angular/core';

export function setNormalButtonsVisibility(
  defaultDivER: ElementRef<HTMLElement>,
  hidenDivER: ElementRef<HTMLElement>,
): boolean {
  try {
    const childInDefaultER = defaultDivER?.nativeElement?.firstChild;
    if (childInDefaultER) setBtnVisibilityAttr(childInDefaultER, 'true');
    else throw new Error('defaultSubGroup is empty in setNormalButtonsVisibility fn');
    if (hideAuxillarySubgroup(hidenDivER) === true) return true;
    else return false;
  } catch (error: unknown) {
    reportError(error);
    return false;
  }
}

export function hideAuxillarySubgroup(hidenDivER: ElementRef<HTMLElement>): boolean {
  try {
    const childrenInHidenER = Array.from(hidenDivER?.nativeElement?.children);
    if (!childrenInHidenER.length)
      throw new Error('hidenSubGroup is empty in hideAuxillarySubgroup fn');
    childrenInHidenER.forEach((el: unknown) => {
      setBtnVisibilityAttr(el, 'false');
    });
    return true;
  } catch (error: unknown) {
    reportError(error);
    return false;
  }
}

export function showAuxillarySubgroup(hidenDivER: ElementRef<HTMLElement>): boolean {
  try {
    const childrenInHidenER = Array.from(hidenDivER?.nativeElement?.children);
    if (!childrenInHidenER.length)
      throw new Error('hidenSubGroup is empty in showAuxillarySubgroup fn');
    childrenInHidenER.forEach((el: unknown) => {
      setBtnVisibilityAttr(el, 'true');
    });
    return true;
  } catch (error: unknown) {
    reportError(error);
    return false;
  }
}

export function toggleAuxillarySubgroupVisibility(hidenDivER: ElementRef<HTMLElement>): boolean {
  try {
    const childrenInHidenER = Array.from(hidenDivER?.nativeElement?.children);
    if (!childrenInHidenER.length)
      throw new Error('hidenSubGroup is empty in toggleAuxillarySubgroupVisibility fn');
    childrenInHidenER.forEach((el: unknown) => {
      if (!(el instanceof HTMLElement))
        throw new Error('el is not an HTMLElement in toggleAuxillarySubgroupVisibility fn');
      if (el.style.display === 'none') {
        setBtnVisibilityAttr(el, 'true');
      } else if (el.style.display === 'block') {
        setBtnVisibilityAttr(el, 'false');
      } else {
        throw new Error(
          "el's display is unset in toggleAuxillarySubgroupVisibility fn",
        );
      }
    });
    return true;
  } catch (error: unknown) {
    reportError(error);
    return false;
  }
}

function setBtnVisibilityAttr(el: unknown, val: 'true' | 'false'): boolean {
  try {
    if (!el) throw new Error('el is not undefined in setBtnVisibilityAttr fn');
    if (!(el instanceof HTMLElement))
      throw new Error('el is not an HTMLElement in setBtnVisibilityAttr fn');
    // Установить атрибут, даже если он отсутствовал
    el.style.display = val === 'true' ? 'block' : 'none';
    return true;
  } catch (error: unknown) {
    reportError(error);
    return false;
  }
}
