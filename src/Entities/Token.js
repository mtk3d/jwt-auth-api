import localStorage from 'local-storage';
import jwtDecode from 'jwt-decode';

export default class Token {
  constructor(refreshUrl, refreshTTL) {
    this.refreshUrl = refreshUrl;
    this.decodedToken = null
    this.tokenExp = 0;
    this.refreshTTL = refreshTTL;
    this.init();
  }

  init() {
    if (this.getToken()) {
      this.setToken(this.getToken());
    }
  }

  getToken() {
    return localStorage.get('Authorization');
  }

  setToken(token) {
    if (!token) {
      throw new Error('There is no token');
    }
    const normalizedToken = token.replace('Bearer ', '');
    localStorage.set('Authorization', normalizedToken);
    this.decodedToken = jwtDecode(normalizedToken);
    this.tokenExp = this.decodedToken.exp;
  }

  removeToken() {
    this.decodedToken = null;
    this.tokenExp = null;
  }

  getDecodedToken() {
    return this.decodedToken;
  }

  isExpired() {
    const currentTimestamp = Date.now() / 1000;
    return this.tokenExp < currentTimestamp;
  }

  canRefresh() {
    const currentTimestamp = Date.now() / 1000;
    return this.getToken() && this.tokenExp + this.refreshTTL > currentTimestamp;
  }

  shouldRefresh() {
    return this.isExpired() && this.canRefresh();
  }

  refreshToken(axiosInstance) {
    return new Promise((resolve, reject) => {
      axiosInstance.post(this.refreshUrl, { token: this.getToken() })
        .then(response => {
          const token = response.data.access_token;
          this.setToken(token);
          resolve(token);
        })
        .catch(error => {
          reject(error);
        });
    })
  }
}