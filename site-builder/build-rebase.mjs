/* build-rebase.mjs — assemble the rebased site under ./site/
 * 1) copies C01 Directory as native full page (public-only baked)
 * 2) generates static T02 Mentor Profile pages for all 11 public mentors
 * 3) generates experimental tool pages (safe-rendered)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.join(__dirname, "..", "frontend", "dist");
const DATA = path.join(__dirname, "..", "site-src", "academic", "profile", "data");
const C01SRC = path.join(__dirname, "..", "site-src", "academic", "directory");

const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const safeUrl = (u) => { if (!u) return ""; const s = String(u); return /^https?:\/\//i.test(s) ? s : ""; };

function readJSON(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }

const publicDto = readJSON(path.join(DATA, "public-dto.json"));
const publicIds = publicDto.advisors.map((a) => a.advisor_id || a.id).filter(Boolean);
console.log("public mentors:", publicIds.length);

/* ---------- 1. C01 Directory native full page ---------- */
function buildDirectory() {
  const dst = path.join(SITE, "academic");
  fs.mkdirSync(path.join(dst, "assets"), { recursive: true });
  fs.mkdirSync(path.join(dst, "css"), { recursive: true });
  fs.mkdirSync(path.join(dst, "js"), { recursive: true });
  fs.copyFileSync(path.join(C01SRC, "assets", "data.js"), path.join(dst, "assets", "data.js"));
  fs.copyFileSync(path.join(C01SRC, "css", "base.css"), path.join(dst, "css", "base.css"));
  fs.copyFileSync(path.join(C01SRC, "css", "r2-green.css"), path.join(dst, "css", "r2-green.css"));

  let app = fs.readFileSync(path.join(C01SRC, "js", "app.js"), "utf8");
  // bake public-only: force reviewMode=false, hide review toggle, rows -> T02 profile page
  app = app.replace(
    "const IS_PUBLIC = new URLSearchParams(window.location.search).get('public') === '1';",
    "const IS_PUBLIC = true; /* public-only V1 (rebase) */"
  );
  app = app.replace(
    'href="${IS_PUBLIC ? \'#\' : \'#/mentor/\' + esc(m.id)}" data-mentor="${esc(m.id)}"',
    'href="profile/profile.html?id=${esc(m.id)}&t=t02" data-mentor="${esc(m.id)}"'
  );
  app = app.replace(
    "document.getElementById('rev-on').setAttribute('aria-pressed', String(state.reviewMode));\n      document.getElementById('rev-off').setAttribute('aria-pressed', String(!state.reviewMode));",
    "/* review toggle hidden in public-only mode */"
  );
  app = app.replace(
    "document.getElementById('rev-on').addEventListener('click', () => { state.reviewMode = true; render(); });\n  document.getElementById('rev-off').addEventListener('click', () => { state.reviewMode = false; render(); });",
    "/* review toggle disabled in public-only mode */"
  );
  app = app.replace(/\/\* Agent07 integration shim[\s\S]*?\n\s*\}\s*\n/, "");
  fs.writeFileSync(path.join(dst, "js", "app.js"), app);

  let html = fs.readFileSync(path.join(C01SRC, "index.html"), "utf8");
  html = html.replace(
    '<nav class="modeswitch"',
    '<a class="back-to-parent" href="../">返回本科生平台</a>\n<nav class="modeswitch"'
  );
  html = html.replace(/<div class="reviewtoggle"[\s\S]*?<\/div>/, '<div class="reviewtoggle" style="display:none"></div>');
  html = html.replace(/<title>[^<]*<\/title>/, "<title>导师目录 · 生命科学本科生平台</title>");
  html = html.replace(
    /<link rel="stylesheet" href="css\/base\.css">/,
    '<link rel="stylesheet" href="css/base.css">\n<link rel="stylesheet" href="css/r2-green.css">'
  );
  fs.writeFileSync(path.join(dst, "index.html"), html);
  console.log("academic/ (C01) written");
}

/* ---------- 2. T02 static profiles for public mentors ---------- */
function t02Css() {
  return `:root{--paper:#f7f4ee;--ink:#1f1d1a;--ink-soft:#55514a;--rule:#d8d2c6;--gold:#b09a5f;--black:#101010;--white:#f7f4ee}
body{margin:0;background:var(--paper);color:var(--ink);font-family:Georgia,"Songti SC","Noto Serif CJK SC",serif}
.wrap{max-width:840px;margin:0 auto;padding:24px 18px 60px}
.back{color:var(--ink-soft);font-size:13px;text-decoration:none}
.back:hover{text-decoration:underline}
.hero{background:var(--black);color:var(--white);padding:32px 28px;border-radius:2px}
.kicker{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:10px}
.name{font-size:32px;margin:0 0 8px;font-weight:600}
.name i{font-style:normal;font-size:17px;color:#cfc8b8;margin-left:8px}
.role{font-size:15px;color:#d9d4c8}
.thesis{margin-top:14px;font-size:16px;line-height:1.6;color:var(--white)}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.tag{font-size:12px;border:1px solid var(--gold);color:var(--gold);padding:2px 10px;border-radius:999px}
.sec{border-top:1px solid var(--rule);padding:16px 2px}
.sec h3{font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft);margin:0 0 8px}
.sec p,.sec li{font-size:15px;line-height:1.7}
.count{display:flex;align-items:baseline;gap:10px}
.count b{font-size:44px;font-weight:600}
.deriv{font-size:11px;color:var(--gold);border:1px solid var(--gold);border-radius:3px;padding:0 5px;margin-left:6px}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{font-size:12.5px;border:1px solid var(--rule);border-radius:999px;padding:2px 10px}
details{border:1px solid var(--rule);margin-top:6px}
details summary{cursor:pointer;font-size:13.5px;padding:10px 12px}
details .body{padding:4px 12px 12px;font-size:14px}
.boundary{font-size:12px;color:var(--ink-soft);border-top:1px solid var(--rule);margin-top:10px;padding-top:8px}
.nf{border:1px dashed var(--rule);padding:30px;text-align:center}
.toolbar{margin:10px 0 16px;display:flex;gap:10px;flex-wrap:wrap}`;
}

