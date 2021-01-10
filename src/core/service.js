import State from './state';

export default class Service extends State {
  /**
   * `Service` class constructor.
   *
   * @constructor Service
   * @extends State
   * @param {object} params Service parameters.
   * @param {object} params.url API server address.
   */
  constructor(params) {
    super();
    this._params = params || {};
  }
  /**
   * Read data from the server.
   *
   * @memberof Service#
   * @fires Service#event:updated
   * @param {string} [id] Record identifier.
   * @returns {Promise} Response data.
   */
  get(id) {
    const { url } = this._params;
    const params = Object.assign({}, this._params, {
      method: 'GET',
      url: `${url}${id ? '/' + id : ''}`
    });
    return Service.ajax(params).then(state => (this.state = state));
  }
  /**
   * Create data on the server.
   *
   * @memberof Service#
   * @fires Service#event:updated
   * @param {string} body Request body data.
   * @returns {Promise} Response data.
   */
  post(body) {
    const { url } = this._params;
    const params = Object.assign({}, this._params, {
      method: 'POST',
      url: `${url}`,
      body
    });
    return Service.ajax(params).then(state => (this.state = state));
  }
  /**
   * Update data on the server.
   *
   * @memberof Service#
   * @fires Service#event:updated
   * @param {string} id Record identifier.
   * @param {object} body Request body data.
   * @returns {Promise} Response data.
   */
  put(id, body) {
    const { url } = this._params;
    const params = Object.assign({}, this._params, {
      method: 'PUT',
      url: `${url}/${id}`,
      body
    });
    return Service.ajax(params).then(state => (this.state = state));
  }
  /**
   * Delete data from the server.
   *
   * @memberof Service#
   * @fires Service#event:updated
   * @param {string} id Record identifier.
   * @returns {Promise} Response data.
   */
  delete(id) {
    const { url } = this._params;
    const params = Object.assign({}, this._params, {
      method: 'DELETE',
      url: `${url}/${id}`
    });
    return Service.ajax(params).then(state => (this.state = state));
  }
  /**
   * Send an AJAX request to the server.
   *
   * @memberof Service
   * @fires Service#event:updated
   * @param {object} options AJAX request parameters.
   * @param {string} options.url Backend URL address.
   * @param {string} [options.method] Request method.
   * @param {boolean} [options.credentials] Include cookies in the request.
   * @param {object} [options.headers] Request headers (key: value).
   * @param {function} [options.progress] Progress callback.
   * @param {object} [options.body] Request body data.
   * @returns {Promise} Server response data.
   */
  static ajax(options = {}) {
    return new Promise((resolve, reject) => {
      const url = options.url;
      const method = options.method || (body ? 'POST' : 'GET');
      const credentials = options.credentials === true ? true : false;
      const headers = options.headers || {};
      const progress = options.progress;
      let body = options.body;
      if (body instanceof File) {
        const formData = new FormData();
        formData.append('upload', body);
        body = formData;
      } else if (typeof body === 'object') {
        headers['Content-Type'] = 'application/json; charset=utf-8';
        body = JSON.stringify(body);
      }
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      for (const header in headers) {
        xhr.setRequestHeader(header, headers[header]);
      }
      xhr.withCredentials = credentials;
      if (typeof progress === 'function') {
        xhr.upload.addEventListener('progress', progress, false);
      }
      xhr.onreadystatechange = function() {
        if (this.readyState !== this.DONE) return;
        if (this.status === 200) {
          try {
            const json = JSON.parse(this.responseText);
            return resolve(json);
          } catch (e) {
            return resolve(this.responseText);
          }
        } else {
          return reject(new Error(this.statusText || 'Request error'));
        }
      };
      xhr.send(body);
    });
  }
}
