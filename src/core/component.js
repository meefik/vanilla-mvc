import State from './state';

export default class Component extends State {
  /**
   * Get the root element of this component.
   *
   * @readonly
   * @memberof Component#
   * @type {HTMLElement}
   */
  get el() {
    return this._el;
  }
  /**
   * Check for the presence of the component in the DOM.
   *
   * @readonly
   * @memberof Component#
   * @type {boolean}
   */
  get mounted() {
    return !!this._el.parentNode;
  }
  /**
   * Component parameters.
   *
   * @memberof Component#
   * @type {object}
   */
  get params() {
    return this._params;
  }
  set params(newv) {
    const oldv = this._params;
    this._params = newv;
    /**
     * Component parameters changed.
     *
     * @event Component#changed
     * @type {object}
     */
    this.dispatchEvent('changed', oldv, newv);
  }
  /**
   * `Component` class constructor.
   *
   * @constructor Component
   * @extends State
   * @param {object} params Arbitrary component parameters.
   */
  constructor(params = {}) {
    super();
    this._params = params;
    this._template = this.compile();
    this._el = this.render();
    const events = this.events() || {};
    for (const e in events) {
      this._el.addEventListener(e, events[e], true);
    }
  }
  /**
   * The function returns the component template.
   *
   * @memberof Component#
   * @returns {string} Template text.
   */
  template() {
    return '';
  }
  /**
   * The function creates an HTML element.
   *
   * @memberof Component#
   * @returns {HTMLElement} HTML element.
   */
  render() {
    const el = this._el || document.createElement('div');
    el.innerHTML = this._template(this.state);
    return el;
  }
  /**
   * Mount the component to the DOM.
   *
   * @memberof Component#
   * @fires Component#mounted
   * @param {HTMLElement} [target=this.params.el] Where to mount.
   */
  mount(target = this._params.el) {
    if (target instanceof HTMLElement && !this.mounted) {
      target.appendChild(this._el);
      /**
       * Component has mounted.
       *
       * @event Component#mounted
       * @type {object}
       */
      this.dispatchEvent('mounted', target);
    }
  }
  /**
   * Remove the component from DOM.
   *
   * @memberof Component#
   * @fires Component#removed
   */
  remove() {
    if (this.mounted) {
      const parent = this._el.parentNode;
      this._el.remove();
      /**
       * Component has removed.
       *
       * @event Component#removed
       * @type {object}
       */
      this.dispatchEvent('removed', parent);
    }
  }
  /**
   * Add an event handler.
   *
   * @memberof Component#
   * @param {string} event Event name.
   * @param {function} cb Callback function.
   */
  on(event, cb) {
    if (!event || !cb) return;
    super.on(event, cb);
    if (this._el) {
      [].concat(event).forEach(ev => {
        if (!this._el) return;
        this._el.addEventListener(ev, cb, true);
      });
    }
  }
  /**
   * Remove an event handler.
   *
   * @memberof Component#
   * @param {string} event Event name.
   * @param {function} cb Callback function.
   */
  off(event, cb) {
    if (!event) return;
    super.off(event, cb);
    if (this._el) {
      [].concat(event).forEach(ev => {
        this._el.removeEventListener(ev, cb);
      });
    }
  }
  /**
   * Find the DOM element that triggered the event.
   *
   * @memberof Component#
   * @param {string} selector Element class.
   * @param {Event} e Event.
   */
  locate(selector, e) {
    if (!selector || !e) return;
    let path = e.path;
    if (!path) {
      path = [];
      let target = e.target;
      while (target.parentNode !== null) {
        path.push(target);
        target = target.parentNode;
      }
    }
    for (let i = 0; i < path.length; i++) {
      const el = path[i] || {};
      if (el instanceof Element !== true) continue;
      if (el.matches(selector)) return el;
    }
  }
  /**
   * Find child element.
   *
   * @memberof Component#
   * @param {string} selector A selector to find an element.
   * @param {HTMLElement} el The parent element to start the search from.
   * @returns {HTMLElement} Found element.
   */
  $(selector, el) {
    el = el || this._el;
    return el.querySelector(`.${selector}`);
  }
  /**
   * Find child elements.
   *
   * @memberof Component#
   * @param {string} selector A selector for finding elements.
   * @param {HTMLElement} el The parent element to start the search from.
   * @returns {HTMLElement[]} List of found elements.
   */
  $$(selector, el) {
    el = el || this._el;
    return el.querySelectorAll(`.${selector}`);
  }
  /**
   * Compile the template.
   *
   * @memberof Component
   * @param {string} [text=this.template()] Template text.
   * @param {object} [settings] Compilation options.
   */
  compile(text = this.template(), settings) {
    if (typeof text !== 'string') text = String(text);
    settings = Object.assign({}, settings || {}, {
      evaluate: /<%([\s\S]+?)%>/g,
      interpolate: /<%=([\s\S]+?)%>/g,
      escape: /<%-([\s\S]+?)%>/g
    });
    /* eslint-disable no-unused-vars */
    const escape = function(map) {
      const escaper = function(match) {
        return map[match];
      };
      const source = '(?:' + Object.keys(map).join('|') + ')';
      const testRegexp = new RegExp(source);
      const replaceRegexp = new RegExp(source, 'g');
      return function(string) {
        string = string == null ? '' : '' + string;
        return testRegexp.test(string)
          ? string.replace(replaceRegexp, escaper)
          : string;
      };
    };
    const noMatch = /(.)^/;
    const escapes = {
      '\'': '\'',
      '\\': '\\',
      '\r': 'r',
      '\n': 'n',
      '\u2028': 'u2028',
      '\u2029': 'u2029'
    };
    const escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;
    const escapeChar = function(match) {
      return '\\' + escapes[match];
    };
    const matcher = new RegExp(
      [
        (settings.escape || noMatch).source,
        (settings.interpolate || noMatch).source,
        (settings.evaluate || noMatch).source
      ].join('|') + '|$',
      'g'
    );
    const variable = settings.variable || 'state';
    let index = 0;
    let source = '__p+=\'';
    text.replace(matcher, function(
      match,
      escape,
      interpolate,
      evaluate,
      offset
    ) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;
      if (escape) {
        source += '\'+\n((__t=(' + escape + '))==null?\'\':escape(__t))+\n\'';
      } else if (interpolate) {
        source += '\'+\n((__t=(' + interpolate + '))==null?\'\':__t)+\n\'';
      } else if (evaluate) {
        source += '\';\n' + evaluate + '\n__p+=\'';
      }
      return match;
    });
    source += '\';\n';
    if (!settings.variable) source = 'with(state||{}){\n' + source + '}\n';
    source =
      'var __t,__p=\'\',__j=Array.prototype.join,' +
      'print=function(){__p+=__j.call(arguments,\'\');};\n' +
      source +
      'return __p;\n';
    let render;
    try {
      render = new Function(variable, source);
    } catch (e) {
      e.source = source;
      throw e;
    }
    const template = function(data) {
      return render.call(this, data);
    };
    template.source = 'function(' + variable + '){\n' + source + '}';
    return template;
  }
}
