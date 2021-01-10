export default class State {
  /**
   * Get and set the current state.
   *
   * @memberof State#
   * @type {object}
   * @fires State#updated
   */
  get state() {
    return this._state || {};
  }
  /**
   * @memberof State#
   * @fires State#updated
   */
  set state(newv) {
    const oldv = this._state || {};
    this._state = newv || {};
    /**
     * The event called after a state update.
     *
     * @event State#updated
     * @type {object}
     */
    this.dispatchEvent('updated', '', oldv, newv);
  }
  /**
   * `State` class constructor.
   *
   * @constructor State
   */
  constructor() {
    this._events = {};
    this._state = this.data() || {};
    const events = this.events() || {};
    for (const e in events) {
      this.on(e, events[e]);
    }
  }
  /**
   * Initial state data.
   *
   * @memberof State#
   * @returns {object} State data.
   */
  data() {}
  /**
   * List of event handlers.
   *
   * @memberof State#
   * @listens State#event:*
   * @returns {object} Event handlers in the format `event: function() {}`.
   */
  events() {}
  /**
   * Add an event handler.
   *
   * @memberof State#
   * @param {string} event Event name.
   * @param {function} cb Callback function.
   */
  on(event, cb) {
    if (!event || !cb) return;
    event = [].concat(event);
    event.forEach(ev => {
      if (!this._events[ev]) this._events[ev] = [];
      this._events[ev].push(cb);
    });
  }
  /**
   * Remove an event handler.
   *
   * @memberof State#
   * @param {string} event Event name.
   * @param {function} cb Callback function.
   */
  off(event, cb) {
    if (!event) return;
    event = [].concat(event);
    event.forEach(e => {
      if (!cb) delete this._events[e];
      var fn = this._events[e];
      if (fn) {
        var index = fn.indexOf(cb);
        if (index > -1) fn.splice(index, 1);
      }
    });
  }
  /**
   * Dispatch an event.
   *
   * @memberof State#
   * @param {string} event Event name.
   * @param {...any} [args] Event data.
   */
  dispatchEvent(event, ...args) {
    var cb = this._events[event];
    if (!cb) return;
    var promises = [];
    cb.forEach(item => promises.push(item.call(this, ...args)));
    return Promise.all(promises);
  }
  /**
   * Remove a specific field from the state.
   *
   * @memberof State#
   * @param {string} [path] State variable path.
   * @fires State#updated
   */
  delete(path) {
    if (!path) return;
    const oldv = this.clone();
    const { target, key } = this.getValue(path, this._state, true);
    if (Array.isArray(target)) target.splice(key, 1);
    else delete target[key];
    const newv = this._state;
    this.dispatchEvent('updated', path, oldv, newv);
  }
  /**
   * Update the state.
   *
   * @memberof State#
   * @param {string} [path] State variable path.
   * @param {*} newv New data.
   * @fires State#updated
   */
  update(path, newv) {
    if (!path) return;
    const oldv = this.clone();
    if (typeof path === 'object') {
      newv = path;
      for (const k in newv) {
        this._state[k] = newv[k];
      }
    } else {
      const { target, key } = this.getValue(path, this._state, true);
      target[key] = newv;
    }
    newv = this._state;
    this.dispatchEvent('updated', path, oldv, newv);
  }
  /**
   * Check the existence of a field in the state.
   *
   * @memberof State#
   * @param {string|string[]} path State variable path.
   * @param {object} [obj=this.state] Data object.
   * @returns {boolean} It exists or not.
   */
  exists(path, obj = this._state) {
    if (!obj || !path) return false;
    const arr = [].concat(path);
    for (let i = 0; i < arr.length; i++) {
      const { target, key } = this.getValue(arr[i], obj, true);
      if (Object.prototype.hasOwnProperty.call(target, key)) return true;
    }
    return false;
  }
  /**
   * Clone the state.
   *
   * @memberof State#
   * @param {string} [path] Data field path.
   * @param {object} [obj=this.state] Data object.
   * @returns {*} A copy of the state or part of it.
   */
  clone(path, obj = this._state) {
    if (path && obj) {
      obj = this.getValue(path, obj);
      return this.clone(false, obj);
    }
    if (typeof obj !== 'object' || obj === null || obj instanceof Date) {
      return obj;
    }
    const clone = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      const val = obj[key];
      if (typeof val !== 'undefined') {
        const copy = this.clone(false, val);
        if (typeof copy !== 'undefined') {
          clone[key] = copy;
        }
      }
    }
    return clone;
  }
  /**
   * Deep comparison of objects.
   *
   * @memberof State#
   * @param {object} newv New data object.
   * @param {object} [oldv=this.state] Old data object.
   * @returns {object} Changed data object.
   */
  diff(newv, oldv = this._state) {
    let diff;
    for (const key in newv) {
      if (typeof oldv[key] === 'undefined') {
        // added
        if (!diff) diff = Array.isArray(newv) ? [] : {};
        diff[key] = newv[key];
      }
    }
    for (const key in oldv) {
      if (typeof newv[key] === 'undefined') {
        // deleted
        if (!diff) diff = {};
        diff[key] = undefined;
      }
      if (
        typeof newv[key] !== 'undefined' &&
        typeof oldv[key] === 'object' &&
        oldv[key] !== null &&
        oldv[key] instanceof Date === false
      ) {
        if (!diff) diff = Array.isArray(newv) ? [] : {};
        diff[key] = this.diff(newv[key], oldv[key]);
        if (typeof diff[key] === 'undefined') {
          delete diff[key];
        }
      } else if (oldv[key] !== newv[key]) {
        // changed
        if (!diff) diff = Array.isArray(newv) ? [] : {};
        diff[key] = newv[key];
      }
    }
    return diff;
  }
  /**
   * Get a value from the object along its path.
   *
   * @memberof State#
   * @param {string} path Data field path.
   * @param {object} [obj=this.state] Data object.
   * @param {boolean} [strict=false] Return as structure (value, key, target).
   * @returns {*} Specified field data.
   */
  getValue(path, obj = this._state, struct = false) {
    if (!path || !obj) return;
    const val = path.split('.').reduce(
      function(o, k) {
        if (o.value) {
          return { value: o.value[k], key: k, target: o.value };
        }
      },
      { value: obj }
    );
    return struct ? val : val.value;
  }
  /**
   * Set a value to the object along its path.
   *
   * @memberof State#
   * @param {string} path Data field path.
   * @param {*} val Value to set.
   * @param {object} [obj=this.state] Data object.
   * @returns {object} Object data merged with the value.
   */
  setValue(path, val, obj = this._state) {
    if (!path || !obj) return;
    const arr = path.split('.');
    return arr.reduce(function(o, k, i) {
      if (i + 1 < arr.length) o[k] = {};
      else o[k] = val;
      return o[k];
    }, obj);
  }
}
