import localStorage from 'local-storage';
import jwtDecode from 'jwt-decode';

export default class Token {
  constructor(refreshUrl, refreshTTL) {
    this.refreshUrl = refreshUrl;
    this.token = null;
    this.decodedToken = null
    this.tokenExp = 0;
    this.refreshTTL = refreshTTL;
  }

  getToken() {
    const token = localStorage.get('Authorization');
    return token ? token : null;
  }

  setToken(token) {
    const normalizedToken = token.replace('Bearer ', '');
    localStorage.set('Authorization', normalizedToken);
    this.decodedToken = jwtDecode(normalizedToken);
    this.tokenExp = this.decodedToken.exp;
  }

  removeToken() {
    this.token = null;
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
    return this.token && this.tokenExp + this.refreshTTL > currentTimestamp;
  }

  shouldRefresh() {
    return this.isExpired() && this.canRefresh();
  }

  refreshToken(axiosInstance) {
    return new Promise((resolve, reject) => {
      axiosInstance.post(this.refreshUrl, { token: this.token })
        .then(response => {
          this.setToken(response.access_token);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    })
  }
}