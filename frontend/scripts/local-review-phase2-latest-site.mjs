import { execFile } from "node:child_process";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
  PHASE2_ADVISOR_IDS,
  evaluatePhase2PackageGate,
  loadPhase2Package,
} from "./local-review-phase2-advisor-dto.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(frontendDir, "..");
const execFileAsync = promisify(execFile);

export const LATEST_REVIEW_ROOT = path.join(frontendDir, ".local-review-phase2-8-latest");
export const LATEST_SITE_SOURCES = Object.freeze({
  directory: path.join(repoRoot, "site-src", "academic", "directory"),
  profile: path.join(repoRoot, "site-src", "t02-src"),
});

const REQUIRED_REVIEW_WORDING = Object.freeze([
  "论文检索已执行",
  "候选论文",
  "已采用论文",
  "Owner 已选代表论文",
  "release_eligible=false",
]);

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function exactSet(actual, expected, message) {
  const left = [...actual].sort((a, b) => a.localeCompare(b, "en"));
  const right = [...expected].sort((a, b) => a.localeCompare(b, "en"));
  invariant(JSON.stringify(left) === JSON.stringify(right), `${message}:${left.join("|")}`);
}

async function git(...args) {
  const result = await execFileAsync("git", args, { cwd: repoRoot, windowsHide: true });
  return result.stdout.trim();
}

async function assertLatestAuthority() {
  const protectedSources = [
    "site-src/academic/directory",
    "site-src/academic/profile",
    "site-src/t02-src",
    "site-builder/build-rebase.mjs",
  ];
  try {
    await git("diff", "--quiet", "origin/main", "--", ...protectedSources);
  } catch {
    throw new Error("LATEST_UI_AUTHORITY_DIFFERS_FROM_ORIGIN_MAIN");
  }
  const remoteCommit = await git("rev-parse", "origin/main");
  invariant(/^[0-9a-f]{40}$/.test(remoteCommit), "ORIGIN_MAIN_COMMIT_INVALID");
  return remoteCommit;
}

async function assertProtectedProductionPathsClean() {
  const paths = [
    "frontend/public",
    "site-src/academic/directory",
    "site-src/academic/profile",
    "site-src/t02-src",
    "site-builder/build-rebase.mjs",
    ".github/workflows/deploy-frontend-pages.yml",
  ];
  try {
    await git("diff", "--quiet", "HEAD", "--", ...paths);
  } catch {
    throw new Error("PROTECTED_PRODUCTION_PATH_HAS_DIFF");
  }
}

function value(field) {
  return field && typeof field.value === "string" ? field.value : null;
}

function shortDepartment(full) {
  return String(full || "生命科学学院").replace(/^生命科学学院/, "") || "生命科学学院";
}

function directoryMentor(gate) {
  const pack = gate.publicAdvisor;
  const plain = (pack.research_directions_plain_language || []).map((item) => ({
    term: item.term_original,
    explanation: item.explanation_zh,
    undergrad: item.undergraduate_meaning,
    confidence: item.confidence,
  }));
  const original = (pack.research_directions_original || []).map((item) => item.text).filter(Boolean);
  const direction = plain[0]?.term || original[0] || "公开方向待整理";
  const deptFull = value(pack.school_or_department) || "生命科学学院";
  const tags = Array.isArray(pack.tags) ? pack.tags : [];
  return {
    id: pack.advisor_id,
    nameZh: value(pack.name_zh),
    nameEn: value(pack.name_en),
    position: value(pack.position),
    institution: value(pack.institution),
    deptFull,
    deptShort: shortDepartment(deptFull),
    tags,
    plain,
    primaryDirection: direction,
    searchTerms: [value(pack.name_zh), value(pack.name_en), deptFull, ...tags, ...original].filter(Boolean).join(" | "),
    summary: pack.summary?.text || "",
    boundary: pack.boundary_statement || "",
    years: (gate.manifest.candidate_evidence || []).filter((item) => item.evidence_type === "publication" && (item.candidate_statuses || []).includes("adopted")).map((item) => item.publication_year).filter(Boolean),
    publicationCandidateCount: gate.validation.publication_candidate_evidence_count,
    adoptedPublicationCount: gate.validation.adopted_publication_evidence_count,
    eligible: false,
    pubStatus: "review_pending",
  };
}

