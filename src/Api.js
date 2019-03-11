import axios from 'axios';

export default class Api {
  constructor(config, token) {
    this.token = token;
    this.config = config;
    this.axiosInstance = axios.create(this.config);
    this._addAxiosTokenInterceptor();
    this.refreshingToken = Promise.resolve();
    this.tokenIsRefreshing = false;
  }

  _checkToken() {
    if (this.token.shouldRefresh() && !this.tokenIsRefreshing) {
      this.tokenIsRefreshing = true;

      this.refreshingToken = this.token.refreshToken(this.axiosInstance);

      this.refreshingToken
        .then(() => {
          this.tokenIsRefreshing = false;
        });
    }
  }

  dispatch(method, url, config, data = null) {
    this._checkToken();

    return new Promise((resolve, reject) => {
      this.refreshingToken
        .then(token => {
          const newConfig = config;
          if (token) {
            if (newConfig.headers) {
              newConfig.headers.Authorization = token;
            } else {
              newConfig.headers = {
                Authorization: token
              };
            }
          }
          this._requestResolve(method, url, newConfig, data)
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
      throw new Error('Invalid method');
    }
  }
  
  _addAxiosTokenInterceptor() {
    this.axiosInstance.interceptors.request
      .use(config => {
        const newConfig = config;
        const token = this.token.getToken();
        if (token && !this.token.isExpired()) {
          newConfig.headers.Authorization = `Bearer ${token}`;
        }
        return newConfig;
      })
  }
}