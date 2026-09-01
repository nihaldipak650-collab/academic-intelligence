(function () {
  'use strict';

  var STORAGE_KEY = 'physics-review-checklist-v1';

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  /* ── 侧栏：当前章节高亮 ── */
  function initSidebarSpy() {
    var links = $$('.sidebar-nav a[href^="#"]');
    if (!links.length) return;

    var sections = links
      .map(function (a) {
        var id = a.getAttribute('href').slice(1);
        var el = document.getElementById(id);
        return el ? { link: a, el: el } : null;
      })
      .filter(Boolean);

    function setActive(id) {
      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    }

    if ('IntersectionObserver' in window) {
      var visible = new Map();
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            visible.set(entry.target.id, entry.intersectionRatio);
          });
          var best = null;
          var bestRatio = 0;
          sections.forEach(function (s) {
            var r = visible.get(s.el.id) || 0;
            if (r > bestRatio) {
              bestRatio = r;
              best = s.el.id;
            }
          });
          if (best) setActive(best);
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5] }
      );
      sections.forEach(function (s) {
        observer.observe(s.el);
      });
    }

    links.forEach(function (a) {
      a.addEventListener('click', function () {
        var id = a.getAttribute('href').slice(1);
        setActive(id);
      });
    });
  }

  /* ── 跟着做：勾选进度存 localStorage ── */
  function initChecklist() {
    var saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (_) {}

    $$('.checklist-item input[type="checkbox"]').forEach(function (cb) {
      var id = cb.dataset.checkId;
      if (id && saved[id]) {
        cb.checked = true;
        cb.closest('.checklist-item').classList.add('is-done');
      }
      cb.addEventListener('change', function () {
        var item = cb.closest('.checklist-item');
        item.classList.toggle('is-done', cb.checked);
        saved[id] = cb.checked;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        } catch (_) {}
        updateChecklistProgress();
      });
    });
    updateChecklistProgress();
  }

  function updateChecklistProgress() {
    var boxes = $$('.checklist-item input[type="checkbox"]');
    if (!boxes.length) return;
    var done = boxes.filter(function (b) {
      return b.checked;
    }).length;
    var el = $('.checklist-progress');
    if (el) el.textContent = done + ' / ' + boxes.length + ' 步已完成';
  }

  /* ── 资料地图：简单筛选 ── */
  function initSearch() {
    var input = $('#site-search');
    if (!input) return;
    var rows = $$('.file-row, .material-card');
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      rows.forEach(function (row) {
        var text = row.textContent.toLowerCase();
        row.classList.toggle('is-hidden', q.length > 0 && text.indexOf(q) === -1);
      });
      $$('.material-grid').forEach(function (grid) {
        var visible = grid.querySelectorAll('.material-card:not(.is-hidden)').length;
        grid.classList.toggle('has-no-results', q.length > 0 && visible === 0);
      });
    });
  }

  /* ── 移动端侧栏 ── */
  function initMobileNav() {
    var toggle = $('.sidebar-toggle');
    var sidebar = $('.sidebar');
    if (!toggle || !sidebar) return;
    toggle.addEventListener('click', function () {
      var open = sidebar.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (
        sidebar.classList.contains('is-open') &&
        !sidebar.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        sidebar.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initMaterialsProbe() {
    var note = $('#materials-note');
    if (!note) return;
    var probe = '资料/03_历年真题/2026年上学期大学物理C（医用物理学）期中试卷.pdf';
    fetch(probe, { method: 'HEAD' })
      .then(function (res) {
        var ct = (res.headers.get('content-type') || '').toLowerCase();
        if (!res.ok || ct.indexOf('pdf') === -1) note.hidden = false;
      })
      .catch(function () {
        note.hidden = false;
      });
  }

  function isReadableMaterialHref(href) {
    if (!href || href.charAt(0) === '#' || /^https?:/i.test(href) || href.indexOf('..') !== -1) {
      return false;
    }
    return /\.(md|pdf|doc|docx)$/i.test(href.split('?')[0]);
  }

  function readerUrl(href) {
    return 'read.html?path=' + encodeURIComponent(href);
  }

  function initMaterialLinks() {
    document.addEventListener('click', function (event) {
      var anchor = event.target.closest('a[href]');
      if (!anchor || anchor.hasAttribute('data-raw-link')) return;
      var href = anchor.getAttribute('href');
      if (!isReadableMaterialHref(href)) return;
      event.preventDefault();
      window.open(readerUrl(href), '_blank', 'noopener');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSidebarSpy();
    initChecklist();
    initSearch();
    initMobileNav();
    initMaterialsProbe();
    initMaterialLinks();
  });
})();