function directoryData(mentors) {
  const counts = new Map();
  for (const mentor of mentors) counts.set(mentor.deptShort, (counts.get(mentor.deptShort) || 0) + 1);
  return {
    schema: "phase2-latest-surface-review-v1",
    generatedFrom: "v1.0.6 Phase 2 packages through fail-closed local review gate",
    generatedAt: new Date().toISOString().slice(0, 10),
    reviewCount: mentors.length,
    publicCount: 0,
    reviewOnlyCount: mentors.length,
    departments: [...counts].map(([id, count]) => ({ id, label: id, count })),
    mentors,
  };
}

function replaceExactly(source, before, after, label) {
  const count = source.split(before).length - 1;
  invariant(count === 1, `LATEST_SOURCE_DRIFT:${label}:${count}`);
  return source.replace(before, after);
}

function patchDirectoryHtml(source) {
  let html = source.replace(/\r\n/g, "\n");
  html = html.replace(/<title>[^<]*<\/title>/, "<title>Phase 2 · 最新导师目录 · 本地审核</title>");
  html = replaceExactly(
    html,
    '<link rel="stylesheet" href="css/base.css">',
    '<link rel="stylesheet" href="css/base.css">\n<link rel="stylesheet" href="css/r2-green.css">',
    "directory-production-visual-layer",
  );
  html = replaceExactly(
    html,
    '  <nav class="modeswitch"',
    '  <a class="back-to-parent" href="../">返回本科生平台</a>\n  <nav class="modeswitch"',
    "directory-parent-navigation",
  );
  html = replaceExactly(
    html,
    '<div class="reviewtoggle" aria-label="评审 / 公开">\n    <button id="rev-on" aria-pressed="true">评审 13</button>\n    <button id="rev-off" aria-pressed="false">公开 12</button>\n  </div>',
    '<div class="reviewtoggle" aria-label="本地审核状态">\n    <button id="rev-on" aria-pressed="true">本地审核 8</button>\n    <button id="rev-off" aria-pressed="false" hidden>公开 0</button>\n  </div>',
    "directory-review-toggle",
  );
  html = replaceExactly(
    html,
    '<main class="shell">',
    '<aside class="local-review-banner" role="status"><b>LOCAL REVIEW ONLY</b><span>Phase 2 · v1.0.6 · 8 位导师 · 未公开发布</span></aside>\n\n<main class="shell">',
    "directory-review-banner",
  );
  return html;
}

