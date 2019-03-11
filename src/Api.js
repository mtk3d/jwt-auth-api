import axios from 'axios';

export default class Api {
  constructor(token) {
    this.token = token;
    this.axiosInstance = axios.create(this.config);
    this._addAxiosTokenInterceptor();
    this.refreshingToken = Promise.resolve();
  }

  token() {
    return this.token;
  }

  axios() {
    return this.axiosInstance;
  }

  get(url, config = null) {
    return this._dispatch('get', url, config);
  }

  delete(url, config = null) {
    return this._dispatch('delete', url, config);
  }

  options(url, config = null) {
    return this._dispatch('options', url, config);
  }

  head(url, config = null) {
    return this._dispatch('head', url, config);
  }

  post(url, data = null, config = null) {
    return this._dispatch('post', url, config, data);
  }

  put(url, data = null, config = null) {
    return this._dispatch('put', url, config, data);
  }

  patch(url, data = null, config = null) {
    return this._dispatch('patch', url, config, data);
  }

  checkToken() {
    if (this.token.shouldRefresh()) {
      this.refreshingToken = this.token.refreshToken(this.axiosInstance);
    }
  }

  _dispatch(method, url, config, data = null) {
    this.checkToken();

    return new Promise((resolve, reject) => {
      this.refreshingToken
        .then(() => {
          this._requestResolve(method, url, config, data)
            .then(response => {
              resolve(response);
            })
            .catch(error => {
              reject(error);
            })
        })
    })
  }

  _requestResolve(method, url, config, data) {
    const dataMethods = ['post', 'put', 'patch'];
    const noDataMethods = ['get', 'delete', 'options', 'head'];

    if (dataMethods.includes(method)) {
      return this.axiosInstance[method](url, data, config)
    } else if (noDataMethods.includes(method)) {
      return this.axiosInstance[method](url, config);
    } else {
      throw new Exception('Invalid method');
    }
  }
  
  _addAxiosTokenInterceptor() {
    this.axiosInstance.interceptors.request
      .use(config => {
        const newConfig = config;
        const token = this.token.getToken();
        if (token && !this.token.isExpired()) {
          newConfig.headers.Authorization = token;
        }
        return newConfig;
      })
  }
}