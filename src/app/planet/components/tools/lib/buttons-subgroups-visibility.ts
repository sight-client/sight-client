import { ElementRef, WritableSignal } from '@angular/core';
import chalk from 'chalk';

export function setNormalButtonsVisibility(
  defaultDivER: ElementRef,
  hidenDivER: ElementRef,
): boolean {
  try {
    const childInDefaultER = defaultDivER?.nativeElement?.firstChild;
    if (childInDefaultER) setBtnVisibilityAttr(childInDefaultER, 'true');
    else throw new Error('defaultSubGroup is empty in setNormalButtonsVisibility fn');
    if (hideAuxillarySubgroup(hidenDivER) === true) return true;
    else return false;
  } catch (error: unknown) {
    console.log(chalk.red(error));
    return false;
  }
}

export function hideAuxillarySubgroup(hidenDivER: ElementRef): boolean {
  try {
    const childrenInHidenER = Array.from(hidenDivER?.nativeElement?.children);
    if (!childrenInHidenER.length)
      throw new Error('hidenSubGroup is empty in hideAuxillarySubgroup fn');
    childrenInHidenER.forEach((el: unknown) => {
      setBtnVisibilityAttr(el, 'false');
    });
    return true;
  } catch (error: unknown) {
    console.log(chalk.red(error));
    return false;
  }
}

export function showAuxillarySubgroup(hidenDivER: ElementRef): boolean {
  try {
    const childrenInHidenER = Array.from(hidenDivER?.nativeElement?.children);
    if (!childrenInHidenER.length)
      throw new Error('hidenSubGroup is empty in showAuxillarySubgroup fn');
    childrenInHidenER.forEach((el: unknown) => {
      setBtnVisibilityAttr(el, 'true');
    });
    return true;
  } catch (error: unknown) {
    console.log(chalk.red(error));
    return false;
  }
}

export function toggleAuxillarySubgroupVisibility(hidenDivER: ElementRef): boolean {
  try {
    const childrenInHidenER = Array.from(hidenDivER?.nativeElement?.children);
    if (!childrenInHidenER.length)
      throw new Error('hidenSubGroup is empty in toggleAuxillarySubgroupVisibility fn');
    childrenInHidenER.forEach((el: unknown) => {
      if (!(el instanceof HTMLElement))
        throw new Error('el is not an HTMLElement in toggleAuxillarySubgroupVisibility fn');
      if (el.getAttribute('button-visibility') === 'false') {
        setBtnVisibilityAttr(el, 'true');
      } else if (el.getAttribute('button-visibility') === 'true') {
        setBtnVisibilityAttr(el, 'false');
      } else
        throw new Error(
          "el's attribute 'button-visibility' is not undefined in toggleAuxillarySubgroupVisibility fn",
        );
    });
    return true;
  } catch (error: unknown) {
    console.log(chalk.red(error));
    return false;
  }
}

function setBtnVisibilityAttr(el: unknown, val: 'true' | 'false'): boolean {
  try {
    if (!el) throw new Error('el is not undefined in setBtnVisibilityAttr fn');
    if (!(el instanceof HTMLElement))
      throw new Error('el is not an HTMLElement in setBtnVisibilityAttr fn');
    // Установить атрибут, даже если он отсутствовал
    el.setAttribute('button-visibility', val);
    return true;
  } catch (error: unknown) {
    console.log(chalk.red(error));
    if (error instanceof Error) console.log(error.stack);
    return false;
  }
}

export function setStartBtnVisibility(
  el: ElementRef<HTMLElement>,
  buttonVisibility: WritableSignal<boolean>,
): boolean {
  try {
    if (!el?.nativeElement)
      throw new Error('Host element is not defined in setStartBtnVisibility fn');
    if (!(el.nativeElement instanceof HTMLElement))
      throw new Error('Host element is not HTMLElement in setStartBtnVisibility fn');
    // Определение стартового значения флага видимости кнопки
    const attrVal: unknown = el.nativeElement.getAttribute('button-visibility');
    if (attrVal === 'true') {
      buttonVisibility.set(true);
      return true;
    } else if (attrVal === 'false') {
      buttonVisibility.set(false);
      return true;
    } else throw new Error('button-visibility attribute error in setStartBtnVisibility fn');
  } catch (error: unknown) {
    console.log(chalk.red(error));
    if (error instanceof Error) console.log(error.stack);
    return false;
  }
}

export function getBtnVisibilityObserver(
  el: ElementRef<HTMLElement>,
  buttonVisibility: WritableSignal<boolean>,
): MutationObserver | undefined {
  try {
    if (!el?.nativeElement)
      throw new Error('Host element is not defined in getBtnVisibilityObserver fn');
    if (!(el.nativeElement instanceof HTMLElement))
      throw new Error('Host element is not HTMLElement in getBtnVisibilityObserver fn');
    return new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'button-visibility') {
          const newValue: unknown = el?.nativeElement?.getAttribute('button-visibility');
          if (newValue === 'true') {
            buttonVisibility.set(true);
          } else if (newValue === 'false') {
            buttonVisibility.set(false);
          } else console.log('button-visibility attribute error in MutationObserver');
          // console.log(
          //   `"button-visibility" attr on host ${el?.nativeElement?.tagName} has changed to:`,
          //   newValue,
          // );
        }
      });
    });
  } catch (error: unknown) {
    console.log(chalk.red(error));
    if (error instanceof Error) console.log(error.stack);
    return undefined;
  }
}