function feedbackSnippet(configPath) {
  return `<footer class="r4-feedback"><p>当前为试用版本。导师信息来自公开资料整理；如发现信息错误，欢迎反馈。<br>
有建议、发现信息错误，或者有哪里不好用？欢迎直接告诉我。<br>
<span id="fb-form">反馈问卷正在配置</span> · <span id="fb-mail">邮件联系方式正在配置</span></p></footer>
<a id="fb-float" class="r4-fb-float" href="#" rel="noopener" aria-label="反馈 / 联系我">反馈</a>
<style>.r4-feedback{margin:26px 0 10px;padding:12px 16px;border-top:1px solid #dfe7e2;color:#5b6b62;font-size:13px;font-family:system-ui,"PingFang SC",sans-serif;line-height:1.7}.r4-feedback a{color:#146b4a;font-weight:700;text-decoration:none}.r4-feedback a:hover{text-decoration:underline}.r4-fb-float{position:fixed;right:16px;bottom:16px;z-index:100;background:#146b4a;color:#fff;font-size:12.5px;font-weight:700;padding:8px 14px;border-radius:999px;box-shadow:0 4px 14px rgba(15,77,51,.28);text-decoration:none;font-family:system-ui,"PingFang SC",sans-serif}.r4-fb-float:hover{background:#11583a}@media(max-width:480px){.r4-fb-float{bottom:14px;right:14px}}</style>
<script>(function(){var cfgPath=${JSON.stringify(configPath)};fetch(cfgPath).then(function(r){return r.json();}).then(function(cfg){var F=document.getElementById('fb-form'),M=document.getElementById('fb-mail'),FL=document.getElementById('fb-float');if(cfg&&cfg.feedbackUrl){var a=document.createElement('a');a.href=cfg.feedbackUrl;a.target='_blank';a.rel='noopener';a.textContent='[填写反馈]';F.replaceWith(a);if(FL){FL.href=cfg.feedbackUrl;FL.target='_blank';}}else{F.textContent='反馈问卷正在配置';if(FL)FL.style.display='none';}if(cfg&&cfg.feedbackEmail){var m=document.createElement('a');m.href='mailto:'+cfg.feedbackEmail+'?subject='+encodeURIComponent('[本科生平台反馈] '+document.title)+'&body='+encodeURIComponent('当前页面：'+location.href);m.textContent='[邮件联系]';M.replaceWith(m);}else{M.textContent='邮件联系方式正在配置';}}).catch(function(){var F=document.getElementById('fb-form'),M=document.getElementById('fb-mail'),FL=document.getElementById('fb-float');if(F)F.textContent='反馈问卷正在配置';if(M)M.textContent='邮件联系方式正在配置';if(FL)FL.style.display='none';});})();<\/script>`;
}

function injectFeedback(html, configPath) {
  invariant(!html.includes("r4-feedback"), "LATEST_SOURCE_DRIFT:feedback-already-present");
  return replaceExactly(html, "</body>", `${feedbackSnippet(configPath)}\n</body>`, "feedback-body-anchor");
}

function patchDirectoryApp(source) {
  source = source.replace(/\r\n/g, "\n");
  return replaceExactly(
    source,
    'href="${IS_PUBLIC ? \'#\' : \'#/mentor/\' + esc(m.id)}" data-mentor="${esc(m.id)}"',
    'href="profile/profile.html?id=${encodeURIComponent(m.id)}&t=t02" data-mentor="${esc(m.id)}"',
    "directory-t02-route",
  );
}

function patchProfileApp(source) {
  let app = replaceExactly(
    source.replace(/\r\n/g, "\n"),
    "    : '学院官网 + 学术数据库（评审视图）';",
    "    : '学院官网 + 学术数据库（本地论文审核）';",
    "profile-trust-line",
  );
  app = replaceExactly(
    app,
    "  if (!m || !m.release.eligible) {",
    "  if (!m || m.release.eligible !== false || m.release.publicationStatus !== 'review_pending' || !['verified','partially_verified','pending_verification'].includes(m.release.identityStatus)) {",
    "profile-review-gate",
  );
  app = replaceExactly(
    app,
    "      <h1 style=\"font-size:26px\">该档案尚未公开</h1>\n      <p>该档案不在已核验的公开导师范围内，或地址无效。</p>",
    "      <h1 style=\"font-size:26px\">该档案不在本地审核范围</h1>\n      <p>仅允许通过 v1.0.6 Phase 2 门禁的 8 位 review_pending 导师。</p>",
    "profile-review-denial",
  );
  return app;
}

