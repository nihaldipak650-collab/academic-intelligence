/* ============================================================
   MENTOR DIRECTORY CURATED VISUAL EXPLORATION — shared app logic.
   Accepted product structure (Overview + Category + Profile routing
   + real data + public/review boundary) across C01–C06.
   Variant = ?v=c01..c06 (body[data-variant]) — visual layer only.
   Copy is product language; boundary notes live in footer small print.
   ============================================================ */
(function () {
  'use strict';
  const D = window.DIRECTORY_DATA;
  if (!D) { return; }

  const VARIANT = (new URLSearchParams(window.location.search).get('v') || 'c01').replace(/[^a-z0-9]/g, '');
  document.body.dataset.variant = VARIANT;
  document.title = '导师目录 · ' + VARIANT.toUpperCase();

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const state = { mode: 'overview', reviewMode: true, mentorId: null, dirFilter: null, deptFilter: null, query: '', expandChips: false };

  /* Platform integration shim: ?public=1 forces PUBLIC-ONLY mode for
   * the V1 public mount. Review-only mentors stay filtered out and review
   * controls are hidden. Synthetic/review content never surfaces publicly. */
  const IS_PUBLIC = new URLSearchParams(window.location.search).get('public') === '1';
  if (IS_PUBLIC) state.reviewMode = false;
  const PUBLIC_URL_PREFIX = (new URLSearchParams(window.location.search).get('parent') || '');

  const visibleMentors = () => D.mentors.filter((m) => (state.reviewMode ? true : m.eligible));
  const mentorById = (id) => D.mentors.find((m) => m.id === id) || null;
  const deptCounts = (list) => { const c = {}; list.forEach((m) => { const s = m.deptShort || '其他'; c[s] = (c[s] || 0) + 1; }); return c; };
  const firstDir = (m) => m.primaryDirection || '—';
  const yearRange = (m) => (m.years && m.years.length ? m.years[m.years.length - 1] + '–' + m.years[0] : '证据整理中');
  const pad = (n) => String(n).padStart(2, '0');

  function parseHash() {
    const h = window.location.hash.replace(/^#\/?/, '');
    if (h.startsWith('mentor/')) return { mode: 'profile', mentorId: h.slice(7) };
    if (h === 'category') return { mode: 'category' };
    return { mode: 'overview' };
  }
  function applyRoute(r) {
    state.mode = r.mode;
    state.mentorId = r.mentorId || null;
    document.body.className = 'route-' + state.mode;
    render();
    window.scrollTo({ top: 0 });
  }

  function renderChrome() {
    document.getElementById('mode-overview').setAttribute('aria-pressed', String(state.mode === 'overview'));
    document.getElementById('mode-category').setAttribute('aria-pressed', String(state.mode === 'category'));
    if (IS_PUBLIC) {
      const rt = document.querySelector('.reviewtoggle');
      if (rt) rt.style.display = 'none';
    } else {
      document.getElementById('rev-on').setAttribute('aria-pressed', String(state.reviewMode));
      document.getElementById('rev-off').setAttribute('aria-pressed', String(!state.reviewMode));
    }
    const note = document.getElementById('tb-note');
    note.textContent = IS_PUBLIC || !state.reviewMode ? `公开导师 ${D.publicCount} 位` : `导师档案 ${D.reviewCount} · 公开 ${D.publicCount} · 评审中 ${D.reviewOnlyCount}`;
    const foot = document.getElementById('foot-count');
    if (foot) foot.textContent = state.reviewMode ? `${D.reviewCount} · 评审 ${D.reviewOnlyCount}` : `${D.publicCount} · 公开`;
  }

  function mastHtml(kicker, title, lead, statsHtml, big) {
    return `<div class="mast">
      <div class="mast-in">
        <div class="mast-k">${kicker}</div>
        <div class="mast-hero">
          <h1 class="mast-title">${title}</h1>
          <p class="mast-lead">${lead}</p>
        </div>
        <div class="mast-stats">${statsHtml}</div>
      </div>
      ${big ? `<span class="mast-big" aria-hidden="true">${big}</span>` : ''}
    </div>`;
  }

  function rowHtml(m, i) {
    const reviewOnly = !m.eligible;
    const metaLine = [m.position, m.deptShort].filter(Boolean).join(' · ');
    const delay = Math.min((i - 1) * 32, 320);
    return `<a class="mrow ${reviewOnly ? 'review-only' : ''}" href="${IS_PUBLIC ? '#' : '#/mentor/' + esc(m.id)}" data-mentor="${esc(m.id)}" style="animation-delay:${delay}ms">
      <span class="mrow-num">${pad(i)}</span>
      <span class="mrow-dir"><small>研究方向</small><span class="y">${esc(firstDir(m))}</span></span>
      <span class="mrow-who">${esc(m.nameZh)}${m.nameEn ? '<i>' + esc(m.nameEn) + '</i>' : ''}</span>
      <span class="mrow-meta"><span class="mrow-years">${esc(yearRange(m))}</span><br><span>${esc(metaLine)}</span></span>
      ${reviewOnly ? '<span class="mrow-st">评审中</span>' : '<span class="mrow-arrow" aria-hidden="true">→</span>'}
    </a>`;
  }
  const emptyHtml = (title, note, fn) => `<div class="empty"><b>${esc(title)}</b><p>${esc(note)}</p><button onclick="window.${fn}()">清除筛选</button></div>`;
  window.resetOverview = function () { state.dirFilter = null; state.query = ''; const q = document.getElementById('ov-q'); if (q) q.value = ''; render(); };

  function bindChips(containerId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.querySelectorAll('.chip[data-chip]').forEach((b) => {
      b.addEventListener('click', () => {
        if (containerId === 'ov-chips') { state.dirFilter = b.dataset.chip || null; render(); }
        else { state.deptFilter = b.dataset.chip || null; render(); }
      });
    });
    c.querySelectorAll('.chip[data-expand]').forEach((b) => {
      b.addEventListener('click', () => { state.expandChips = true; render(); });
    });
  }
  function bindRailChips() {
    document.querySelectorAll('.rail a[data-chip]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        state.dirFilter = a.dataset.chip || null;
        state.query = '';
        const q = document.getElementById('ov-q'); if (q) q.value = '';
        render();
      });
    });
  }

  function renderOverview() {
    document.body.classList.toggle('filter-active', !!(state.dirFilter || state.query));
    const list = visibleMentors();
    const counts = {};
    list.forEach((m) => { const d = firstDir(m); counts[d] = (counts[d] || 0) + 1; });
    const dirTerms = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    const q = state.query.trim().toLowerCase();
    const shown = list.filter((m) => {
      if (state.dirFilter && firstDir(m) !== state.dirFilter) return false;
      if (!q) return true;
      return m.searchTerms.toLowerCase().includes(q) || firstDir(m).toLowerCase().includes(q);
    });

    document.getElementById('ov-list').innerHTML = `
      ${mastHtml(
        '<span class="dot"></span> 导师总览 <span class="dot"></span> Academic Intelligence · 2026',
        '导师<span class="y">总览</span><br>先看研究什么，再看是谁。',
        '学院有哪些导师、他们主要研究什么。按研究方向浏览，研究方向是每条档案的第一信息。',
        `
          <div class="mast-stat"><b>${state.reviewMode ? D.reviewCount : D.publicCount}</b><span>位导师</span></div>
          <div class="mast-stat"><b>${D.publicCount}</b><span>位公开导师</span></div>
          ${state.reviewMode ? `<div class="mast-stat"><b>${D.reviewOnlyCount}</b><span>份评审中档案</span></div>` : ''}
          <div class="mast-stat"><b>${D.departments.length}</b><span>个系</span></div>
          <div class="mast-stat"><b>${dirTerms.length}</b><span>个研究主题</span></div>
        `,
        pad(list.length)
      )}
      <details class="guide">
        <summary>如何使用 Academic Intelligence · 当前版本说明</summary>
        <div class="guide-body">
          <p class="guide-k">现在能做什么</p>
          <ul>
            <li>按研究方向浏览导师（先看研究什么，再看是谁）。</li>
            <li>按系查看导师，快速找到本系有哪些导师和方向。</li>
            <li>搜索导师姓名 / 研究方向 / 关键词。</li>
            <li>打开导师档案：研究方向、公开成果、本科生参与、联系（官方主页）。</li>
          </ul>
          <p class="guide-k">适合怎么用</p>
          <p class="guide-p">先想清楚自己关心的方向 → 在总览按方向筛选 → 点进档案判断适不适合自己。不需要一次看完所有导师。</p>
          <p class="guide-k">哪些功能还在试用</p>
          <ul>
            <li>研究方向解释为 AI 整理，标注「AI 整理」，仅供参考。</li>
            <li>联系 / 咨询、申请参与等功能尚未开放。</li>
            <li>新增导师与更细的筛选将逐步开放。</li>
          </ul>
          <p class="guide-k">信息边界</p>
          <p class="guide-p">档案内容来自学院公开页面与公开论文；AI 整理内容有标注，不代表导师原话或承诺。当前公开 11 位导师；其余档案在整理中，暂不开放。</p>
          <p class="guide-k">当前版本</p>
          <p class="guide-p">试用版（公开 11 位导师）。后续更新会在此说明。</p>
        </div>
      </details>
      <div class="ov-grid">
        <aside class="rail">
          <h4>导师总览</h4>
          <a class="rlink" href="#/category">按系查看导师 <b>${D.departments.length} 个系 →</b></a>
          <span class="rr"></span>
          <h4>研究方向速览</h4>
          ${dirTerms.slice(0, 6).map((t, ti) => `<a class="rlink" href="#" data-chip="${esc(t)}"><span class="rn">${pad(ti + 1)}</span> ${esc(t)} <b>${counts[t]}</b></a>`).join('')}
          <span class="rr"></span>
          <span class="rnote">研究主题按导师档案整理。</span>
          <span class="rann">导师档案 · 2026</span>
        </aside>
        <div>
          <div class="ov-tools">
            <div class="ov-search-wrap">
              <svg class="ov-search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="6.8" cy="6.8" r="4.6"></circle><path d="M10.4 10.4 L14 14"></path></svg>
              <input class="ov-search" id="ov-q" type="search" aria-label="搜索研究方向 / 姓名 / 关键词" placeholder="搜索研究方向 / 姓名 / 关键词" value="${esc(state.query)}">
            </div>
            <div class="ov-chips" id="ov-chips">
              <button class="chip" data-chip="" aria-pressed="${state.dirFilter ? 'false' : 'true'}">全部 <span class="n">${list.length}</span></button>
              ${(state.expandChips ? dirTerms : dirTerms.slice(0, 6)).map((t) => `<button class="chip" data-chip="${esc(t)}" aria-pressed="${state.dirFilter === t ? 'true' : 'false'}">${esc(t)} <span class="n">${counts[t]}</span></button>`).join('')}
              ${dirTerms.length > 6 && !state.expandChips ? `<button class="chip" data-expand="1" aria-pressed="false">展开更多 ${dirTerms.length - 6} 个方向 <span class="n">+</span></button>` : ''}
            </div>
            <p class="ov-tools-note" title="研究主题按已收录导师档案整理，点击可筛选">研究方向速览 · 从这些主题开始看 — 公开档案 ${D.publicCount} 份${state.reviewMode ? ` + 评审中 ${D.reviewOnlyCount} 份` : ''}</p>
          </div>
          <div id="ov-rows">
            ${shown.map((m, i) => rowHtml(m, i + 1)).join('') || emptyHtml('没有找到匹配的导师', '换个关键词，或按系查看导师。', 'resetOverview')}
            <p class="mrow-count">共 ${shown.length} 位导师${state.reviewMode ? ' · 评审中档案以虚线描边区分' : ''}</p>
          </div>
        </div>
      </div>`;
    bindChips('ov-chips');
    const qEl = document.getElementById('ov-q');
    if (qEl) qEl.addEventListener('input', (e) => { state.query = e.target.value; render(); });
    bindRailChips();
  }

  function renderCategory() {
    const list = visibleMentors();
    document.body.classList.toggle('filter-active', !!state.deptFilter);
    const counts = deptCounts(list);
    const depts = D.departments.map((d) => ({ ...d, count: counts[d.id] || 0 }));
    const active = state.deptFilter;
    document.getElementById('cat-list').innerHTML = `
      ${mastHtml(
        '<span class="dot"></span> 按系查看导师 <span class="dot"></span> Academic Intelligence · 2026',
        '按<span class="y">系</span>找导师',
        '四个系，十一份公开导师档案。选一个系，看看里面有哪些导师和方向。',
        `
          <div class="mast-stat"><b>${depts.length}</b><span>个系</span></div>
          <div class="mast-stat"><b>${state.reviewMode ? D.reviewCount : D.publicCount}</b><span>位导师</span></div>
          <div class="mast-stat"><b>${D.publicCount}</b><span>位公开导师</span></div>
        `,
        String(depts.length)
      )}
      <div class="cat-chips" id="cat-chips">
        <button class="chip" data-chip="" aria-pressed="${active ? 'false' : 'true'}">全部系 <span class="n">${list.length}</span></button>
        ${depts.map((d) => `<button class="chip" data-chip="${esc(d.id)}" aria-pressed="${active === d.id ? 'true' : 'false'}">${esc(d.label)} <span class="n">${d.count}</span></button>`).join('')}
      </div>
      ${depts.map((d, si) => chapterHtml(d, si + 1, list.filter((m) => (m.deptShort || '其他') === d.id), active)).join('')}
      <p class="chap-foot-note">按系查看导师 · 更多筛选方式将逐步开放</p>`;
    bindChips('cat-chips');
  }

  function chapterHtml(d, si, rows, active) {
    const hidden = active && active !== d.id;
    return `<section class="chap" data-hidden="${hidden}" id="chap-${esc(d.id)}">
      <header class="chap-head">
        <span class="chap-no">${pad(si)}</span>
        <h2>${esc(d.label)}<span class="en">${rows.length} 位导师</span></h2>
        <span class="cnt">${rows.length} 位</span>
      </header>
      <div class="chap-rows">
        ${rows.map((m, i) => rowHtml(m, i + 1)).join('')}
      </div>
    </section>`;
  }

  function renderProfile() {
    const m = mentorById(state.mentorId);
    document.getElementById('prof-list').innerHTML = `
      <a class="prof-back" href="#/overview">← 返回目录</a>
      ${!m ? `<div class="empty"><b>未找到该导师档案</b><p>档案 id 无效，或该档案不可见。</p></div>` : profileHtml(m)}`;
  }
  function profileHtml(m) {
    const blocked = !state.reviewMode && !m.eligible;
    const terms = (m.plain || []).filter((p) => p.term);
    return `<article class="prof">
      <header class="prof-head">
        <div class="prof-k">Academic Intelligence · 导师档案 · ${m.eligible ? '公开' : '评审中'}</div>
        <h1>${esc(m.nameZh)}${m.nameEn ? '<i>' + esc(m.nameEn) + '</i>' : ''}</h1>
        <p class="prof-role">${esc(m.position)} · ${esc(m.deptShort || m.deptFull || '')}</p>
        <p class="prof-dir">研究方向 · ${esc(firstDir(m))}</p>
      </header>
      ${blocked ? `<div class="empty"><b>该档案尚未公开</b><p>公开模式下不可见；切回「评审模式」可查看。</p></div>` : `
        <section class="prof-block">
          <h3>一句话认识</h3>
          <p>${esc(m.summary || '暂无官方摘要（不虚构）。')}</p>
          <div class="prof-meta">
            ${(m.tags || []).map((t) => `<span class="prof-tag">${esc(t)}</span>`).join('')}
            <span class="prof-tag">${esc(m.deptShort || '')}</span>
            <span class="prof-tag">${esc(yearRange(m))}</span>
          </div>
        </section>
        ${terms.length ? `<section class="prof-block">
          <h3>研究方向</h3>
          ${terms.map((p) => `<div class="prof-term">
            <h4>${esc(p.term)}</h4>
            ${p.explanation ? '<p>' + esc(p.explanation) + '</p>' : '<p>解释待补充。</p>'}
            ${p.undergrad ? '<p class="ug">本科生入口 · ' + esc(p.undergrad) + '</p>' : ''}
          </div>`).join('')}
        </section>` : ''}
        <p class="prof-boundary">${esc(m.boundary || '')}</p>
      `}
    </article>`;
  }

  function render() {
    renderChrome();
    renderOverview();
    renderCategory();
    renderProfile();
  }

  document.getElementById('mode-overview').addEventListener('click', () => { window.location.hash = '#/overview'; });
  document.getElementById('mode-category').addEventListener('click', () => { window.location.hash = '#/category'; });
  document.getElementById('rev-on').addEventListener('click', () => { state.reviewMode = true; render(); });
  document.getElementById('rev-off').addEventListener('click', () => { state.reviewMode = false; render(); });
  /* Platform integration shim: in PUBLIC mode, mentor rows route to the parent
   * platform's T02 profile surface (#/academic/mentor/<id>). */
  if (IS_PUBLIC) {
    document.addEventListener('click', function (ev) {
      const a = ev.target.closest ? ev.target.closest('a.mrow[data-mentor]') : null;
      if (a) { ev.preventDefault(); window.parent.location.hash = '#/academic/mentor/' + encodeURIComponent(a.dataset.mentor); }
    });
  }
  window.addEventListener('hashchange', () => applyRoute(parseHash()));
  applyRoute(parseHash());
})();
