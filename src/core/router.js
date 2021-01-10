import State from './state';

export default class Router extends State {
  /**
   * `Router` class constructor.
   *
   * @constructor Router
   * @extends State
   * @param {object} routes List of routes and views.
   */
  constructor(routes) {
    super();
    this._routes = routes || {};
  }
  /**
   * Add a route for the view.
   *
   * @memberof Router#
   * @param {string} path Route path.
   * @param {string} view Route view.
   */
  add(path, view) {
    const { _routes } = this;
    _routes[path] = view;
  }
  /**
   * Delete a route.
   *
   * @memberof Router#
   * @param {string} path Route path.
   */
  del(path) {
    const { _routes } = this;
    delete _routes[path];
  }
  /**
   * Show a view along the specified route.
   *
   * @memberof Router#
   * @param {string} path Route path.
   * @param {object} params Route parameters (key: value).
   */
  show(path, params = {}) {
    const routes = this._routes;
    const state = this.state;
    const View = routes[path || state.path];
    if (!View) return;
    if (path === state.path && this._view) {
      this._view.params = params;
    } else {
      if (this._view) this._view.remove();
      this._view = typeof View === 'object' ? View : new View(params);
    }
    /**
     * @memberof Router#
     * @name state
     * @type {object}
     * @property {string} path Route path.
     * @property {object} params Route parameters.
     */
    this.update({ path, params });
  }
}