function patchProfileData(source) {
  let data = source.replace(/\r\n/g, "\n");
  data = replaceExactly(
    data,
    "  const pubEv = adopted.filter(e => e.evidence_type === 'publication');",
    "  const allPubEv = (manifest.candidate_evidence || []).filter(e => e.evidence_type === 'publication');\n  const featuredOrder = new Map((pack.featured_publication_evidence_ids || []).map((id, index) => [id, index]));\n  const pubEv = adopted.filter(e => e.evidence_type === 'publication').sort((a, b) => {\n    const ai = featuredOrder.has(a.evidence_id) ? featuredOrder.get(a.evidence_id) : Number.MAX_SAFE_INTEGER;\n    const bi = featuredOrder.has(b.evidence_id) ? featuredOrder.get(b.evidence_id) : Number.MAX_SAFE_INTEGER;\n    return ai - bi;\n  });",
    "profile-data-all-publications",
  );
  data = replaceExactly(data, "      year: canonicalYear(dt, rec),", "      year: canonicalYear(dt, rec) || e.publication_year || null,", "profile-data-year-fallback");
  data = replaceExactly(
    data,
    "  const contact = buildContact(pack);",
    "  const contact = buildContact(pack);\n  const reviewMeta = (dto.advisors || []).find(item => item.id === pack.advisor_id) || {};",
    "profile-data-review-meta",
  );
  data = replaceExactly(
    data,
    "      dataStatusNote: pack.data_status_note,",
    "      dataStatusNote: pack.data_status_note,\n      publicationCandidateCount: allPubEv.length,\n      adoptedPublicationCount: pubEv.length,\n      unresolvedPublicationCount: allPubEv.filter(e => !e.identity_verified && !(e.candidate_statuses || []).includes('excluded')).length,\n      rejectedPublicationCount: allPubEv.filter(e => (e.candidate_statuses || []).includes('excluded')).length,\n      orcidReviewStatus: reviewMeta.orcidReviewStatus || 'unresolved',\n      orcidReviewBasis: reviewMeta.orcidReviewBasis || [],\n      ownerFeaturedIds: reviewMeta.ownerFeaturedIds || [],",
    "profile-data-review-counts",
  );
  return data;
}

