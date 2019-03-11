import JWTAuthApi from '../src/main.js';

let api = null;

describe('JWTAuthApi', () => {
  beforeEach(() => {
    api = new JWTAuthApi({}, '/refresh');
  });

  test('token', () => {
    expect(true).toBe(true);
  });
});