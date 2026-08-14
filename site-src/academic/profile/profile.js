/* Academic Intelligence · Mentor Profile V1 — T02 Balanced renderer.
 * Consumes real canonical packs (public-advisor-v1.json + validation-report-v1.json)
 * via fetch. PUBLIC-ONLY: mentors with release_eligible !== true (or bad id) render
 * a fail-closed not-found state. Derived fields are flagged; featured stays the
 * "已核验成果 N 篇" fallback (featured authority NOT approved); contact shows only
 * the official profile link (no email / phone / lab / address in public mode).
 * NOT_AVAILABLE_V1 fields (office hours, bio/career, match score) are never fabricated.
 */
"use strict";

const AcademicProfile = {
  base: "academic/profile/data/",

  async fetchJSON(p) {
    const r = await fetch(this.base + p, { cache: "no-store" });
    if (!r.ok) throw new Error("load:" + r.status);
    return r.json();
  },

  async render(mount, id) {
    let pack = null, valid = null;
    try {
      pack = await this.fetchJSON("packs/" + id + "/public-advisor-v1.json");
      valid = await this.fetchJSON("packs/" + id + "/validation-report-v1.json");
    } catch (e) {
      mount.innerHTML = this.notFound("未找到该导师档案");
      return;
    }
    const eligible = valid && valid.release_eligible === true;
    if (!eligible) { mount.innerHTML = this.notFound("该档案尚未公开"); return; }
    mount.innerHTML = this.html(pack);
    mount.querySelectorAll("details.p-l2").forEach((d) => { /* progressive disclosure; default closed */ });
  },

  esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); },

  notFound(msg) {
    return `<div class="profile-t02"><div class="p-notfound"><b>${this.esc(msg)}</b><p>档案可能尚未公开，或地址无效。</p></div></div>`;
  },

  html(p) {
    const tags = (p.tags || []).slice(0, 4);
    const thesis = p.summary && p.summary.text ? p.summary.text : null;
    const dirs = (p.research_directions_original || []).map((d, i) => ({
      term: d,
      plain: (p.research_directions_plain_language || [])[i] || ""
    })).filter((d) => d.term);
    const tasks = (p.possible_undergraduate_tasks || []).slice(0, 3);
    const prereq = (p.prerequisite_skills || []).slice(0, 5);
    const pubs = (p.adopted_public_evidence_ids || []).length;
    const years = (p.adopted_public_evidence_ids || []); // year trajectory comes from evidence manifest (not inline); keep honest
    const contact = p.contact || {};
    const boundary = p.boundary_statement || "";
    const hasEmailAuthority = false; // EMAIL_PUBLICATION_ALLOWED not approved -> no email in public
    const dirsHtml = dirs.length ? `
      <section class="p-sec">
        <h3 class="p-sec-title">研究方向</h3>
        <div class="p-directions">${dirs.map((d) => `
          <div class="p-direction">
            <h4>${this.esc(d.term)}</h4>
            ${d.plain ? `<p>${this.esc(d.plain)}<span class="p-deriv">AI 整理</span></p>` : ""}
          </div>`).join("")}</div>
      </section>` : "";
    const tasksHtml = tasks.length ? `
      <section class="p-sec">
        <h3 class="p-sec-title">本科生参与</h3>
        ${tasks.map((t) => `<p>· ${this.esc(t.purpose || t.task || t.title || "")}</p>`).join("")}
      </section>` : "";
    const prereqHtml = prereq.length ? `
      <section class="p-sec">
        <h3 class="p-sec-title">建议前置</h3>
        <div class="p-chips">${prereq.map((s) => `<span class="p-chip">${this.esc(typeof s === "string" ? s : s.name || s.skill || "")}</span>`).join("")}</div>
      </section>` : "";
    return `
      <div class="profile-t02">
        <div class="p-hero">
          <div class="p-kicker">Academic Intelligence · 导师档案</div>
          <h1 class="p-name">${this.esc(p.name_zh)}${p.name_en ? `<i>${this.esc(p.name_en)}</i>` : ""}</h1>
          <p class="p-role">${this.esc(p.position || "")}${p.school_or_department ? " · " + this.esc(p.school_or_department) : ""}</p>
          ${thesis ? `<p class="p-thesis">${this.esc(thesis.slice(0, 200))}</p>` : ""}
          ${tags.length ? `<div class="p-tags">${tags.map((t) => `<span class="p-tag">${this.esc(t)}</span>`).join("")}</div>` : ""}
        </div>
        <div class="p-body">
          ${dirsHtml}
          ${tasksHtml}
          ${prereqHtml}
          <section class="p-sec">
            <h3 class="p-sec-title">已核验成果</h3>
            <div class="p-count"><b>${pubs}</b><span>篇（已核验）<a href="#" onclick="return false" style="color:var(--ink)">查看全部 →</a></span></div>
            <p class="p-boundary">成果计数来自已核验证据；精选/代表作功能尚未开放。</p>
          </section>
          <details class="p-l2">
            <summary>深入了解：研究问题 · 方法 · 流程</summary>
            <div class="p-l2-body">
              ${(p.research_questions || []).length ? `<p><strong>研究问题</strong><span class="p-deriv">AI 整理</span></p><ul>${p.research_questions.map((q) => `<li>${this.esc(q)}</li>`).join("")}</ul>` : ""}
              ${(p.main_techniques || []).length ? `<p><strong>主要方法</strong><span class="p-deriv">AI 整理</span></p><ul>${p.main_techniques.map((m) => `<li>${this.esc(m)}</li>`).join("")}</ul>` : ""}
              ${(p.research_workflow || []).length ? `<p><strong>研究流程</strong><span class="p-deriv">AI 整理</span></p><ul>${p.research_workflow.map((w) => `<li>${this.esc(w)}</li>`).join("")}</ul>` : ""}
              <p class="p-boundary">以上为公开档案的整理信息，仅供参考。</p>
            </div>
          </details>
          <section class="p-sec">
            <h3 class="p-sec-title">联系</h3>
            <div class="p-contact">
              ${contact.official_profile_url ? `<a href="${this.esc(contact.official_profile_url)}" target="_blank" rel="noopener">官方主页 ↗</a>` : `<span>暂无公开联系方式</span>`}
            </div>
            ${hasEmailAuthority && contact.official_email ? `<p class="p-boundary">邮箱仅在对公众公开授权后显示。</p>` : `<p class="p-boundary">邮箱等联系方式未获公开授权，不在公开档案中显示。</p>`}
          </section>
          ${boundary ? `<p class="p-boundary">${this.esc(boundary)}</p>` : ""}
        </div>
      </div>`;
  }
};
