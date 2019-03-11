import Token from './Entities/Token';
import Api from './Entities/Api';

export default class JWTAuthApi {
  constructor(config, refreshUrl, refreshTTL) {
    this.token = new Token(refreshUrl, refreshTTL);
    this.api = new Api(config, this.token);
  }

  token() {
    return this.token;
  }

  axios() {
    return this.api.axiosInstance;
  }

  get(url, config = {}) {
    return this.api.dispatch('get', url, config);
  }

  delete(url, config = {}) {
    return this.api.dispatch('delete', url, config);
  }

  options(url, config = {}) {
    return this.api.dispatch('options', url, config);
  }

  head(url, config = {}) {
    return this.api.dispatch('head', url, config);
  }

  post(url, data = {}, config = {}) {
    return this.api.dispatch('post', url, config, data);
  }

  put(url, data = {}, config = {}) {
    return this.api.dispatch('put', url, config, data);
  }

  patch(url, data = {}, config = {}) {
    return this.api.dispatch('patch', url, config, data);
  }
}