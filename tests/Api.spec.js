import Api from '../src/Entities/Api.js';

let api = null;

describe('Api', () => {
  beforeEach(() => {
    api = new Api({}, {});
  });

  test('dispatch', () => {
    expect(true).toBe(true);
  });
});