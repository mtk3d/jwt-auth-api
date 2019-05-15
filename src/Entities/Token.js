// import localStorage from 'localStorage';
import cookies from 'browser-cookies';
import jwtDecode from 'jwt-decode';

export default class Token {
  constructor(refreshUrl, refreshTTL, secureProtocol = false) {
    this.refreshUrl = refreshUrl;
    this.decodedToken = null
    this.tokenExp = 0;
    this.tokenIat = 0;
    this.refreshTTL = refreshTTL;
    this.secureProtocol = secureProtocol;
    this.init();
  }

  init() {
    if (this.getToken()) {
      this.setToken(this.getToken());
    }
  }

  getToken() {
    return cookies.get('Authorization');
  }

  setToken(token) {
    if (typeof token !== 'string') {
      this.removeToken();
      console.error('Wrong token');
      return;
    }
    const normalizedToken = token.replace('Bearer ', '');
    this.decodedToken = jwtDecode(normalizedToken);
    this.tokenExp = this.decodedToken.exp;
    this.tokenIat = this.decodedToken.iat;
    cookies.set('Authorization', normalizedToken, {
      expires: new Date((this.tokenExp + this.refreshTTL) * 1000),
      secure: this.secureProtocol
    });
  }

  removeToken() {
    cookies.erase('Authorization');
    this.decodedToken = null;
    this.tokenExp = null;
    this.tokenIat = null;
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
    return this.getToken() && this.tokenIat + this.refreshTTL > currentTimestamp;
  }

  shouldRefresh() {
    return this.isExpired() && this.canRefresh();
  }

  refreshToken(axiosInstance) {
    return new Promise((resolve, reject) => {
      axiosInstance.post(this.refreshUrl, { token: this.getToken() })
        .then(response => {
          const token = response.data.data.access_token;
          this.setToken(token);
          resolve(token);
        })
        .catch(error => {
          this.removeToken();
          reject(error);
        });
    })
  }
}