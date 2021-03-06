// Convenience aliases and the `I18n` function.
var path = require('path'), I18n = module.exports = function I18n(path, language, locale) {
  return new I18n.prototype.initialize(path, language, locale);
};

// The current version of `node-i18n`. Keep in sync with `package.json`.
I18n.VERSION = '0.2';

// Default template settings; used in `I18n#interpolate`.
I18n.templateSettings = {
  'evaluate': /<%([\s\S]+?)%>/g,
  'interpolate': /<%=([\s\S]+?)%>/g
};

// Creates a new `I18n` instance.
I18n.prototype.initialize = function initialize(path, language, locale) {
  this.path = path;
  this.language = language;
  this.locale = locale;
  return this;
};

I18n.prototype.initialize.prototype = I18n.prototype;

// Imports the specified locale.
I18n.prototype.setLocale = function setLocale(language) {
  if (language != this.language) {
    this.language = language;
    this.locale = require(path.join(this.path, language)).all;
  }
  return this;
};

// Interpolates a template using the provided locale.
I18n.prototype.interpolate = function interpolate(item, context) {
  var result, property = item.split('.'), section, settings;

  while ((section = property.shift())) {
    result = (result || this.locale)[section];
    if (result == null) return '';
  }

  if (typeof context == 'object') {
    settings = I18n.templateSettings;
    // JavaScript micro-templating implementation; taken from Underscore.
    return Function('obj', 'var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push(\'' +
      result.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(settings.interpolate, function(match, code) {
           return "'," + code.replace(/\\'/g, "'") + ",'";
      }).replace(settings.evaluate || null, function(match, code) {
           return "');" + code.replace(/\\'/g, "'").replace(/[\r\n\t]/g, ' ') + "__p.push('";
      }).replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t') +
      "');}return __p.join('');"
    )(context);
  }

  return result;
};