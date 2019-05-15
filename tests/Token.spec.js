import Token from '../src/Entities/Token';
import MockDate from 'mockdate';
import axios from 'axios';
import cookies from 'browser-cookies';

const fakeCurrentTimestampS = 1000000000;
const exampleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxMDAwMDAwMDAwLCJleHAiOjEwMDAwMDAyMDB9.sRMrdJdK4FUGlPg4Ft1z9VJVj_t3OWoYfD38RocWROU";
const decodedExampleToken = {
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1000000000,
  "exp": 1000000200
};

const exampleRefreshedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwOTg3NjU0MzIxIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxMDAwMDAwMDAwLCJleHAiOjEwMDAwMDAyMDB9._jjOQ5MPiAELpqNRbRucAOOTQk8n_sAIYSeN2jGbnMU";

let token = null;

jest.mock('axios');
jest.mock('browser-cookies', () => {});

describe('Token', () => {
  beforeEach(() => {
    token = new Token('/api/auth/refresh', 800);
    token.setToken(exampleToken);
  });

  afterEach(() => {
    MockDate.reset();
  });

  test('set JWT token', () => {
    MockDate.set(fakeCurrentTimestampS * 1000);

    expect(token.getToken()).toBe(exampleToken);
    expect(token.tokenExp).toBe(fakeCurrentTimestampS + 200);
  });

  test('set undefined token', () => {
    MockDate.set(fakeCurrentTimestampS * 1000);
    console.error = jest.fn();

    token.setToken(undefined);

    expect(console.error).toBeCalled();
    expect(token.getToken()).toBe(null);
    expect(token.tokenExp).toBe(null);
  });

  test('is alive', () => {
    MockDate.set(fakeCurrentTimestampS * 1000);

    expect(token.isExpired()).toBe(false);
    expect(token.shouldRefresh()).toBe(false);
    expect(token.canRefresh()).toBe(true);
  });

  test('is expired', () => {
    MockDate.set((fakeCurrentTimestampS + 500) * 1000);

    expect(token.isExpired()).toBe(true);
  });

  test('is refreshTTL expired', () => {
    MockDate.set((fakeCurrentTimestampS + 1000) * 1000);

    expect(token.canRefresh()).toBe(false);
  });

  test('can be refreshed', () => {
    MockDate.set((fakeCurrentTimestampS + 700) * 1000);

    expect(token.shouldRefresh()).toBe(true);
  });

  test('decode token', () => {
    expect(token.getDecodedToken()).toEqual(decodedExampleToken);
  });

  test('remove token', () => {
    token.removeToken();
    expect(token.getDecodedToken()).toBe(null);
    expect(token.tokenExp).toBe(null);
    expect(token.tokenIat).toBe(null);
  });

  test('refresh token', async () => {
    MockDate.set((fakeCurrentTimestampS + 700) * 1000);

    const response = {
      data: {
        data: {
          access_token: exampleRefreshedToken,
          expires_in: 200,
          token_type: "bearer"
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      }
    };

    axios.post = jest.fn(() => Promise.resolve(response));

    await token.refreshToken(axios);
    
    expect(token.getToken()).toBe(exampleRefreshedToken);
  });
});