import Token from './Token';
import Api from './Api';

export default (refreshUrl, refreshTTL = 0) => {
  const token = new Token(refreshUrl, refreshTTL);
  return new Api(token);
}