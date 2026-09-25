import { reportError } from '@global/lib/report-error.lib';
import { ElementRef } from '@angular/core';

export function setNormalButtonsVisibility(
  defaultDivER: ElementRef<HTMLElement>,
  hiddenDivER: ElementRef<HTMLElement>,
): boolean {
  try {
    const childInDefaultER = defaultDivER?.nativeElement?.firstChild;
    if (childInDefaultER) setBtnVisibilityAttr(childInDefaultER, 'true');
    else throw new Error('defaultSubGroup is empty in setNormalButtonsVisibility fn');
    if (hideAuxiliarySubgroup(hiddenDivER) === true) return true;
    else return false;
  } catch (error: unknown) {
    reportError(error);
    return false;
  }
}

export function hideAuxiliarySubgroup(hiddenDivER: ElementRef<HTMLElement>): boolean {
  try {
    const childrenInHiddenER = Array.from(hiddenDivER?.nativeElement?.children);
    if (!childrenInHiddenER.length)
      throw new Error('hiddenSubGroup is empty in hideAuxiliarySubgroup fn');
    childrenInHiddenER.forEach((el: unknown) => {
      setBtnVisibilityAttr(el, 'false');
    });
    return true;
  } catch (error: unknown) {
    reportError(error);
    return false;
  }
}

export function showAuxiliarySubgroup(hiddenDivER: ElementRef<HTMLElement>): boolean {
  try {
    const childrenInHiddenER = Array.from(hiddenDivER?.nativeElement?.children);
    if (!childrenInHiddenER.length)
      throw new Error('hiddenSubGroup is empty in showAuxiliarySubgroup fn');
    childrenInHiddenER.forEach((el: unknown) => {
      setBtnVisibilityAttr(el, 'true');
    });
    return true;
  } catch (error: unknown) {
    reportError(error);
    return false;
  }
}

export function toggleAuxiliarySubgroupVisibility(hiddenDivER: ElementRef<HTMLElement>): boolean {
  try {
    const childrenInHiddenER = Array.from(hiddenDivER?.nativeElement?.children);
    if (!childrenInHiddenER.length)
      throw new Error('hiddenSubGroup is empty in toggleAuxiliarySubgroupVisibility fn');
    childrenInHiddenER.forEach((el: unknown) => {
      if (!(el instanceof HTMLElement))
        throw new Error('el is not an HTMLElement in toggleAuxiliarySubgroupVisibility fn');
      if (el.style.display === 'none') {
        setBtnVisibilityAttr(el, 'true');
      } else if (el.style.display === 'block') {
        setBtnVisibilityAttr(el, 'false');
      } else {
        throw new Error(
          "el's display is unset in toggleAuxiliarySubgroupVisibility fn",
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
