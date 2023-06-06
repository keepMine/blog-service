const hljs = require('highlight.js');
const Md = require('markdown-it')({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(str, {
            language: lang,
            ignoreIllegals: true
          }).value + '</code></pre>';
      } catch (__) { }
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});
module.exports = {
  Md
}