/* =========================================================================
   TEMPLATE CONVERGENCE — single template family renderer.
   Prototype B structure/typography/rhythm with REAL Academic Intelligence data.
   Density parameter: t01 ultra-compact / t02 balanced / t03 detailed-readable.
   Sections: header → sec-nav → directions → outputs → trajectory → undergrad
             → evidence → contact (reference order, honest naming).
   ========================================================================= */
import { esc, shortThesis, primaryDirections, subTerms, undergradCompact, pubsCompact, trustLine } from './app.js';

export function renderTemplate(m, t, densityName) {
  const dirs = primaryDirections(m);
  const subs = subTerms(m);
  const ug = undergradCompact(m);
  const pc = pubsCompact(m);
  const review = !m.release.eligible;
  const pubs = m.publications || [];
  const c = m.contact;

  const heroIntro = t === 't01' ? shortThesis(m, 44) : t === 't02' ? shortThesis(m, 72) : shortThesis(m, 92);
  const statsN = dirs.length;

  /* ---------- 研究方向 ---------- */
  const dirCells = dirs.map((d, i) => {
    const subsHere = t === 't03' && i === 0 ? subs : [];
    const more = t !== 't01' ? `
      <details class="dir-more-wrap">
        <summary class="dir-more">研究问题 · 方法 · 流程 <span class="twist">▾</span></summary>
        <div class="dir-deep">
          ${deepGroup('研究问题', m.research.questions)}
          ${deepGroup('主要方法', m.research.techniques)}
          ${deepGroup('研究流程', m.research.workflow)}
          <p class="note">以上为公开资料整理（基于已采纳论文），不代表导师原话。</p>
        </div>
      </details>` : '';
    return `<article class="dir-card">
      <h3>${esc(d.label)}</h3>
      <p>${esc(d.oneLine)}</p>
      ${subsHere.length ? `<div class="dir-subs">${subsHere.map(s => `<span>${esc(s)}</span>`).join('')}</div>` : ''}
      ${more}
    </article>`;
  }).join('');

  /* ---------- 已核验成果 ---------- */
  const pubRows = pubs.slice(0, t === 't01' ? 2 : t === 't02' ? 3 : 5).map(p => {
    const volIssPages = (p.volume && p.issue && p.pages) ? `${p.volume}(${p.issue}):${p.pages}` : (p.pages ? p.pages : null);
    const bits = [];
    if (p.identityVerified) bits.push('身份已核验');
    if (p.corresponding) bits.push('通讯作者');
    if (p.versionGroup) bits.push('版本已去重');
    const meta = t === 't01' ? '' : `
      <div class="meta">
        <span>${esc(p.year)}</span>
        ${volIssPages ? `<span>${esc(volIssPages)}</span>` : ''}
        ${bits.map(b => `<span>${esc(b)}</span>`).join('')}
        ${p.doi ? `<a class="doi" href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener noreferrer">DOI ↗</a>` : ''}
      </div>`;
    return `
      <details class="pub-item">
        <summary class="pub-head">
          <span class="pub-type">论文</span>
          <h3>${esc(p.title)}</h3>
          <span class="pub-venue">${esc(p.venue || '')}</span>
          <span class="pub-toggle">详情</span>
        </summary>
        <div class="pub-detail">
          ${t === 't01' ? '' : `<p>${esc(p.year)} · ${esc(p.venue || '未记录期刊')}${volIssPages ? ' · ' + esc(volIssPages) : ''}</p>`}
          ${meta}
        </div>
      </details>`;
  }).join('');

  /* ---------- 研究发展脉络 (phase bands + grounded Chinese narrative + expandable evidence) ---------- */
  const dirNames = (m.directions.original || []).map(d => String(d.text || '').split('；')[0]).filter(Boolean).slice(0, 3);
  const trajectoryIntro = dirNames.length
    ? `近年公开成果主要集中在「${dirNames.join('」「')}」等方向（按公开研究方向与论文整理）。`
    : '以下为已核验公开成果的年份归纳。';
  const sortedPubs = (pubs || []).slice().sort((a, b) => (a.year || 0) - (b.year || 0));
  const phaseCount = Math.min(3, Math.max(1, Math.ceil(sortedPubs.length / 2)));
  const phaseSize = Math.ceil(sortedPubs.length / phaseCount);
  const phases = [];
  for (let i = 0; i < phaseCount && sortedPubs.length; i++) {
    const band = sortedPubs.slice(i * phaseSize, (i + 1) * phaseSize);
    if (!band.length) continue;
    const ys = band.map(p => p.year).filter(Boolean);
    const label = ys.length ? (ys[0] === ys[ys.length - 1] ? String(ys[0]) : ys[0] + '–' + ys[ys.length - 1]) : '年份未详';
    phases.push({ label, items: band });
  }
  const phaseBands = phases.map(ph => `
    <div class="traj-phase">
      <div class="traj-year">${esc(ph.label)}</div>
      <p class="traj-sum">公开成果 ${ph.items.length} 篇，围绕「${dirNames.join('」「') || '相关方向'}」等方向展开（按公开研究方向整理）。</p>
      <details class="traj-ev">
        <summary>查看依据（公开论文）</summary>
        <div class="traj-ev-body">
          ${ph.items.map(p => `
            <div class="traj-item"><div class="traj-title">${esc(p.title)}</div>
              <div class="traj-meta">${esc(p.venue || '未记录期刊')}${p.doi ? ` · <a class="doi" href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener noreferrer">DOI ↗</a>` : ''}</div>
            </div>`).join('')}
        </div>
      </details>
    </div>`).join('');

  const growthItems = t === 't03' && ug.growth.length ? `
    <div class="growth-list">
      ${ug.growth.map(g => `
        <div class="growth-item">
          <span class="growth-y">${esc(stageName(g.stage))}</span>
          <div><h3>${esc((g.activities || []).join(' / '))}</h3><p>产出：${esc((g.outputs || []).join(' · '))}</p></div>
        </div>`).join('')}
    </div>` : '';

  /* ---------- 本科生可以做什么 ---------- */
  const taskCards = (t === 't01' ? ug.taskChips && m.undergrad.tasks.slice(0, 2) : m.undergrad.tasks.slice(0, 3)).map((tk, i) => `
    <article class="task-card">
      <span class="task-badge">任务 ${String(i + 1).padStart(2, '0')}</span>
      <h3>${esc(tk.task)}</h3>
      <p class="task-purpose">${esc(tk.purpose || '')}</p>
      <details class="task-detail">
        <summary class="task-cta">查看具体怎么做</summary>
        <div class="task-detail-body">
          ${tk.methods && tk.methods.length ? `<p class="task-k">需要先会</p><ul class="task-ul">${tk.methods.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
          ${((ug.prereq && ug.prereq.length) || (m.research && m.research.techniques && m.research.techniques.length)) ? `
            <p class="task-k">建议补</p>
            <ul class="task-ul">
              ${(ug.prereq || []).slice(0, 3).map(p => `<li>${esc(p.text)}</li>`).join('')}
              ${(m.research && m.research.techniques || []).slice(0, 3).map(x => `<li>${esc(x.text)}</li>`).join('')}
            </ul>
            <p class="task-note">通用入门建议，不代表该实验室具体要求。</p>` : ''}
          ${tk.output ? `<p class="task-k">可以产出</p><p class="task-out">${esc(tk.output)}</p>` : ''}
          ${tk.note ? `<p class="task-note">${esc(tk.note)}</p>` : ''}
        </div>
      </details>
    </article>`).join('');

  const prepRow = t !== 't01' && ug.prereq.length ? `
    <div class="prep-row"><span class="prep-k">入门建议</span>
      ${ug.prereq.slice(0, t === 't02' ? 2 : 3).map(p => `<span class="prep-chip">${esc(p.text)}</span>`).join('')}
      ${ug.learningCost ? `<span class="prep-chip">${esc(ug.learningCost.text)}</span>` : ''}
    </div>` : '';

  /* ---------- 证据 ---------- */
  const evItems = t === 't01' ? `<div class="ev-item"><span class="ev-k">来源</span><h3>学院官网 + 学术数据库</h3><p>${esc(trustLine(m))}</p></div>`
    : `
      <div class="ev-item"><span class="ev-k">身份信息</span><h3>${esc(m.release.identityStatus === 'verified' ? '已核验' : '核验中')}</h3><p>姓名 · 职称 · 院系 · 导师资格来自学院官方页面。</p></div>
      <div class="ev-item"><span class="ev-k">论文信息</span><h3>已核验 ${pc.count} 篇</h3><p>题名与年份经 Crossref / DOI 交叉核验，年份以正式卷期为准。</p></div>
      <div class="ev-item"><span class="ev-k">整理说明</span><h3>公开资料整理</h3><p>方向解释与任务建议基于官方方向与已采纳论文；内容不代表导师原话或承诺。</p></div>`;

  const evTech = review && t === 't03' ? `
    <details class="ev-tech">
      <summary>评审详情（仅评审视图可见） <span class="twist">▾</span></summary>
      <div class="ev-tech-body">
        <p>publication_status: <code>${esc(m.release.publicationStatus || '—')}</code> · release_eligible: <code>${String(m.release.eligible)}</code></p>
        <p>identity: <code>${esc(m.release.identityStatus || '—')}</code> · evidence: <code>${esc(m.release.evidenceStatus || '—')}</code> · confidence: <code>${esc(m.release.confidence || '—')}</code></p>
        <p>featured: <code>${m.release.featuredIds.length ? m.release.featuredIds.join(',') : '[]（待人工评审）'}</code></p>
        ${m.release.dataStatusNote ? `<p>${esc(String(m.release.dataStatusNote).slice(0, 200))}</p>` : ''}
      </div>
    </details>` : '';

  /* ---------- 联系 ---------- */
  const contactInfo = `
    <p><b>官方主页</b> ${c.officialProfileUrl ? `<a href="${esc(c.officialProfileUrl)}" target="_blank" rel="noopener noreferrer">${esc(c.officialProfileUrl)} ↗</a>` : '无公开信息，不展示'}</p>
    ${review && c.officialEmail ? `<p><b>邮箱</b> <a href="mailto:${esc(c.officialEmail)}">${esc(c.officialEmail)}</a> <span class="pub-type">评审视图</span></p>` : ''}
    ${!review ? '<p><b>邮箱</b> 通过官方主页获取（不公开显示）</p>' : ''}
    <p><b>其它</b> 电话 / 办公室 / 开放时间无公开信息，不展示。</p>`;

  const prepCard = t === 't01' ? `
    <div class="contact-card">
      <p class="section-note">联系前准备：研究方向 · 已有技能 · 想参与的工作类型。</p>
    </div>` : `
    <div class="contact-card">
      <p class="section-note">联系前建议准备：</p>
      <ul class="prep">
        <li>你感兴趣的研究方向（参考上方方向卡）</li>
        <li>已学课程 / 技能（对应「入门建议」）</li>
        <li>希望参与的工作类型（文献 / 数据 / 实验 / 编程）</li>
        ${t === 't03' ? '<li>一段简洁自我介绍</li>' : ''}
      </ul>
      <p class="section-note" style="margin-top:.8rem">以上为准备建议，非提交系统；联系为规划中的功能。</p>
    </div>`;

  return `
  <header class="site-head">
    <a class="brand" href="#hero">Academic Intelligence <span>· 导师档案</span></a>
    <nav class="site-nav">
      <a href="#directions">方向</a><a href="#outputs">成果</a><a href="#tasks">本科任务</a>
    </nav>
    <a class="cta-primary" style="margin-left:auto" href="#contact">联系导师</a>
  </header>

  <main>
    <section id="hero" class="hero m-rise">
      <div class="hero-inner">
        <div class="hero-text">
          <p class="kicker">Mentor · ${esc(trustLine(m))}</p>
          <h1>${esc(m.nameZh)}${m.nameEn ? `<i> ${esc(m.nameEn)}</i>` : ''}</h1>
          <p class="role">${esc(m.position)} · ${esc(m.department)}</p>
          <p class="univ">${esc(m.institution)} · ${esc((m.roles || []).join(' · '))}</p>
          ${review ? `<span class="avail">评审中 · 未公开发布</span>` : `<span class="avail pub">资料已核验</span>`}
          <div class="tags">${(m.tags || []).slice(0, 4).map(tg => `<span class="tag">${esc(tg)}</span>`).join('')}</div>
          <p class="intro">${esc(heroIntro)}</p>
          <div class="hero-actions">
            <a class="cta-primary" href="#contact">联系导师</a>
            ${c.officialProfileUrl ? `<a class="cta-ghost" href="${esc(c.officialProfileUrl)}" target="_blank" rel="noopener noreferrer">官方主页 ↗</a>` : ''}
          </div>
        </div>
        <div class="hero-num" aria-hidden="true">${String(statsN).padStart(2, '0')}<small>研究方向</small></div>
      </div>
    </section>

    <nav class="sec-nav" aria-label="页面章节">
      <a href="#directions">研究方向</a>
      <a href="#outputs">成果</a>
      <a href="#trajectory">发展脉络</a>
      <a href="#tasks">本科任务</a>
      <a href="#evidence">证据</a>
      <a href="#contact">联系</a>
    </nav>

    <section id="stats" class="stats" aria-label="概览数据">
      <div>
        <div class="stat"><span class="stat-v">${dirs.length}</span><span class="stat-l">研究方向</span></div>
        <div class="stat"><span class="stat-v">${pc.count}</span><span class="stat-l">已核验成果（篇）</span></div>
        <div class="stat"><span class="stat-v">${ug.taskCount}</span><span class="stat-l">可能任务（项）</span></div>
      </div>
    </section>

    <section id="directions" class="block">
      <h2>研究方向 ${esc(densityName) ? `<span class="density-tag">${esc(densityName)}</span>` : ''}</h2>
      <p class="section-note">${dirs.length === 1 ? '公开方向之一；以下为公开资料整理的入口。' : '先看方向，再决定要不要深挖。'}</p>
      <div class="dir-grid ${dirs.length === 1 ? 'one' : ''}">${dirCells}</div>
    </section>

    <section id="outputs" class="block">
      <h2>${pc.featuredEmpty ? '已核验成果' : '代表成果'}</h2>
      <p class="section-note">${pc.featuredEmpty ? '按年份排列的已核验公开成果（精选展示仍待人工评审，本页不做挑选推荐）。' : '经人工评审的代表成果。'}</p>
      <div class="pub-list">${pubRows}</div>
      ${pubs.length > pubRowsCount(t, pubs) ? `<p class="section-note" style="margin-top:1.2rem">共 ${pc.count} 篇已核验；其余在深读层。</p>` : ''}
    </section>

    <section id="trajectory" class="block">
      <h2>研究发展脉络</h2>
      <p class="section-note">${esc(trajectoryIntro)} 按阶段归纳公开成果；若公开资料不足以证明方向转型，这里只做年份归纳，不作战略判断。职业履历无公开数据，不虚构时间线。</p>
      ${phaseBands || '<p class="section-note">暂无已核验成果年份（不虚构）。</p>'}
      ${growthItems}
    </section>

    <section id="tasks" class="block">
      <h2>本科生可以做什么</h2>
      <p class="section-note">以下任务由公开研究方向与论文整理推导，供了解参考；具体安排以导师 / 实验室实际为准，不是实验室官方岗位说明。</p>
      <div class="task-grid ${t === 't01' ? 'two' : ''}">${taskCards || '<p class="section-note">暂无公开推导任务（不虚构）。</p>'}</div>
      ${prepRow}
    </section>

    <section id="evidence" class="block">
      <div class="ev-inner">
        <h2>证据 · 为什么可以相信</h2>
        <p class="section-note">每一条展示内容都可回溯到公开来源。</p>
        <div class="ev-grid ${t === 't01' ? 'one' : ''}">${evItems}</div>
        <p class="ev-note">${esc(m.boundary || '')}</p>
        ${evTech}
      </div>
    </section>

    <section id="contact" class="block">
      <h2>联系</h2>
      <div class="contact-grid">
        <div class="contact-info">${contactInfo}</div>
        ${prepCard}
      </div>
    </section>
  </main>

  <footer>
    <p>Academic Intelligence · Mentor Profile Template Convergence · ${esc(densityName)} · 数据为真实公开数据副本（中南大学生命科学学院 + Crossref）</p>
  </footer>`;
}

function pubRowsCount(t, pubs) {
  return t === 't01' ? 2 : t === 't02' ? 3 : 5;
}

function deepGroup(label, items) {
  if (!items || !items.length) return '';
  return `<div class="dg"><div class="dg-k">${esc(label)}</div>
    ${items.map(it => `<div class="dg-item">${esc(it.text)}</div>`).join('')}</div>`;
}

function stageName(s) {
  return { foundation: '打基础', bounded_task: '有边界任务', independent_module: '独立模块' }[s] || s;
}
