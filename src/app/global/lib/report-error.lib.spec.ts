import { reportError } from './report-error.lib';

describe('reportError', () => {
  it('logs the value with console.error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('boom');

    reportError(error);

    expect(errorSpy).toHaveBeenCalledWith(error);
    errorSpy.mockRestore();
  });
});
