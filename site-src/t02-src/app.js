/* =========================================================================
   TEMPLATE CONVERGENCE — shared helpers + budget hook + mounting.
   All projections are derived from canonical data (labeled), never invented.
   Integration copy: per-id public mount (?id=), T02 default.
   ========================================================================= */
import { loadAll } from './data.js';
import { renderTemplate } from './template.js';

export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function shortThesis(m, max) {
  const s = (m.summary || '').trim();
  if (!s) return '';
  const first = s.split('。')[0] + '。';
  const cap = max || 72;
  return first.length > cap ? first.slice(0, cap) + '…' : first;
}

/* primary directions: portal count = min(original directions, 3); 1 for sparse. */
export function primaryDirections(m) {
  const originals = m.directions.original || [];
  const plains = m.directions.plain || [];
  const count = Math.min(originals.length, 3);
  const list = [];
  for (let i = 0; i < count; i++) {
    const p = plains[i] || null;
    list.push({
      label: p ? p.term : (originals[i].text || '').slice(0, 12),
      oneLine: clip(p ? p.explanation : (originals[i].text || ''), 56),
      verified: originals[i].text,
      confidence: p ? p.confidence : originals[i].confidence,
    });
  }
  return list;
}
export function subTerms(m) {
  const plains = m.directions.plain || [];
  const count = Math.min((m.directions.original || []).length, 3);
  return plains.slice(count, 6).map(p => p.term);
}
export function undergradCompact(m) {
  const tasks = m.undergrad.tasks || [];
  return {
    taskChips: tasks.slice(0, 3).map(t => clip(t.task, 14)),
    taskCount: tasks.length,
    prereq: m.undergrad.prereq || [],
    learningCost: m.undergrad.learningCost,
    growth: m.undergrad.growthPath || [],
  };
}
export function pubsCompact(m) {
  return {
    count: (m.publications || []).length,
    featuredEmpty: (m.release.featuredIds || []).length === 0,
  };
}
function clip(s, n) {
  const t = String(s || '').trim();
  return t.length > n ? t.slice(0, n) + '…' : t;
}

export function trustLine(m) {
  return m.release.eligible
    ? '学院官网 + 学术数据库（已核验）'
    : '学院官网 + 学术数据库（评审视图）';
}

/* ---------- budget hook (content always visible; measure only) ---------- */
export function measureBudget() {
  requestAnimationFrame(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const vh = window.innerHeight, vw = window.innerWidth;
    let aboveFoldChars = 0, totalChars = 0;
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, null);
    let n;
    while ((n = walker.nextNode())) {
      const t = (n.nodeValue || '').trim();
      if (!t) continue;
      totalChars += t.length;
      const el = n.parentElement;
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0 && r.left < vw && r.right > 0 && r.width > 0 && r.height > 0) {
        aboveFoldChars += t.length;
      }
    }
    const level1Chars = (main.innerText || '').trim().length;
    window.__BUDGET__ = { aboveFoldChars, level1Chars, totalChars, vp: `${window.innerWidth}x${window.innerHeight}` };
  });
}

/* ---------- scrollspy (progressive; anchors work without it) ---------- */
export function initScrollspy() {
  const links = Array.from(document.querySelectorAll('.sec-nav a'));
  if (!links.length) return;
  const onScroll = () => {
    const pos = window.scrollY + 140;
    let cur = links[0].getAttribute('href').slice(1);
    for (const a of links) {
      const el = document.getElementById(a.getAttribute('href').slice(1));
      if (el && el.offsetTop <= pos) cur = a.getAttribute('href').slice(1);
    }
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- mounting ---------- */
const DENSITY = { t01: 'ULTRA-COMPACT', t02: 'BALANCED', t03: 'DETAILED-READABLE' };

function showLoading(root) {
  root.innerHTML = `<div class="profile-loading" aria-busy="true" aria-live="polite">
    <div class="profile-loading-bar" role="progressbar" aria-label="正在加载导师档案"></div>
    <p>正在加载导师档案…</p>
  </div>`;
}

export async function mountProfile() {
  const q = new URLSearchParams(location.search);
  const t = q.get('t') || 't02';
  const id = q.get('id') || '';
  const root = document.getElementById('root');
  showLoading(root);
  const { mentors } = await loadAll(id);
  const m = mentors[id];
  if (!m || !m.release.eligible) {
    root.innerHTML = `<div style="max-width:720px;margin:80px auto;padding:0 20px;font-family:Georgia,'Songti SC',serif;color:#1f1d1a">
      <h1 style="font-size:26px">该档案尚未公开</h1>
      <p>该档案不在已核验的公开导师范围内，或地址无效。</p>
    </div>`;
    return;
  }
  const html = renderTemplate(m, t, DENSITY[t] || DENSITY.t02);
  root.innerHTML = html;
  document.title = `${m.nameZh} · 导师档案`;
  if (q.get('debug') === 'budget') {
    measureBudget();
  }
  const runScrollspy = () => initScrollspy();
  if ('requestIdleCallback' in window) {
    requestIdleCallback(runScrollspy, { timeout: 500 });
  } else {
    requestAnimationFrame(runScrollspy);
  }
}
