# JWT Auth API

JS Axios based api library for managing JWT token authorization and refreshing.  
It's works fine with [tymondesigns/jwt-auth](https://github.com/tymondesigns/jwt-auth)

This library, just pause all requests if token is not alive, and refresh it if RefreshTTL is not expired.

## Creating JWTAuthApi object
``` JS
new JWTAuthApi(object: axiosConfig, string: refreshUrl, int: refreshTTL);
```
`axiosConfig` - is original config for axios. More about that, you can read [here](https://github.com/axios/axios#request-config)  
`refreshUrl` - is the url for endpoint where the library can get refreshed access token. [more](#refresh-token-endpoint-schema)  
`refreshTTL` - is time to left for refreshing token. 

## Configure
Create api.js file:
``` JS
import JWTAuthApi from 'jwt-auth-api';

const axiosConfig = {
  baseUrl: 'http://api.example.com',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  }
};

const api = new JWTAuthApi(axiosConfig, '/api/auth/refresh', 1209600);

api.axios().interceptors.response
  .use(
    response => response,
    error => console.error(error)
  );

export default api;  
export const JWTToken = api.token;
```
## Example usage
Fetch something from api:
``` JS
import api from './api.js';

api.get('/api/user/me')
  .then(response => {
    console.log(response.data.user);
  });
```
Set token from login:
``` JS
import api from './api.js';
import { JWTToken } from './api.js';

api.post('/api/auth/login', {
    username: 'user',
    password: 'password'
  }).then(response => {
    const token = response.data.access_token;
    JWTToken.setToken(token);
  });
```

## Refresh token endpoint schema
``` JSON
{
  // `access_token` is the JWT access token
  "access_token": "eyJ0eXAiOiJKV1QiLCJ...",

  // `expires_in` is not required, but can be in the feature
  "expires_in": 3600,

  // `token_type` is not required, but can be in the feature
  "token_type": "bearer",
  
}
```
## Requests methods
There are the same methods as you can use in regular [axios instance](https://github.com/axios/axios#instance-methods) except for the method `request`.

## TODO
- [ ] Add callback to refresh token
- [ ] Automatically get token from login request (and with callback)
- [ ] Add request axios method
- [ ] Write tests