function patchTemplate(source) {
  let template = source.replace(/\r\n/g, "\n");
  const evStart = "  const evItems = t === 't01' ?";
  const evEnd = "\n\n  const evTech =";
  const start = template.indexOf(evStart);
  const end = template.indexOf(evEnd, start);
  invariant(start >= 0 && end > start, "LATEST_SOURCE_DRIFT:template-evidence-block");
  const reviewEvidence = `  const evItems = review ? \`
      <div class="ev-item"><span class="ev-k">身份信息</span><h3>论文身份：\${esc(m.release.identityStatus)}</h3><p>导师 ORCID：\${esc(m.release.orcidReviewStatus)}。\${m.release.orcidReviewBasis.length ? ' ' + esc(m.release.orcidReviewBasis.join('；')) : ''} 机器身份闭合不替代 Owner 人工审核；人工审核仍 pending。</p></div>
      <div class="ev-item"><span class="ev-k">论文信息</span><h3>论文检索已执行</h3><p>候选论文 \${m.release.publicationCandidateCount} · 已采用论文 \${m.release.adoptedPublicationCount} · 未决 \${m.release.unresolvedPublicationCount} · 排除 \${m.release.rejectedPublicationCount}。</p></div>
      <div class="ev-item"><span class="ev-k">发布状态</span><h3>LOCAL REVIEW ONLY</h3><p>review_pending · release_eligible=false · 不构成公开发布许可。</p></div>\`
    : t === 't01' ? \`<div class="ev-item"><span class="ev-k">来源</span><h3>学院官网 + 学术数据库</h3><p>\${esc(trustLine(m))}</p></div>\`
    : \`
      <div class="ev-item"><span class="ev-k">身份信息</span><h3>\${esc(m.release.identityStatus === 'verified' ? '已核验' : '核验中')}</h3><p>姓名 · 职称 · 院系 · 导师资格来自学院官方页面。</p></div>
      <div class="ev-item"><span class="ev-k">论文信息</span><h3>已核验 \${pc.count} 篇</h3><p>题名与年份经 Crossref / DOI 交叉核验，年份以正式卷期为准。</p></div>
      <div class="ev-item"><span class="ev-k">整理说明</span><h3>公开资料整理</h3><p>方向解释与任务建议基于官方方向与已采纳论文；内容不代表导师原话或承诺。</p></div>\`;`;
  template = template.slice(0, start) + reviewEvidence + template.slice(end);
  template = replaceExactly(
    template,
    "  return `\n  <header class=\"site-head\">",
    "  const ownerFeatured = review ? `<div class=\"pub-review-state\"><b>Owner 已选代表论文</b><p>以下 Evidence ID 已通过本轮 publication-content review：${(m.release.ownerFeaturedIds || []).map(esc).join(' · ') || '暂无'}。仍需最终网页审核，不构成全局身份批准或发布许可。</p><div><span>候选论文 ${m.release.publicationCandidateCount}</span><span>已采用论文 ${m.release.adoptedPublicationCount}</span><span>Owner featured ${(m.release.ownerFeaturedIds || []).length}</span><code>publication identity: ${esc(m.release.identityStatus)}</code></div></div>` : '';\n\n  return `\n  ${review ? '<aside class=\"local-review-banner\"><b>LOCAL REVIEW ONLY</b><span>v1.0.6 · review_pending · release_eligible=false</span></aside>' : ''}\n  <header class=\"site-head\">",
    "template-review-banner",
  );
  template = replaceExactly(
    template,
    '<div class="stat"><span class="stat-v">${pc.count}</span><span class="stat-l">已核验成果（篇）</span></div>',
    '<div class="stat"><span class="stat-v">${pc.count}</span><span class="stat-l">${review ? \'已采用论文（篇）\' : \'已核验成果（篇）\'}</span></div>',
    "template-review-stat",
  );
  template = replaceExactly(
    template,
    "      <h2>${pc.featuredEmpty ? '已核验成果' : '代表成果'}</h2>\n      <p class=\"section-note\">${pc.featuredEmpty ? '按年份排列的已核验公开成果（精选展示仍待人工评审，本页不做挑选推荐）。' : '经人工评审的代表成果。'}</p>\n      <div class=\"pub-list\">${pubRows}</div>\n      ${pubs.length > pubRowsCount(t, pubs) ? `<p class=\"section-note\" style=\"margin-top:1.2rem\">共 ${pc.count} 篇已核验；其余在深读层。</p>` : ''}",
    "      <h2>${review ? 'Owner 已选代表论文' : (pc.featuredEmpty ? '已核验成果' : '代表成果')}</h2>\n      <p class=\"section-note\">${review ? '论文检索与Owner内容选择已执行；以下优先展示Owner选定论文。采用、精选均不等于公开发布。' : (pc.featuredEmpty ? '按年份排列的已核验公开成果（精选展示仍待人工评审，本页不做挑选推荐）。' : '经人工评审的代表成果。')}</p>\n      ${ownerFeatured}\n      <div class=\"pub-list\">${pubRows}</div>\n      ${pubs.length > pubRowsCount(t, pubs) ? `<p class=\"section-note\" style=\"margin-top:1.2rem\">共 ${pc.count} 篇已采用；其余已采用论文在深读层。</p>` : ''}",
    "template-publication-section",
  );
  template = replaceExactly(
    template,
    "      <p class=\"section-note\">以下任务由公开研究方向与论文整理推导，供了解参考；具体安排以导师 / 实验室实际为准，不是实验室官方岗位说明。</p>",
    "      <p class=\"section-note\">${review ? '以下任务由官方方向与已采用论文谨慎推导，仅供人工审核；具体安排以导师 / 实验室实际为准。' : '以下任务由公开研究方向与论文整理推导，供了解参考；具体安排以导师 / 实验室实际为准，不是实验室官方岗位说明。'}</p>",
    "template-review-tasks",
  );
  template = replaceExactly(
    template,
    "    <p>Academic Intelligence · Mentor Profile Template Convergence · ${esc(densityName)} · 数据为真实公开数据副本（中南大学生命科学学院 + Crossref）</p>",
    "    <p>Academic Intelligence · Mentor Profile Template Convergence · ${esc(densityName)} · ${review ? '本地论文审核副本（中南大学生命科学学院 + DOI / PubMed / Europe PMC）' : '数据为真实公开数据副本（中南大学生命科学学院 + Crossref）'}</p>",
    "template-review-footer",
  );
  return template;
}