function renderT02(pack) {
  const str = (v) => {
    if (v == null) return "";
    if (typeof v === "string") return v;
    if (typeof v === "object") {
      if ("value" in v && v.value != null) return String(v.value);
      if ("text" in v && v.text != null) return String(v.text);
      return "";
    }
    return String(v);
  };
  const thesis = (pack.summary && str(pack.summary.text)) || "";
  const tags = (pack.tags || []).filter((t) => typeof t === "string").slice(0, 4);
  const rawDirs = pack.research_directions_original || [];
  const rawPlain = pack.research_directions_plain_language || [];
  const dirs = rawDirs.map((d, i) => {
    const plain = rawPlain[i];
    return {
      term: str(d),
      plain: (plain && typeof plain === "object" ? (str(plain.explanation_zh) || str(plain.term_original)) : str(plain)) || ""
    };
  }).filter((d) => d.term);
  const tasks = (pack.possible_undergraduate_tasks || []).slice(0, 3).filter((t) => t);
  const prereq = (pack.prerequisite_skills || []).slice(0, 5).filter((x) => x && str(x.text));
  const pubCount = (pack.adopted_public_evidence_ids || []).length;
  const contact = pack.contact || {};
  const profUrl = safeUrl(contact.official_profile_url && contact.official_profile_url.value);
  const boundary = str(pack.boundary_statement);
  const qs = (pack.research_questions || []).map((q) => str(q)).filter(Boolean);
  const methods = (pack.main_techniques || []).map((m) => str(m)).filter(Boolean);
  const flow = (pack.research_workflow || []).map((w) => str(w)).filter(Boolean);
  const dirsHtml = dirs.length ? `<section class="sec"><h3>研究方向</h3>${dirs.map((d) => `<p><strong>${esc(d.term)}</strong>${d.plain ? ` <span class="deriv">AI 整理</span><br>${esc(d.plain)}` : ""}</p>`).join("")}</section>` : "";
  const tasksHtml = tasks.length ? `<section class="sec"><h3>本科生参与</h3>${tasks.map((t) => `<p>· ${esc(str(t.task) || "")}${t.task_purpose ? `<br><span style="color:var(--ink-soft);font-size:13.5px">${esc(str(t.task_purpose))}</span>` : ""}</p>`).join("")}</section>` : "";
  const prereqHtml = prereq.length ? `<section class="sec"><h3>建议前置</h3><div class="chips">${prereq.map((x) => `<span class="chip">${esc(str(x.text))}</span>`).join("")}</div></section>` : "";
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(str(pack.name_zh))} · 导师档案 · 生命科学本科生平台</title><style>${t02Css()}</style></head><body><div class="wrap">
  <div class="toolbar"><a class="back" href="../">← 返回导师目录</a> <a class="back" href="../../">← 返回本科生平台</a></div>
  <div class="hero"><div class="kicker">Academic Intelligence · 导师档案</div><h1 class="name">${esc(str(pack.name_zh))}${pack.name_en ? `<i>${esc(str(pack.name_en))}</i>` : ""}</h1><p class="role">${esc(str(pack.position || ""))}${str(pack.school_or_department) ? " · " + esc(str(pack.school_or_department)) : ""}</p>${thesis ? `<p class="thesis">${esc(thesis)}</p>` : ""}${tags.length ? `<div class="tags">${tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}</div>
  ${dirsHtml}${tasksHtml}${prereqHtml}
  <section class="sec"><h3>已核验成果</h3><div class="count"><b>${pubCount}</b><span>篇（已核验）</span></div><p class="boundary">成果计数来自已核验证据；精选/代表作功能尚未开放。</p></section>
  <details><summary>深入了解：研究问题 · 方法 · 流程</summary><div class="body">${qs.length ? `<p><strong>研究问题</strong><span class="deriv">AI 整理</span></p><ul>${qs.map((q) => `<li>${esc(q)}</li>`).join("")}</ul>` : ""}${methods.length ? `<p><strong>主要方法</strong><span class="deriv">AI 整理</span></p><ul>${methods.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` : ""}${flow.length ? `<p><strong>研究流程</strong><span class="deriv">AI 整理</span></p><ul>${flow.map((w) => `<li>${esc(w)}</li>`).join("")}</ul>` : ""}</div></details>
  <section class="sec"><h3>联系</h3><p>${profUrl ? `<a href="${profUrl}" target="_blank" rel="noopener">官方主页 ↗</a>` : "暂无公开联系方式"}<br><span style="color:var(--ink-soft);font-size:13px">邮箱等联系方式未获公开授权，不在公开档案中显示。</span></p></section>
  ${boundary ? `<p class="boundary">${esc(boundary)}</p>` : ""}
</div></body></html>`;
}

function buildProfiles() {
  const dst = path.join(SITE, "academic", "mentor");
  fs.mkdirSync(dst, { recursive: true });
  let written = 0;
  for (const id of publicIds) {
    const pk = path.join(DATA, "packs", id, "public-advisor-v1.json");
    if (!fs.existsSync(pk)) continue;
    const pack = readJSON(pk);
    fs.writeFileSync(path.join(dst, id + ".html"), renderT02(pack));
    written++;
  }
  console.log("T02 profiles written:", written);
}

/* R3 tool section — spliced into build-rebase.mjs by splice-tools.mjs */
/* ---------- 3. tool pages (R3: REAL ALPHA x2, INTERACTIVE PREVIEW x3) ---------- */
function toolCss() {
  return `body{margin:0;font-family:system-ui,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;background:#f5f7f6;color:#14231c}
.wrap{max-width:880px;margin:0 auto;padding:0 16px 60px}
.top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding:14px 0}
.back{color:#146b4a;font-size:13.5px;text-decoration:none;font-weight:600}
.back:hover{text-decoration:underline}
h1{font-size:24px;margin:6px 0 4px}
.purpose{color:#42584c;font-size:15px;line-height:1.7;margin:0 0 14px;max-width:760px}
.pill{font-size:11px;font-weight:800;letter-spacing:.05em;border-radius:999px;padding:3px 10px}
.pill.real{color:#0f5740;background:#e4f0e9;border:1px solid #146b4a}
.pill.preview{color:#8a6a2a;background:#fbf3e0;border:1px solid #b09a5f}
.caps{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:6px 0 16px}
@media(max-width:640px){.caps{grid-template-columns:1fr}}
.cap{border:1px solid #dfe7e2;background:#fff;border-radius:10px;padding:12px 14px}
.cap h2{font-size:13px;margin:0 0 8px;letter-spacing:.03em}
.cap ul{margin:0;padding-left:18px;font-size:13.5px;line-height:1.8;color:#2b3b32}
.cap.ok h2{color:#146b4a}
.cap.pending h2{color:#8a9c91}
.work{border:1px solid #dfe7e2;background:#fff;border-radius:10px;padding:14px 16px;margin:10px 0}
.work h2{font-size:15px;margin:0 0 8px}
.muted{color:#5b6b62;font-size:13px}
input[type=text],input[type=search],input[type=date],select{width:100%;padding:8px 11px;font-size:14px;border:1px solid #c8d4cc;border-radius:8px;box-sizing:border-box;margin:3px 0}
.inrow{display:flex;gap:8px;flex-wrap:wrap}
.inrow input[type=text]{flex:2;min-width:220px}
.inrow input[type=date]{flex:1;min-width:150px}
.inrow select{flex:1;min-width:120px}
.btn{background:#146b4a;color:#fff;border:0;border-radius:7px;padding:8px 14px;font-size:13.5px;cursor:pointer;margin:4px 4px 0 0}
.btn.ghost{background:#eef3f0;color:#14231c}
.item{border-top:1px solid #eef3f0;padding:10px 0}
.item b{font-size:14.5px}
.meta{color:#5b6b62;font-size:12.5px;margin:2px 0}
.sum{font-size:13.5px;margin:4px 0}
.empty{border:1px dashed #c8d4cc;border-radius:8px;padding:16px;text-align:center;color:#5b6b62}
.rank{display:flex;flex-direction:column;gap:8px;margin-top:8px}
.rank-item{border:1px solid #dfe7e2;border-radius:9px;padding:11px 13px;background:#fbfdfc}
.rank-item .rk{color:#146b4a;font-weight:800;font-size:13px}
.rank-item h3{margin:2px 0;font-size:14.5px}
.rank-item p{margin:2px 0;font-size:13px;color:#42584c}
.task-list{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.task-row{border:1px solid #e3eae6;border-radius:8px;padding:8px 10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#fff}
.task-row b{flex:1;min-width:140px;font-size:13.5px}
.task-row .muted{font-size:12px}
.foot{margin-top:18px;color:#5b6b62;font-size:12.5px;border-top:1px solid #dfe7e2;padding-top:12px}`;
}

const TOOL_BODY = {
  "bilibili-reviver": {
    title: "B站内容复活器",
    pill: "Alpha",
    tier: "REAL_ALPHA",
    sub: "把值得留下的 B站视频，整理成以后真正找得到、用得上的内容。先加入、本地保存、可搜索找回；内容理解能力正在接入。",
    available: ["真实 B 站链接加入（完整 URL / BV 号）", "本地保存（你的浏览器）", "同一视频不重复加入", "搜索：标题 / UP主 / 简介 / 主题", "打开原视频 · 删除条目"],
    pending: ["视频内容 / 字幕理解（正在接入）", "一句话总结 · 核心观点 · 标签", "为什么值得留下 · 完整内容笔记", "真实收藏夹一键同步（即将接入，需要账号授权）"],
    html: `
<div class="work">
  <h2>把链接加进本地内容库</h2>
  <div class="inrow"><input id="bi-url" type="text" placeholder="粘贴 B 站链接：https://www.bilibili.com/video/BV… 或直接贴 BV 号"><button id="bi-add" class="btn">加入</button></div>
  <p id="bi-backend" class="muted"></p>
  <p id="bi-status" class="muted"></p>
  <p class="muted">链接解析使用 B 站公开接口（匿名，不登录）；内容只保存在你自己的浏览器里。</p>
</div>
<div class="work">
  <h2>我的本地内容库 <span class="muted">（可搜索）</span></h2>
  <input id="bi-q" type="search" placeholder="搜索标题 / UP主 / 简介 / 主题">
  <div id="bi-list"></div>
</div>
<div class="work">
  <h2>内容理解（预览）</h2>
  <p class="muted">视频内容 / 字幕理解正在接入（由内容理解能力提供）。下方是预览效果，不代表你的内容已经生成总结。</p>
  <div id="bi-ug-preview"></div>
</div>`,
    js: `"use strict";
const LIB_KEY='bili_reviver_lib_v1';
function loadLib(){try{return JSON.parse(localStorage.getItem(LIB_KEY)||'[]');}catch(_){return[];}}
function saveLib(a){localStorage.setItem(LIB_KEY,JSON.stringify(a));}
/* ---- Agent14 handoff seam: BilibiliUnderstandingReader (thin, no summary generation) ----
   Reads a ContentUnderstanding object; for legacy items without understanding data it
   truthfully reports PENDING_UNDERSTANDING. States: NEW/EXTRACTING/UNDERSTANDING/READY/DEGRADED/FAILED/PENDING_UNDERSTANDING. */
window.BilibiliUnderstandingReader = {
  states: { NEW: '待处理', EXTRACTING: '正在提取', UNDERSTANDING: '正在总结', READY: '已总结', DEGRADED: '部分可用', FAILED: '处理失败', PENDING_UNDERSTANDING: '尚未生成内容总结' },
  read(cu) {
    if (!cu || !cu.processing_state) return { state: 'PENDING_UNDERSTANDING', label: this.states.PENDING_UNDERSTANDING, summary: null };
    const s = cu.processing_state;
    return { state: s, label: this.states[s] || this.states.PENDING_UNDERSTANDING, summary: cu.one_sentence_summary || null };
  }
};
function escHtml(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
async function addUrl(){
  const v=document.getElementById('bi-url').value.trim();
  const st=document.getElementById('bi-status');
  if(!v){st.textContent='请先粘贴一个 B 站链接。';return;}
  st.textContent='正在解析…';
  let info;try{const r=await fetch('/api/bili/view?url='+encodeURIComponent(v));info=await r.json();}catch(e){st.textContent='暂时无法解析，请检查网络后重试。';return;}
  if(!info.ok){st.textContent=info.error||'无法解析该链接。';return;}
  let lib=loadLib();
  if(lib.some(x=>x.bvid===info.bvid)){st.textContent='这条视频已经在你的本地内容库中（不会重复加入）。';renderLib(lib);return;}
  lib.unshift({bvid:info.bvid,title:info.title||'(无标题)',owner:info.owner||'未知UP主',desc:info.desc||'',topic:info.topic||'',url:info.url,addedAt:new Date().toISOString(),understanding:null});
  saveLib(lib);st.textContent='已加入你的本地内容库。';document.getElementById('bi-url').value='';renderLib(lib);
}
function renderLib(lib){
  const q=(document.getElementById('bi-q').value||'').trim().toLowerCase();
  const box=document.getElementById('bi-list');
  box.replaceChildren();
  const items=q?lib.filter(x=>(x.title||'').toLowerCase().includes(q)||(x.owner||'').toLowerCase().includes(q)||(x.desc||'').toLowerCase().includes(q)||(x.topic||'').toLowerCase().includes(q)):lib;
  if(!items.length){const e=document.createElement('p');e.className='empty';e.textContent=q?'没有找到相关内容':'本地内容库还是空的——先粘贴一个 B 站链接试试。';box.appendChild(e);return;}
  items.forEach(x=>{
    const rd=window.BilibiliUnderstandingReader.read(x.understanding);
    const d=document.createElement('div');d.className='item';
    const t=document.createElement('b');t.textContent=x.title;
    const m=document.createElement('div');m.className='meta';m.textContent='UP主：'+x.owner+(x.topic?' · '+x.topic:'');
    d.appendChild(t);d.appendChild(m);
    if(rd.summary){const s=document.createElement('p');s.className='sum';s.textContent='一句话总结：'+rd.summary;d.appendChild(s);}
    else if(x.desc){const s=document.createElement('p');s.className='sum';s.textContent='简介（尚未生成总结）：'+x.desc.slice(0,120);d.appendChild(s);}
    const st=document.createElement('p');st.className='muted';st.textContent=rd.label;d.appendChild(st);
    const row=document.createElement('div');
    const a=document.createElement('a');a.href=x.url;a.target='_blank';a.rel='noopener';a.textContent='打开原视频 ↗';a.style.color='#146b4a';a.style.marginRight='12px';
    const del=document.createElement('button');del.className='btn ghost';del.textContent='删除';
    del.addEventListener('click',()=>{saveLib(loadLib().filter(y=>y.bvid!==x.bvid));renderLib(loadLib());});
    row.appendChild(a);row.appendChild(del);d.appendChild(row);
    box.appendChild(d);
  });
}
/* Safe fixture preview (PREVIEW_WITH_SAFE_FIXTURE — clearly not real data) */
const UG_FIXTURE={title:'AI 工作流入门：从提示词到自动化',author:'演示UP',one_sentence_summary:'介绍 AI 工具、自动化工作流与科研场景用法。',key_points:['提示词怎么写','工作流如何串起来','科研场景示例'],topics:['科技','AI'],useful_for:['想提高效率的同学'],actionable_takeaways:['先挑一个高频小任务自动化'],mentioned_tools:['AI 助手'],why_keep:'内容适合作为入门资料反复回看',limitations:'演示数据，非真实字幕总结',extraction_quality:'fixture',original_url:'https://www.bilibili.com/video/BVDEMO0001AB',processing_state:'READY'};
function renderUgPreview(){
  const box=document.getElementById('bi-ug-preview');
  if(!box)return;
  box.replaceChildren();
  const u=UG_FIXTURE;const rd=window.BilibiliUnderstandingReader.read(u);
  const d=document.createElement('div');d.className='item';
  d.style.border='1px dashed #b09a5f';d.style.borderRadius='8px';d.style.padding='10px 12px';d.style.background='#fffdf6';
  const tag=document.createElement('span');tag.className='muted';tag.style.color='#8a6a2a';tag.textContent='预览（安全演示数据）';d.appendChild(tag);
  const t=document.createElement('b');t.textContent=' '+(u.title||'');d.appendChild(t);
  const m=document.createElement('div');m.className='meta';m.textContent='UP主：'+u.author;d.appendChild(m);
  if(rd.summary){const s=document.createElement('p');s.className='sum';s.textContent='一句话总结：'+rd.summary;d.appendChild(s);}
  if(u.topics&&u.topics.length){const c=document.createElement('div');u.topics.forEach(tp=>{const sp=document.createElement('span');sp.className='chip';sp.textContent=tp;c.appendChild(sp);});d.appendChild(c);}
  const why=document.createElement('p');why.className='muted';why.textContent='为什么值得留下：'+u.why_keep;d.appendChild(why);
  const det=document.createElement('details');det.style.marginTop='6px';
  det.innerHTML='<summary class="muted" style="cursor:pointer">查看完整笔记（预览）</summary>';
  const body=document.createElement('div');body.className='muted';body.style.padding='6px 0';
  const lines=['核心要点：'+u.key_points.join(' / '),'适合什么：'+u.useful_for.join(' / '),'行动项：'+u.actionable_takeaways.join(' / '),'提到的工具：'+u.mentioned_tools.join(' / '),'处理质量：'+u.extraction_quality,'限制：'+u.limitations];
  lines.forEach(L=>{const p=document.createElement('p');p.textContent=L;body.appendChild(p);});
  det.appendChild(body);d.appendChild(det);
  box.appendChild(d);
}
document.getElementById('bi-add').addEventListener('click',addUrl);
document.getElementById('bi-url').addEventListener('keydown',e=>{if(e.key==='Enter')addUrl();});
document.getElementById('bi-q').addEventListener('input',()=>renderLib(loadLib()));
renderLib(loadLib());
renderUgPreview();
/* ---- deployment capability boundary: LOCAL NODE vs PUBLIC STATIC ---- */
let backendOk=false;
function applyBackendState(){
  const add=document.getElementById('bi-add'),input=document.getElementById('bi-url'),banner=document.getElementById('bi-backend');
  if(!add||!banner)return;
  if(backendOk){banner.textContent='本地 review server：链接解析可用。';banner.className='muted';}
  else{add.disabled=true;input.readOnly=true;add.style.opacity='.5';banner.textContent='当前为静态预览部署：链接解析后端正在接入，暂不支持实时解析。如需体验，请在本地启动 review server（START_REVIEW.bat）后再试。';banner.className='muted';}
}
fetch('/api/bili/view?url=probe').then(function(r){return r.json();}).then(function(j){backendOk=!!(j&&('ok' in j));applyBackendState();}).catch(function(){backendOk=false;applyBackendState();});`
  },
  "today-first": {
    title: "今天先学什么",
    pill: "Alpha · 真实可用",
    tier: "REAL_ALPHA",
    sub: "把你今天要做的事列出来，帮你排出先做什么、后做什么。",
    available: ["添加你自己的任务（名称 / 截止 / 重要程度 / 预计耗时）", "真实排序：先看截止时间，再看重要程度", "删除任务 · 一键重新排序", "保存在你的浏览器（localOnly）"],
    pending: ["日历 / 课程表自动同步（尚未接入）", "读取真实学习进度"],
    html: `
<div class="work">
  <h2>添加你的任务（3–10 个）</h2>
  <div class="inrow">
    <input id="tf-name" type="text" placeholder="任务名称，如：实验报告">
    <input id="tf-due" type="date" title="截止日期（可选）">
    <select id="tf-imp"><option value="">重要程度</option><option value="3">高</option><option value="2">中</option><option value="1">低</option></select>
    <input id="tf-effort" type="text" placeholder="预计耗时（分钟，可选）" style="flex:1;min-width:120px">
  </div>
  <button id="tf-add" class="btn">添加任务</button>
  <div id="tf-tasks" class="task-list"></div>
  <div style="margin-top:10px"><button id="tf-rank" class="btn">帮我排一下今天先做什么</button><button id="tf-rerank" class="btn ghost" style="display:none">重新排序</button></div>
  <div id="tf-out"></div>
  <p class="muted">本地试用：任务只保存在你的浏览器；没有自动同步到日历。</p>
</div>`,
    js: `"use strict";
const TF_KEY='today_first_tasks_v1';
function loadTasks(){try{return JSON.parse(localStorage.getItem(TF_KEY)||'[]');}catch(_){return[];}}
function saveTasks(a){localStorage.setItem(TF_KEY,JSON.stringify(a));}
let tasks=loadTasks();
function uid(){return 't'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function todayKey(){return new Date().toISOString().slice(0,10);}
function addTask(){
  const name=document.getElementById('tf-name').value.trim();
  if(!name){return;}
  tasks.push({id:uid(),name,due:document.getElementById('tf-due').value||'',importance:Number(document.getElementById('tf-imp').value)||null,effort:document.getElementById('tf-effort').value.trim()||null});
  saveTasks(tasks);renderTasks();
  document.getElementById('tf-name').value='';document.getElementById('tf-due').value='';document.getElementById('tf-imp').value='';document.getElementById('tf-effort').value='';
}
function renderTasks(){
  const box=document.getElementById('tf-tasks');
  box.replaceChildren();
  tasks.forEach((t,i)=>{
    const r=document.createElement('div');r.className='task-row';
    const b=document.createElement('b');b.textContent=(i+1)+'. '+t.name;
    const m=document.createElement('span');m.className='muted';
    m.textContent=[t.due?('截止 '+t.due):'无截止',t.importance?('重要程度：'+({3:'高',2:'中',1:'低'})[t.importance]):'',t.effort?('约 '+t.effort+' 分钟'):''].filter(Boolean).join(' · ');
    const del=document.createElement('button');del.className='btn ghost';del.textContent='删除';
    del.addEventListener('click',()=>{tasks=tasks.filter(x=>x.id!==t.id);saveTasks(tasks);renderTasks();document.getElementById('tf-out').textContent='';});
    r.appendChild(b);r.appendChild(m);r.appendChild(del);
    box.appendChild(r);
  });
}
function rank(){
  if(!tasks.length){document.getElementById('tf-out').innerHTML='<p class="empty">还没有任务——先添加几个任务。</p>';return;}
  const today=todayKey();
  const far=String((()=>{const d=new Date(today+'T00:00:00');d.setDate(d.getDate()+365);return d.toISOString().slice(0,10);})());
  const courses=tasks.map((t,i)=>({id:'t'+i,name:t.name,status:'active',importance:t.importance||null}));
  const assessments=tasks.map((t,i)=>({id:'a'+i,course_id:'t'+i,name:'任务',weight:t.importance||null,status:'planned',deadline_id:'d'+i}));
  const deadlines=tasks.map((t,i)=>({id:'d'+i,due_at:(t.due||far)+'T23:59:00+08:00',status:'upcoming'}));
  const state={courses,assessments,deadlines,mistake_records:[],_meta:{reference_clock:new Date().toISOString()}};
  let res;
  try{res=window.AlphaEngine.todayDecision(state,{today:today});}catch(e){document.getElementById('tf-out').innerHTML='<p class="empty">排序暂时不可用。</p>';return;}
  const acts=res&&res.actions?res.actions:[];
  if(!acts.length){document.getElementById('tf-out').innerHTML='<p class="empty">暂时排不出顺序，请检查任务。';return;}
  const idxMap={};tasks.forEach((t,i)=>{idxMap['t'+i]=i;});
  const html='<div class="rank">'+acts.map((a,k)=>{
    const i=idxMap[a.courseId];const t=tasks[i];
    const imp=t&&t.importance?({3:'高',2:'中',1:'低'})[t.importance]:null;
    const reason=t&&t.due?('截止 '+t.due+(imp?' · 重要程度：'+imp:'')):('无硬截止时间 · 按重要程度排'+(imp?'（'+imp+'）':''));
    return '<div class="rank-item"><span class="rk">Top '+(k+1)+'</span><h3>'+esc(t?t.name:(a.title||''))+'</h3><p>'+esc(reason)+'</p></div>';
  }).join('')+'</div>';
  document.getElementById('tf-out').innerHTML=html;
  document.getElementById('tf-rerank').style.display='inline-block';
}
document.getElementById('tf-add').addEventListener('click',addTask);
document.getElementById('tf-name').addEventListener('keydown',e=>{if(e.key==='Enter')addTask();});
document.getElementById('tf-rank').addEventListener('click',rank);
document.getElementById('tf-rerank').addEventListener('click',rank);
renderTasks();`
  },
  "replan": {
    title: "计划重排",
    pill: "功能预览",
    tier: "PREVIEW",
    sub: "临时安排打乱计划后，重新排一下剩下的任务。",
    available: ["预览 Demo：按紧急程度重新排序", "预览 Demo：时间可行性提示"],
    pending: ["读取你的真实计划（待接入）", "与课程/任务数据结合"],
    html: `<div class="work"><button id="propose" class="btn">查看 Demo</button><div id="out"></div><p class="muted">功能预览：当前为演示数据，尚不读取你的真实计划。</p></div>`,
    js: `const out=document.getElementById('out');
document.getElementById('propose').addEventListener('click',()=>{
  const res=LearningTool.proposeReplan();
  out.replaceChildren();
  if(!res||res.error){const p=document.createElement('p');p.className='muted';p.textContent='暂时无法生成调整建议。';out.appendChild(p);return;}
  const pr=res.proposal||res.adjustment||res;
  const note=document.createElement('p');note.className='muted';
  note.textContent=pr.reason||(pr.time_feasibility==='KNOWN'?'时间估算充分，建议按顺序调整。':'部分任务没有时长信息，未做时间判断——以下仅为顺序建议。');
  out.appendChild(note);
  const c=document.createElement('p');c.className='muted';c.style.color='#b45309';c.textContent='调整仅为你预览，不会自动修改你的计划。';
  out.appendChild(c);
  const row=document.createElement('div');row.className='inrow';
  const apply=document.createElement('button');apply.className='btn';apply.textContent='确认并应用';
  apply.addEventListener('click',()=>{LearningTool.applyReplan(pr.adjustment_id||pr.id);out.textContent='已应用调整（仅本页演示，未保存）。';});
  const reject=document.createElement('button');reject.className='btn ghost';reject.textContent='不调整';
  reject.addEventListener('click',()=>{out.textContent='已忽略本次调整建议。';});
  row.appendChild(apply);row.appendChild(reject);out.appendChild(row);
});`
  },
  "zongce": {
    title: "综合测评助手",
    pill: "功能预览",
    tier: "PREVIEW",
    sub: "快速看清今年流程、要准备的材料，以及今年的信息有没有正式公布。",
    available: ["预览 Demo：今年流程与材料整理", "预览 Demo：当前年度状态（未公布时如实显示）"],
    pending: ["接入你的个人材料清单（待接入）", "计算功能（尚未开放）"],
    html: `<div class="work"><div id="list"></div><p class="muted">功能预览：当前为演示数据；本学年通知发布后，这里会显示真实节点。</p></div>`,
    js: `renderWf();
function renderWf(){
  const box=document.getElementById('list');
  const wf=WorkflowTool.get('comprehensive_assessment');
  box.replaceChildren();
  if(!wf){const p=document.createElement('p');p.className='muted';p.textContent='暂无可显示的信息。';box.appendChild(p);return;}
  const h=document.createElement('div');h.className='item';
  h.innerHTML='<b>'+WorkflowTool.esc(wf.title)+'</b>';
  const st=document.createElement('p');st.className='muted';st.textContent='当前状态：'+WorkflowTool.human(wf.current_status.state).label+' · 本学年：'+WorkflowTool.currentYear(wf).label;h.appendChild(st);
  box.appendChild(h);
}`
  },
  "scholarship": {
    title: "奖学金信息助手",
    pill: "功能预览",
    tier: "PREVIEW",
    sub: "分清今年通知和历史参考，避免拿去年的日期当今年。",
    available: ["预览 Demo：今年通知状态（未公布时如实显示）", "预览 Demo：历史参考（明确标注）"],
    pending: ["接入你的专业/年级对应奖项（待接入）", "计算功能（尚未开放）"],
    html: `<div class="work"><div id="list"></div><p class="muted">功能预览：当前为演示数据；本学年通知发布后，这里会显示真实节点。</p></div>`,
    js: `renderWf();
function renderWf(){
  const box=document.getElementById('list');
  const wf=WorkflowTool.get('annual_scholarship');
  box.replaceChildren();
  if(!wf){const p=document.createElement('p');p.className='muted';p.textContent='暂无可显示的信息。';box.appendChild(p);return;}
  const h=document.createElement('div');h.className='item';
  h.innerHTML='<b>'+WorkflowTool.esc(wf.title)+'</b>';
  const st=document.createElement('p');st.className='muted';st.textContent='当前状态：'+WorkflowTool.human(wf.current_status.state).label+' · 本学年：'+WorkflowTool.currentYear(wf).label;h.appendChild(st);
  const hist=document.createElement('p');hist.className='muted';hist.textContent='历史参考（2024-2025，仅供了解流程）';h.appendChild(hist);
  box.appendChild(h);
}`
  }
};

/* ---------- Feedback footer (fail-closed, config-driven, deployment-base-safe) ---------- */
function feedbackSnippet(mentor, configPath) {
  const lead = mentor
    ? "当前为试用版本。导师信息来自公开资料整理；如发现信息错误，欢迎反馈。"
    : "当前为试用版本，功能在逐步完善中；如遇到问题，欢迎反馈。";
  return `<footer class="r4-feedback"><p>${lead}<br>
有建议、发现信息错误，或者有哪里不好用？欢迎直接告诉我。<br>
<span id="fb-form">反馈问卷正在配置</span> · <span id="fb-mail">邮件联系方式正在配置</span></p></footer>
<a id="fb-float" class="r4-fb-float" href="#" rel="noopener" aria-label="反馈 / 联系我">反馈</a>
<style>.r4-feedback{margin:26px 0 10px;padding:12px 16px;border-top:1px solid #dfe7e2;color:#5b6b62;font-size:13px;font-family:system-ui,"PingFang SC",sans-serif;line-height:1.7}.r4-feedback a{color:#146b4a;font-weight:700;text-decoration:none}.r4-feedback a:hover{text-decoration:underline}.r4-fb-float{position:fixed;right:16px;bottom:16px;z-index:100;background:#146b4a;color:#fff;font-size:12.5px;font-weight:700;padding:8px 14px;border-radius:999px;box-shadow:0 4px 14px rgba(15,77,51,.28);text-decoration:none;font-family:system-ui,"PingFang SC",sans-serif}.r4-fb-float:hover{background:#11583a}@media(max-width:480px){.r4-fb-float{bottom:14px;right:14px}}</style>
<script>(function(){var cfgPath=${JSON.stringify(configPath)};fetch(cfgPath).then(function(r){return r.json();}).then(function(cfg){var F=document.getElementById('fb-form'),M=document.getElementById('fb-mail'),FL=document.getElementById('fb-float');if(cfg&&cfg.feedbackUrl){var a=document.createElement('a');a.href=cfg.feedbackUrl;a.target='_blank';a.rel='noopener';a.textContent='[填写反馈]';F.replaceWith(a);if(FL){FL.href=cfg.feedbackUrl;FL.target='_blank';}}else{F.textContent='反馈问卷正在配置';if(FL)FL.style.display='none';}if(cfg&&cfg.feedbackEmail){var m=document.createElement('a');m.href='mailto:'+cfg.feedbackEmail+'?subject='+encodeURIComponent('[本科生平台反馈] '+document.title)+'&body='+encodeURIComponent('当前页面：'+location.href);m.textContent='[邮件联系]';M.replaceWith(m);}else{M.textContent='邮件联系方式正在配置';}}).catch(function(){var F=document.getElementById('fb-form'),M=document.getElementById('fb-mail'),FL=document.getElementById('fb-float');if(F)F.textContent='反馈问卷正在配置';if(M)M.textContent='邮件联系方式正在配置';if(FL)FL.style.display='none';});})();</script>`;
}
function injectFeedback() {
  const pages = [
    { rel: "academic/index.html", mentor: true },
    { rel: "academic/profile/profile.html", mentor: true },
  ];
  const toolsDir = path.join(SITE, "tools");
  if (fs.existsSync(toolsDir)) {
    for (const f of fs.readdirSync(toolsDir)) { if (f.endsWith(".html")) pages.push({ rel: "tools/" + f, mentor: false }); }
  }
  const servicesDir = path.join(SITE, "services");
  if (fs.existsSync(servicesDir)) {
    for (const f of fs.readdirSync(servicesDir)) { if (f.endsWith(".html")) pages.push({ rel: "services/" + f, mentor: false }); }
  }
  pages.push({ rel: "updates.html", mentor: false });
  let n = 0;
  for (const page of pages) {
    const p = path.join(SITE, page.rel);
    if (!fs.existsSync(p)) continue;
    let h = fs.readFileSync(p, "utf8");
    if (h.includes("r4-feedback")) continue;
    const depth = page.rel.split("/").length - 1;
    const configPath = "../".repeat(depth) + "data/site-config.json";
    h = h.replace("</body>", feedbackSnippet(page.mentor, configPath) + "\n</body>");
    fs.writeFileSync(p, h);
    n++;
  }
  console.log("feedback footer injected into", n, "pages");
}

/* Frozen T02 module + public-only packs (review-only packs must NOT ship publicly). */
function buildProfileModule() {
  const src = path.join(__dirname, "..", "site-src", "t02-src");
  const dst = path.join(SITE, "academic", "profile");
  fs.mkdirSync(path.join(dst, "css"), { recursive: true });
  fs.mkdirSync(path.join(dst, "data", "evidence"), { recursive: true });
  for (const f of ["template.js", "app.js", "data.js", "profile.html"]) {
    fs.copyFileSync(path.join(src, f), path.join(dst, f));
  }
  fs.copyFileSync(path.join(src, "template.css"), path.join(dst, "css", "template.css"));
  fs.copyFileSync(path.join(src, "crossref_5dois.json"), path.join(dst, "data", "evidence", "crossref_5dois.json"));
  fs.copyFileSync(path.join(src, "crossref_dates.json"), path.join(dst, "data", "evidence", "crossref_dates.json"));
  const srcData = path.join(__dirname, "..", "site-src", "academic", "profile", "data");
  fs.copyFileSync(path.join(srcData, "public-dto.json"), path.join(dst, "data", "public-dto.json"));
  const staleCohort = path.join(dst, "data", "cohort-13.json");
  if (fs.existsSync(staleCohort)) { fs.unlinkSync(staleCohort); }
  const dto = readJSON(path.join(srcData, "public-dto.json"));
  const pids = new Set((dto.advisors || []).map(a => a.id));
  let copied = 0;
  for (const id of pids) {
    const srcPack = path.join(srcData, "packs", id);
    if (fs.existsSync(srcPack)) { fs.cpSync(srcPack, path.join(dst, "data", "packs", id), { recursive: true }); copied++; }
  }
  console.log("T02 profile module written; public packs copied:", copied);
}

/* ---------- 3.5 student services: real simple Guide pages (honest, boundary-labeled) ---------- */
const SERVICES = [
  { id: "ppt", title: "PPT制作 / PPT汇报", sub: "课程汇报、项目汇报与学术展示的整理思路", points: ["先列大纲再填内容：开场（背景与问题）→ 方法 → 结论与下一步。", "每页只讲一个点，正文少、图优先；图表和字体统一。", "汇报前练习并控制时间；提前检查投影/字体/格式兼容。"], note: "以上为通用汇报建议，具体要求以课程 / 学院安排为准。" },
  { id: "baoxiao", title: "报销指南", sub: "整理常见报销流程、材料与注意事项", points: ["报销通常需要：发票、支付凭证、申请表与必要的审批意见。", "建议同时保留电子与纸质凭证，提交前核对姓名、金额与用途。", "按学院 / 部门通知的时间与渠道提交；材料不全及时补齐。"], note: "以上为通用说明，具体流程与要求以学院 / 部门正式通知为准。" },
  { id: "excel", title: "Excel表 / Excel辅助", sub: "表格整理、公式与数据处理的常见方法", points: ["先定表头与数据类型，再录入；避免合并单元格带来统计问题。", "常用函数：SUM/IF/VLOOKUP/COUNTIF；用筛选、排序与冻结窗格快速核对。", "常见任务：清单、统计、成绩表、图表；处理前先备份原表。"], note: "以上为通用 Excel 使用建议，具体以课程 / 任务要求为准。" },
  { id: "lab", title: "实验课", sub: "实验课程准备、步骤理解、记录与复盘辅助", points: ["课前预习：实验目的、原理与关键步骤，标注不确定处。", "记录要即时、原始、可复核：数据、现象与异常都记下来。", "课后复盘：哪些步骤影响结果、下次如何改进。"], note: "以上为通用实验学习建议；实验安全与具体操作以课程要求为准。" },
  { id: "aifu", title: "AI辅学", sub: "用 AI 理解课程、总结材料并完成任务（先核实来源）", points: ["用 AI 帮助理解概念、总结材料、生成练习题，作为复习辅助。", "关键结论要回到教材 / 讲义核实来源，不直接照搬 AI 输出。", "课程作业是否允许使用 AI，以任课老师的要求为准。"], note: "以上为通用使用建议；AI 输出仅供参考，请自行核实。" },
  { id: "qingjia", title: "请假说明", sub: "常见请假流程、材料与沟通说明", points: ["尽量提前申请：说明原因、时间与补课 / 补交安排。", "需要材料时，通常包括请假申请、证明材料等（以要求为准）。", "特殊情况事后补办：及时与辅导员 / 任课老师说明。"], note: "以上为通用说明，具体流程与材料以学院正式通知为准。" },
];
function buildServices() {
  const dst = path.join(SITE, "services");
  fs.mkdirSync(dst, { recursive: true });
  for (const s of SERVICES) {
    const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(s.title)} · 生命科学本科生平台</title><style>${toolCss()}</style></head><body><div class="wrap">
<div class="top"><a class="back" href="../">← 返回本科生平台</a><span class="pill">服务说明</span></div>
<h1>${esc(s.title)}</h1>
<p class="purpose">${esc(s.sub)}</p>
<div class="work"><h2>这份指南</h2>
<ul class="task-ul" style="padding-left:18px;margin:6px 0">${s.points.map(p => `<li style="font-size:14px;line-height:1.9;color:#2b3b32">${esc(p)}</li>`).join("")}</ul>
<p class="muted">${esc(s.note)}</p></div>
<div class="foot">返回<a class="back" href="../">本科生平台</a></div>
</div></body></html>`;
    fs.writeFileSync(path.join(dst, s.id + ".html"), html);
  }
  console.log("service guide pages written:", SERVICES.length);
}

/* ---------- Public update log (visitor-facing; user language, not release notes) ---------- */
const PUBLIC_UPDATES = [
  {
    version: "2026年8月14日",
    title: "AI 可以帮你干什么？第一批 Everyday AI 方向上线",
    points: [
      "新增「AI 可以帮你干什么？」展示区，把正在尝试解决的真实问题摆出来。",
      "加入 PPT、报销、Excel、请假等现实任务方向。",
      "加入文件、C盘、手机和重复操作等数字生活方向。",
      "加入 AI 辅助学习与 AI 使用专题。",
      "开始通过问卷收集最值得优先做实的问题。",
      "Academic Intelligence 继续保留并持续完善。",
    ],
    latest: true,
  },
  {
    version: "v1.0 · 2026年8月5日",
    title: "生命科学本科生培养与科研服务平台首版上线",
    points: [
      "平台首页。",
      "导师与研究方向信息库。",
      "首批公开导师。",
      "搜索 / 筛选。",
      "信息来源。",
      "科研问题 / 方法路线等。",
    ],
    latest: false,
  },
  {
    version: "v0.5 Beta · 2026年7月29日",
    title: "导师信息库测试版",
    points: ["导师信息库测试版。"],
    latest: false,
  },
];

function buildUpdateLog() {
  const dst = path.join(SITE, "updates.html");
  const entries = PUBLIC_UPDATES.map((u) => `
<article class="log-entry">
  <div class="log-meta">${esc(u.version)}${u.latest ? ' <span class="pill real">最新</span>' : ""}</div>
  <h2>${esc(u.title)}</h2>
  <ul>${u.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
</article>`).join("");
  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>更新日志 · 生命科学本科生平台</title><style>${toolCss()}
.log-list{display:flex;flex-direction:column;gap:14px;margin-top:6px}
.log-entry{border:1px solid #dfe7e2;background:#fff;border-radius:10px;padding:16px 18px}
.log-meta{color:#5b6b62;font-size:12.5px;margin-bottom:6px;display:flex;align-items:center;gap:8px}
.log-entry h2{font-size:16.5px;margin:0 0 8px}
.log-entry ul{margin:0;padding-left:18px;font-size:13.5px;line-height:1.85;color:#2b3b32}
</style></head><body><div class="wrap">
<div class="top"><a class="back" href="./">← 返回平台首页</a><span class="pill real">更新日志</span></div>
<h1>更新日志</h1>
<p class="purpose">这里是平台的公开更新记录：最近在做什么、新增了什么、接下来往哪里走。</p>
<div class="log-list">${entries}</div>
<div class="foot">更多更新会陆续在这里发布。</div>
</div></body></html>`;
  fs.writeFileSync(dst, html);
  console.log("public update log written");
}

function buildTools() {
  const dst = path.join(SITE, "tools");
  const shared = path.join(dst, "_shared");
  fs.mkdirSync(shared, { recursive: true });
  fs.copyFileSync(path.join("..", "first-usable-v1", "js", "learning", "alpha-engine.js"), path.join(shared, "alpha-engine.js"));
  fs.copyFileSync(path.join("..", "first-usable-v1", "js", "learning", "learning-fixtures.js"), path.join(shared, "learning-fixtures.js"));
  fs.copyFileSync(path.join("..", "first-usable-v1", "js", "workflow", "workflow-reader.js"), path.join(shared, "workflow-reader.js"));

  const sharedJs = `"use strict";
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
`;
  fs.writeFileSync(path.join(shared, "shared.js"), sharedJs);

  for (const [key, meta] of Object.entries(TOOL_BODY)) {
    fs.writeFileSync(path.join(dst, key + ".html"), toolHtml(key, meta));
  }
  console.log("tool pages written:", Object.keys(TOOL_BODY).length);
}

function toolHtml(key, meta) {
  const pillCls = meta.tier === "REAL_ALPHA" ? "real" : "preview";
  const extraScripts = key === "replan" || key === "today-first" ? `<script src="_shared/alpha-engine.js"></script>` : "";
  const wfScripts = key === "zongce" || key === "scholarship" ? `<script src="_shared/workflow-reader.js"></script>` : "";
  const preJs = key === "replan" || key === "today-first" ? `<script src="_shared/learning-fixtures.js"></script>` : "";
  const toolDef = key === "replan" || key === "today-first" ? `<script>
const LS = (typeof LEARNING_FIXTURES !== "undefined") ? LEARNING_FIXTURES : (window.LEARNING_FIXTURES || null);
const LearningTool={
  proposeReplan(){const p=(LS.learning_plans||[]).find(x=>x.status==='active')||(LS.learning_plans||[])[0];return window.AlphaEngine.proposeReplan(LS,p?p.id:null);},
  applyReplan(id){let s=LS;const c=window.AlphaEngine.confirmReplan(s,id);if(c&&c.state)s=c.state;const a=window.AlphaEngine.applyReplan(s,id);if(a&&a.state)LS=a.state;}
};
</script>` : "";
  const wfDef = key === "zongce" || key === "scholarship" ? `<script>
const WF = (typeof WORKFLOW_READER !== "undefined") ? WORKFLOW_READER : (window.WORKFLOW_READER || null);
const WorkflowTool={
  esc:(s)=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),
  human(state){const s=String(state||'').toUpperCase();const m={CONFIRMED:'已确认',HISTORICAL:'历史参考',UNCERTAIN:'待确认',PENDING_ANNUAL_NOTICE:'等待本学年正式通知',NOT_CALCULATION_READY:'计算功能尚未开放'};return{label:m[s]||'状态待确认'};},
  get(k){return (WF&&WF.workflows||{})[k]||null;},
  currentYear(wf){const n=wf.current_year_key_nodes||{};if(String(n.state||'').toUpperCase()==='PENDING_ANNUAL_NOTICE')return{label:'暂未公布'};return{label:n.label||'已公布'};}
};
</script>` : "";
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(meta.title)} · 生命科学本科生平台</title><style>${toolCss()}</style></head><body><div class="wrap">
<div class="top"><a class="back" href="../">← 返回本科生平台</a><span class="pill ${pillCls}">${meta.pill}</span></div>
<h1>${esc(meta.title)}</h1>
<p class="purpose">${esc(meta.sub)}</p>
<div class="caps">
  <div class="cap ok"><h2>✓ 当前可用能力</h2><ul>${meta.available.map(a => `<li>${esc(a)}</li>`).join("")}</ul></div>
  <div class="cap pending"><h2>○ 待接入能力</h2><ul>${meta.pending.map(a => `<li>${esc(a)}</li>`).join("")}</ul></div>
</div>
${meta.html}
<div class="foot">状态：${meta.pill} · 返回<a class="back" href="../">本科生平台</a></div>
<script src="_shared/shared.js"></script>
${extraScripts}${preJs}${wfScripts}${toolDef}${wfDef}
<script>${meta.js}</script>
</div></body></html>`;
}

function cleanupOldProfiles() {
  const oldDir = path.join(SITE, "academic", "mentor");
  if (fs.existsSync(oldDir)) { fs.rmSync(oldDir, { recursive: true, force: true }); console.log("removed old static profile pages"); }
  for (const f of ["profile.js", "profile.css"]) {
    const p = path.join(SITE, "academic", "profile", f);
    if (fs.existsSync(p)) { fs.unlinkSync(p); console.log("removed old profile artifact:", f); }
  }
}

/* ---------- 4. Build-time public projection (P1: review-only must NOT ship) ----------
 * Canonical/review data stays in the internal workspace; the PUBLIC artifact is a
 * projection that removes review-only mentors (guo-hui, hu-zhengmao) and demo/synthetic
 * report files. UI-runtime hiding is NOT sufficient.
 */
function publicProjection() {
  const REVIEW_ONLY = ["guo-hui", "hu-zhengmao"];
  const DEMO_REPORTS = ["Liu_advisor_profile_v1_5_demo_display.md", "Li_advisor_profile_v1_5_demo_display.md"];
  const REVIEW_REPORTS = ["Hu_Zhengmao_profile_academic_zh.md", "Guo_Hui_profile_academic_zh.md"];
  const isReviewOnly = (id) => REVIEW_ONLY.some((r) => String(id || "").toLowerCase().includes(r));

  // 1) academic/assets/data.js -> public-only DIRECTORY_DATA
  const dataJsPath = path.join(SITE, "academic", "assets", "data.js");
  if (fs.existsSync(dataJsPath)) {
    let raw = fs.readFileSync(dataJsPath, "utf8");
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      const d = JSON.parse(m[0]);
      const before = (d.mentors || []).length;
      const publicMentors = (d.mentors || []).filter((x) => !isReviewOnly(x.id) && x.eligible !== false);
      d.mentors = publicMentors;
      d.reviewCount = publicMentors.length;
      d.publicCount = publicMentors.length;
      d.reviewOnlyCount = 0;
      const projected = "window.DIRECTORY_DATA = " + JSON.stringify(d, null, 1) + ";\n";
      fs.writeFileSync(dataJsPath, projected);
      console.log("data.js projected:", before, "->", publicMentors.length);
    }
  }

  // 2) data/advisors.json -> remove review-only advisors
  const adjPath = path.join(SITE, "data", "advisors.json");
  if (fs.existsSync(adjPath)) {
    const j = JSON.parse(fs.readFileSync(adjPath, "utf8"));
    const arr = Array.isArray(j) ? j : (j.advisors || []);
    const kept = arr.filter((a) => !isReviewOnly(a.id || a.advisor_id || a.name_zh));
    if (Array.isArray(j)) { fs.writeFileSync(adjPath, JSON.stringify(kept, null, 1)); }
    else { j.advisors = kept; j.advisorCount = kept.length; fs.writeFileSync(adjPath, JSON.stringify(j, null, 1)); }
    console.log("advisors.json projected:", arr.length, "->", kept.length);
  }

  // 3) remove review-only + demo/synthetic report files
  for (const f of [...REVIEW_REPORTS, ...DEMO_REPORTS]) {
    const p = path.join(SITE, "reports", f);
    if (fs.existsSync(p)) { fs.unlinkSync(p); console.log("removed public report:", f); }
  }
}

buildDirectory();
buildProfileModule();
buildServices();
buildUpdateLog();

cleanupOldProfiles();
injectFeedback();

console.log('site assembly complete');
