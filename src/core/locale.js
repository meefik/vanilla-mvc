import State from './state';

export default class Locale extends State {
  /**
   * `Locale` class constructor.
   *
   * @constructor Locale
   * @extends State
   * @param {object} args Constructor parameters.
   * @param {object} args.locales Translations into desired languages.
   * @param {string} [args.lang] Default language.
   * @example
   * // create a new instance
   * var locales = { en: { hello: 'Hello' }, ru: { hello: 'Привет' } };
   * var l10n = new Locale({ locales, lang: 'en' });
   * // list of supported languages
   * l10n.state.languages; // ['en', 'ru']
   * // switch to localization 'ru'
   * l10n.update({ lang: 'ru' });
   */
  constructor({ locales = {}, lang }) {
    super();
    /**
     * @memberof Locale#
     * @name state
     * @type {object}
     * @property {string[]} languages Supported languages.
     * @property {string} lang Localization language.
     */
    this._locales = locales;
    this.update({ lang, languages: Object.keys(locales) });
  }
  /**
   * Update the language after updating the state.
   *
   * @private
   * @listens Locale#event:updated
   */
  events() {
    return {
      updated() {
        let { languages = [], lang } = this.state;
        lang = lang || navigator.language || 'en';
        if (languages.indexOf(lang) < 0) lang = languages[0];
        this.state.lang = lang;
      }
    };
  }
  /**
   * Get a translation into the selected language by key.
   *
   * @memberof Locale#
   * @param {string} path Key name.
   * @param {object} [data] Variables in the text as %{var}.
   * @returns {string} Localized text.
   */
  t(path, data = {}) {
    let value = this.getValue(path, this._locales[this.state.lang]);
    if (!value) return path;
    for (const k in data) {
      value = value.replace(`%{${k}}`, data[k]);
    }
    return value;
  }
}