function reviewCss(source) {
  return `${source}\n.local-review-banner{position:relative;z-index:20;display:flex;justify-content:center;gap:1rem;align-items:center;padding:.62rem 1rem;background:#f2c94c;color:#101010;border-bottom:1px solid #101010;font-family:system-ui,"Segoe UI","PingFang SC",sans-serif;font-size:.78rem;letter-spacing:.04em}.local-review-banner b{letter-spacing:.12em}.pub-review-state{border:1px solid var(--ink);padding:1.35rem 1.5rem;background:var(--cream)}.pub-review-state>b{font-family:var(--font-serif);font-size:1.2rem}.pub-review-state p{margin:.5rem 0;color:var(--ink-2)}.pub-review-state div{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1rem}.pub-review-state span,.pub-review-state code{border:1px solid var(--line);padding:.3rem .65rem;background:var(--paper);font-size:.75rem}\n`;
}

async function loadCohort() {
  const items = [];
  for (const advisorId of PHASE2_ADVISOR_IDS) {
    const directory = path.join(repoRoot, "data", "advisors-v1", advisorId);
    const loaded = await loadPhase2Package(directory, advisorId);
    const gate = evaluatePhase2PackageGate(advisorId, loaded);
    invariant(gate.allowed, `LATEST_REVIEW_GATE_FAILED:${advisorId}:${gate.reasons.join(",")}`);
    items.push({ advisorId, gate });
  }
  invariant(items.length === 8, "LATEST_REVIEW_COHORT_NOT_8");
  return items;
}

