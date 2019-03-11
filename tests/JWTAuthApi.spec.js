import JWTAuthApi from '../src/main.js';

let api = null;

describe('JWTAuthApi', () => {
  beforeEach(() => {
    api = new JWTApiAuth({}, '/refresh');
  });

  test('token', () => {
    expect(true).toBe(true);
  });
});