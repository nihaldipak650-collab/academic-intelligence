(function () {
  'use strict';

  var ALLOWED_PREFIXES = ['资料/', 'docs/'];
  var MATH_DELIMS = [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
  ];

  function basename(path) {
    var parts = path.split('/');
    return parts[parts.length - 1] || path;
  }

  function isAllowedPath(path) {
    if (!path || path.indexOf('..') !== -1 || /^https?:/i.test(path)) return false;
    return ALLOWED_PREFIXES.some(function (prefix) {
      return path.indexOf(prefix) === 0;
    });
  }

  function extname(path) {
    var match = path.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : '';
  }

  function setTitle(name) {
    document.title = name + ' · 物理补考';
    var el = document.getElementById('read-title');
    if (el) el.textContent = name;
  }

  function setActions(html) {
    var el = document.getElementById('read-actions');
    if (el) el.innerHTML = html;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showError(message) {
    var main = document.getElementById('read-main');
    if (main) {
      main.innerHTML = '<p class="read-error">' + escapeHtml(message) + '</p>';
    }
  }

  function actionButton(label, href, primary, downloadName) {
    var cls = 'read-btn' + (primary ? ' read-btn--primary' : '');
    var attrs = 'class="' + cls + '" href="' + escapeHtml(href) + '"';
    if (downloadName) attrs += ' download="' + escapeHtml(downloadName) + '"';
    return '<a ' + attrs + ' rel="noopener">' + escapeHtml(label) + '</a>';
  }

  function renderMarkdown(path) {
    setActions(
      actionButton('下载原文', path, false, basename(path)) +
        actionButton('新标签打开', path, false),
    );

    fetch(path)
      .then(function (res) {
        if (!res.ok) throw new Error('文件不存在或暂时无法读取');
        return res.text();
      })
      .then(function (text) {
        var main = document.getElementById('read-main');
        if (!main) return;
        var html = marked.parse(text, { gfm: true, breaks: false });
        main.innerHTML = '<article class="read-prose">' + html + '</article>';
        if (window.renderMathInElement) {
          renderMathInElement(main, {
            delimiters: MATH_DELIMS,
            throwOnError: false,
          });
        }
        enhanceReaderLinks(main);
      })
      .catch(function (err) {
        showError(err.message || 'Markdown 加载失败');
      });
  }

  function renderPdf(path) {
    setActions(
      actionButton('下载 PDF', path, true, basename(path)) +
        actionButton('新标签预览', path, false),
    );
    var main = document.getElementById('read-main');
    if (!main) return;
    main.textContent = '';
    var frame = document.createElement('iframe');
    frame.className = 'read-frame';
    frame.title = 'PDF 预览';
    frame.src = path;
    main.appendChild(frame);
  }

  function renderDoc(path) {
    var name = basename(path);
    setActions(actionButton('下载试卷', path, true, name));
    var main = document.getElementById('read-main');
    if (!main) return;
    main.innerHTML =
      '<div class="read-download-card">' +
      '<h1>' + escapeHtml(name) + '</h1>' +
      '<p>这是 Word 试卷文件，浏览器不能直接预览。<br>请下载后用 WPS 或 Microsoft Word 打开。</p>' +
      actionButton('下载试卷', path, true, name) +
      '</div>';
  }

  function enhanceReaderLinks(root) {
    root.querySelectorAll('a[href]').forEach(function (anchor) {
      var href = anchor.getAttribute('href');
      if (!href || href.indexOf('..') !== -1 || /^https?:/i.test(href) || href.charAt(0) === '#') {
        return;
      }
      var ext = extname(href);
      if (ext === 'md' || ext === 'pdf' || ext === 'doc' || ext === 'docx') {
        anchor.setAttribute('href', 'read.html?path=' + encodeURIComponent(href));
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener');
      }
    });
  }

  function boot() {
    var params = new URLSearchParams(window.location.search);
    var path = params.get('path');
    if (!path || !isAllowedPath(path)) {
      showError('资料路径无效，请从速成站重新打开。');
      return;
    }

    var name = basename(path);
    setTitle(name);
    var ext = extname(path);

    if (ext === 'md') renderMarkdown(path);
    else if (ext === 'pdf') renderPdf(path);
    else if (ext === 'doc' || ext === 'docx') renderDoc(path);
    else showError('暂不支持这种文件格式。');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
