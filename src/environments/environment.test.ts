export const environment = {
  production: false,
  // apiUrl: `http://${location.hostname}:${5001}`,,
  // catalogUrl: `http://${location.hostname}:${9003}`,
};

describe('environment.test', () => {
  it('should be created', () => {
    expect(environment).toBeTruthy();
  });
});
