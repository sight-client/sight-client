import { measureHeightPanelNaturalWidth } from './phone-stack-width.lib';

function mockChildWidth(box: HTMLElement, child: HTMLElement, natural: number): void {
  vi.spyOn(child, 'getBoundingClientRect').mockImplementation(() => {
    const stretched = Number.parseFloat(box.style.width);
    const width =
      box.style.width === 'max-content'
        ? natural
        : Number.isFinite(stretched)
          ? stretched + 0.4
          : natural;
    return {
      width,
      height: 32,
      top: 0,
      left: 0,
      right: width,
      bottom: 32,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    };
  });
}

describe('measureHeightPanelNaturalWidth', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('measures as max-content so a stretched flex child does not inflate the stack', () => {
    const box = document.createElement('div');
    const child = document.createElement('span');
    box.appendChild(child);
    box.style.width = '280px';
    mockChildWidth(box, child, 120);

    expect(measureHeightPanelNaturalWidth(box)).toBe(120);
    expect(box.style.width).toBe('280px');
  });

  it('does not ratchet when observer reapplies the stack width onto the same box', () => {
    const box = document.createElement('div');
    const child = document.createElement('span');
    box.appendChild(child);
    const coordsMin = 200;
    mockChildWidth(box, child, 120);

    let stackW = coordsMin;
    for (let i = 0; i < 50; i++) {
      const natural = measureHeightPanelNaturalWidth(box);
      stackW = Math.ceil(Math.max(natural, coordsMin));
      box.style.width = `${stackW}px`;
    }

    expect(stackW).toBe(coordsMin);
  });
});