export async function buildLatestReviewSite(outputRoot = LATEST_REVIEW_ROOT) {
  invariant(path.resolve(outputRoot) === path.resolve(LATEST_REVIEW_ROOT), "UNSAFE_LATEST_REVIEW_OUTPUT_ROOT");
  const remoteCommit = await assertLatestAuthority();
  await assertProtectedProductionPathsClean();
  const cohort = await loadCohort();
  await rm(outputRoot, { recursive: true, force: true });
  const academic = path.join(outputRoot, "academic");
  const profile = path.join(academic, "profile");
  await mkdir(profile, { recursive: true });

  await cp(LATEST_SITE_SOURCES.directory, academic, { recursive: true });
  await mkdir(path.join(profile, "css"), { recursive: true });
  for (const file of ["profile.html", "app.js", "data.js", "template.js"]) {
    await cp(path.join(LATEST_SITE_SOURCES.profile, file), path.join(profile, file));
  }
  await cp(path.join(LATEST_SITE_SOURCES.profile, "template.css"), path.join(profile, "css", "template.css"));

  const mentors = cohort.map(({ gate }) => directoryMentor(gate));
  const dto = {
    schema_version: "1.0.6-review",
    scope: "local_review_only",
    advisors: cohort.map(({ advisorId, gate }) => ({
      id: advisorId,
      publicationCandidateCount: gate.validation.publication_candidate_evidence_count,
      adoptedPublicationCount: gate.validation.adopted_publication_evidence_count,
      orcidReviewStatus: gate.identity.advisor_identity?.orcid_status || "unresolved",
      orcidReviewBasis: Array.isArray(gate.identity.advisor_identity?.orcid_verification_basis)
        ? gate.identity.advisor_identity.orcid_verification_basis
        : [],
      ownerFeaturedIds: gate.publicAdvisor.featured_publication_evidence_ids,
    })),
  };
  await writeFile(path.join(academic, "assets", "data.js"), `window.DIRECTORY_DATA = ${JSON.stringify(directoryData(mentors), null, 2)};\n`);
  await writeFile(path.join(academic, "index.html"), injectFeedback(patchDirectoryHtml(await readFile(path.join(LATEST_SITE_SOURCES.directory, "index.html"), "utf8")), "../data/site-config.json"));
  await writeFile(path.join(academic, "js", "app.js"), patchDirectoryApp(await readFile(path.join(LATEST_SITE_SOURCES.directory, "js", "app.js"), "utf8")));
  await writeFile(path.join(academic, "css", "local-review.css"), reviewCss(""));
  let index = await readFile(path.join(academic, "index.html"), "utf8");
  index = index.replace('<link rel="stylesheet" href="css/r2-green.css">', '<link rel="stylesheet" href="css/r2-green.css">\n<link rel="stylesheet" href="css/local-review.css">');
  await writeFile(path.join(academic, "index.html"), index);

  const profileHtml = injectFeedback(await readFile(path.join(LATEST_SITE_SOURCES.profile, "profile.html"), "utf8"), "../../data/site-config.json");
  await writeFile(path.join(profile, "profile.html"), profileHtml);
  await mkdir(path.join(outputRoot, "data"), { recursive: true });
  await cp(path.join(frontendDir, "public", "data", "site-config.json"), path.join(outputRoot, "data", "site-config.json"));

  await mkdir(path.join(profile, "data", "packs"), { recursive: true });
  await writeFile(path.join(profile, "data", "public-dto.json"), `${JSON.stringify(dto, null, 2)}\n`);
  await mkdir(path.join(profile, "data", "evidence"), { recursive: true });
  await writeFile(path.join(profile, "data", "evidence", "crossref_5dois.json"), "{}\n");
  await writeFile(path.join(profile, "data", "evidence", "crossref_dates.json"), "{}\n");
  for (const { advisorId } of cohort) {
    const src = path.join(repoRoot, "data", "advisors-v1", advisorId);
    const dst = path.join(profile, "data", "packs", advisorId);
    await mkdir(dst, { recursive: true });
    for (const file of ["public-advisor-v1.json", "evidence-manifest-v1.json", "validation-report-v1.json"]) {
      await cp(path.join(src, file), path.join(dst, file));
    }
  }
  await writeFile(path.join(profile, "app.js"), patchProfileApp(await readFile(path.join(LATEST_SITE_SOURCES.profile, "app.js"), "utf8")));
  await writeFile(path.join(profile, "data.js"), patchProfileData(await readFile(path.join(LATEST_SITE_SOURCES.profile, "data.js"), "utf8")));
  await writeFile(path.join(profile, "template.js"), patchTemplate(await readFile(path.join(LATEST_SITE_SOURCES.profile, "template.js"), "utf8")));
  await writeFile(path.join(profile, "css", "template.css"), reviewCss(await readFile(path.join(LATEST_SITE_SOURCES.profile, "template.css"), "utf8")));

  const manifest = {
    status: "OWNER_PUBLICATION_DECISIONS_APPLIED_READY_FOR_FINAL_WEB_REVIEW",
    scope: "local_review_only",
    source_commit: remoteCommit,
    hu_zhengmao_reference_commit: "fed26decc26a709379b0f087be8d68c1b50f2642",
    source_authority: ["site-src/academic/directory", "site-src/t02-src", "site-builder/build-rebase.mjs"],
    advisor_ids: [...PHASE2_ADVISOR_IDS],
    required_review_wording: [...REQUIRED_REVIEW_WORDING],
    public_release_approved: false,
  };
  await writeFile(path.join(outputRoot, "review-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(path.join(outputRoot, "index.html"), '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=academic/"><title>Phase 2 latest local review</title>\n');
  return { outputRoot, cohort, manifest };
}

export async function verifyLatestReviewSite(outputRoot = LATEST_REVIEW_ROOT) {
  invariant(path.resolve(outputRoot) === path.resolve(LATEST_REVIEW_ROOT), "UNSAFE_LATEST_REVIEW_VERIFY_ROOT");
  const remoteCommit = await assertLatestAuthority();
  await assertProtectedProductionPathsClean();
  const sourceCohort = await loadCohort();
  const manifest = JSON.parse(await readFile(path.join(outputRoot, "review-manifest.json"), "utf8"));
  invariant(manifest.status === "OWNER_PUBLICATION_DECISIONS_APPLIED_READY_FOR_FINAL_WEB_REVIEW", "LATEST_REVIEW_STATUS_STALE");
  invariant(JSON.stringify(manifest.advisor_ids) === JSON.stringify(PHASE2_ADVISOR_IDS), "LATEST_REVIEW_IDS_MISMATCH");
  invariant(manifest.source_commit === remoteCommit, "LATEST_REVIEW_SOURCE_COMMIT_STALE");
  const directoryJs = await readFile(path.join(outputRoot, "academic", "assets", "data.js"), "utf8");
  const template = await readFile(path.join(outputRoot, "academic", "profile", "template.js"), "utf8");
  const app = await readFile(path.join(outputRoot, "academic", "profile", "app.js"), "utf8");
  const directoryPayload = JSON.parse(directoryJs.slice(directoryJs.indexOf("{"), directoryJs.lastIndexOf("}") + 1));
  exactSet(directoryPayload.mentors.map((item) => item.id), PHASE2_ADVISOR_IDS, "LATEST_DIRECTORY_EXACT_SET_FAILED");
  const dto = JSON.parse(await readFile(path.join(outputRoot, "academic", "profile", "data", "public-dto.json"), "utf8"));
  exactSet(dto.advisors.map((item) => item.id), PHASE2_ADVISOR_IDS, "LATEST_DTO_EXACT_SET_FAILED");
  const packEntries = (await readdir(path.join(outputRoot, "academic", "profile", "data", "packs"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  exactSet(packEntries, PHASE2_ADVISOR_IDS, "LATEST_PACK_EXACT_SET_FAILED");
  for (const phrase of REQUIRED_REVIEW_WORDING) invariant(template.includes(phrase), `LATEST_REVIEW_WORDING_MISSING:${phrase}`);
  invariant(!template.includes("已核验成果 0 篇（已核验）"), "INVALID_ZERO_VERIFIED_WORDING");
  invariant(app.includes("m.release.eligible !== false"), "LATEST_REVIEW_GATE_MISSING");
  for (const { advisorId: id } of sourceCohort) {
    invariant(directoryJs.includes(`\"id\": \"${id}\"`), `DIRECTORY_ID_MISSING:${id}`);
    const validation = JSON.parse(await readFile(path.join(outputRoot, "academic", "profile", "data", "packs", id, "validation-report-v1.json"), "utf8"));
    const pack = JSON.parse(await readFile(path.join(outputRoot, "academic", "profile", "data", "packs", id, "public-advisor-v1.json"), "utf8"));
    invariant(validation.release_eligible === false, `RELEASE_FLAG_CHANGED:${id}`);
    invariant(pack.publication_status === "review_pending", `PUBLICATION_STATUS_CHANGED:${id}`);
    invariant(pack.featured_selection_status === "manually_reviewed", `FEATURED_OWNER_STATUS_MISSING:${id}`);
    invariant(pack.featured_selection_review?.status === "approved" && pack.featured_selection_review?.reviewer_role === "user", `FEATURED_OWNER_REVIEW_MISSING:${id}`);
    const reviewDto = dto.advisors.find((item) => item.id === id);
    invariant(JSON.stringify(reviewDto?.ownerFeaturedIds) === JSON.stringify(pack.featured_publication_evidence_ids), `FEATURED_OWNER_SET_MISMATCH:${id}`);
    invariant(["verified", "partially_verified", "pending_verification"].includes(pack.publication_identity_status), `IDENTITY_STATUS_INVALID:${id}`);
    for (const file of ["public-advisor-v1.json", "evidence-manifest-v1.json", "validation-report-v1.json"]) {
      const sourceBytes = await readFile(path.join(repoRoot, "data", "advisors-v1", id, file));
      const outputBytes = await readFile(path.join(outputRoot, "academic", "profile", "data", "packs", id, file));
      invariant(sourceBytes.equals(outputBytes), `OUTPUT_PACKAGE_HASH_MISMATCH:${id}:${file}`);
    }
  }
  return manifest;
}

async function main() {
  const check = process.argv.includes("--check");
  if (!check) await buildLatestReviewSite();
  const manifest = await verifyLatestReviewSite();
  console.log(JSON.stringify({ ok: true, check, status: manifest.status, output: LATEST_REVIEW_ROOT, advisors: manifest.advisor_ids.length }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}
