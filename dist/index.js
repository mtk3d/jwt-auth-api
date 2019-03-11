'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));
var jwtDecode = _interopDefault(require('jwt-decode'));
var localStorage = _interopDefault(require('local-storge'));

class JWTAuthApi {
  constructor(config, tokenRefreshUrl, tokenRefreshTTL = 1209600/* two weeks */) {
    this.config = config;
    this.tokenRefreshTTL = tokenRefreshTTL;
    this.tokenRefreshUrl = tokenRefreshUrl;
    this.axiosInstance = axios.create(this.config);
    this.refreshingToken = null;
    this.requestThen = null;
    this.requestCatch = null;
    this.exp = 0;
  }

  dispatch(method, url, config, data = null) {
    this.checkToken();

    return Promise((resolve, reject) => {
      if (!this.refreshingToken) {
        this.makeRequest(
          { method, url, config, data },
          resolve, reject
        );
      } else {
        this.refreshingToken
          .then(() => {
            this.makeRequest(
              { method, url, config, data },
              resolve, reject
            );
          });
      }
    });
  }

  makeRequest({ method, url, config, data }, resolve, reject) {
    this.requestResolver(method, url, config, data)
      .then(response => {
        this.requestThen(response, resolve);
      })
      .catch(error => {
        this.requestCatch(error, reject);
      });
  }

  requestThen(response, resolve) {
    if (this.requestThen) {
      this.requestCatch(response, resolve);
    } else {
      resolve(response);
    }
  }

  requestCatch(error, reject) {
    if (this.requestCatch) {
      this.requestCatch(error, reject);
    } else {
      reject(error);
    }
  }

  requestResolver(method, url, config, data) {
    const finalConfig = config ? config : this.config;

    if (method === 'request') {
      return this.axiosInstance.request(config);
    }

    if (['post', 'put', 'patch'].includes(method)) {
      return this.axiosInstance[method](url, data, finalConfig)
    }
    
    return this.axiosInstance[method](url, finalConfig);
  }

  get(url, config = null) {
    return this.dispatch('get', url, config);
  }

  delete(url, config = null) {
    return this.dispatch('delete', url, config);
  }

  options(url, config = null) {
    return this.dispatch('options', url, config);
  }

  head(url, config = null) {
    return this.dispatch('head', url, config);
  }

  post(url, data = null, config = null) {
    return this.dispatch('post', url, config, data);
  }

  put(url, data = null, config = null) {
    return this.dispatch('put', url, config, data);
  }

  patch(url, data = null, config = null) {
    return this.dispatch('patch', url, config, data);
  }

  request(config) {
    return this.dispatch('request', null, config);
  }

  getToken() {
    return localStorage.get('Authorization');
  }

  decodeJWT() {
    return jwtDecode(this.getToken());
  }

  checkToken() {
    const timestamp = Math.floor(new Date().getTime()/1000);
    if (this.exp <= (timestamp - (15 * 60))) { // token is expired
      if ((this.exp + this.tokenRefreshTTL) > timestamp) { // refresh ttl is not expired
        this.refreshingToken = this.refreshToken();
      }
    }
  }

  refreshToken() {
    return Promise(resolve => {
      axios.post(this.tokenRefreshUrl, {
        token: this.getToken()
      }, this.config)
        .then(response => {
          const token = response.data.access_token;
          localStorage.set('Authorization', token);
          this.exp = this.decodeJWT().exp;
        })
        .catch(error => {
          localStorage.unset('Authorization');
        })
        .finally(() => {
          resolve();
        });
    })
  }

  useRequestThen(callback) {
    this.requestThen = callback;
  }

  useRequestCatch(callback) {
    this.requestCatch = callback;
  }

  axios() {
    return this.axiosInstance;
  }
}

module.exports = JWTAuthApi;
