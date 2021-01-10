import Router from './router';

export default class HashRouter extends Router {
  /**
   * `HashRouter` class constructor.
   *
   * @constructor HashRouter
   * @extends Router
   * @param {object} routes List of routes and views.
   */
  constructor(routes) {
    super(routes);
    window.addEventListener('hashchange', () => {
      if (!location.hash) return;
      const { path, params } = HashRouter.decodeQueryString(location.hash);
      super.show(path, params);
    });
  }
  /**
   * Show a view along the specified route.
   *
   * @memberof HashRouter#
   * @param {string} path Route path.
   * @param {object} params Route parameters.
   */
  show(path, params) {
    if (!path) path = this.state.path;
    if (path === location.hash) {
      const { path, params } = HashRouter.decodeQueryString(location.hash);
      super.show(path, params);
    } else {
      const hash = HashRouter.encodeQueryString(path, params);
      location.hash = hash;
    }
  }
  /**
   * Decode query string.
   *
   * @memberof HashRouter
   * @param {string} qs Query string.
   * @returns {object} Path and params.
   */
  static decodeQueryString(qs) {
    const params = {};
    const re = /[?&]([^=]+)=([^&]*)/g;
    let tokens = re.exec(qs);
    while (tokens) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
      tokens = re.exec(qs);
    }
    const match = /^([^?]+)/.exec(qs) || [];
    const path = decodeURIComponent(match[1] || '/');
    return { path, params };
  }
  /**
   * Encode query string.
   *
   * @memberof HashRouter
   * @param {string} path Query path.
   * @param {object} params Query parameters.
   * @returns {string} Query string.
   */
  static encodeQueryString(path, params) {
    const tokens = [];
    for (const k in params) {
      tokens.push(`${k}=${params[k]}`);
    }
    let qs = path || '/';
    if (tokens.length) {
      qs += `?${tokens.join('&')}`;
    }
    return qs;
  }
}
