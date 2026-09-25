import {
  downloadBlob,
  finiteCssPx,
  getMomentDate,
  getMomentName,
  jsonNullToUndefined,
  undefinedToJsonNull,
  uploadBlob,
} from './common-global.lib';

describe('common-global.lib', () => {
  it('getMomentDate matches YYYY.MM.DD', () => {
    expect(getMomentDate()).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
  });

  it('jsonNullToUndefined maps null to undefined', () => {
    expect(jsonNullToUndefined({ a: null })).toEqual({ a: undefined });
  });

  it('undefinedToJsonNull maps undefined to null', () => {
    expect(undefinedToJsonNull({ a: undefined })).toEqual({ a: null });
  });

  it('uploadBlob with empty files throws', () => {
    const input = document.createElement('input');
    input.type = 'file';
    expect(() => uploadBlob({ target: input } as unknown as Event)).toThrowError(
      'No imported data from input event',
    );
  });

  it('downloadBlob clicks an anchor with download', () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    downloadBlob('f.txt', new Blob(['x']));
    expect(click).toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('getMomentName contains sight- and .sight.ods', () => {
    const name = getMomentName('sight', 'ods');
    expect(name).toContain('sight-');
    expect(name).toContain('.sight.ods');
  });

  it('finiteCssPx reads a px length and falls back when the value is not finite', () => {
    expect(finiteCssPx('44px')).toBe(44);
    expect(finiteCssPx(' 12.5 ')).toBe(12.5);
    expect(finiteCssPx('', 8)).toBe(8);
    expect(finiteCssPx('auto', 10)).toBe(10);
  });
});
