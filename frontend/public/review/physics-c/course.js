(function () {
  "use strict";

  var SECTION_ORDER = [
    "start",
    "how-page",
    "have",
    "tools",
    "mat-outline",
    "mat-huangben",
    "mat-finals",
    "mat-midterm",
    "mat-guides",
    "external",
    "college",
    "time",
    "map",
    "loop",
    "history",
    "sprint",
    "about",
  ];

  function readerUrl(path) {
    return "read.html?path=" + encodeURIComponent(path) + "&from=course";
  }

  var HUANGBEN_ANS_BASE = "资料/02_练习题/练习册答案/医用物理学练习册答案/";
  var HUANGBEN_ANS = [
    "练习1 力学基本定律（一）.pdf",
    "练习2  力学基本定律（二）.pdf",
    "练习3  力学基本定律（三）.pdf",
    "练习4  力学基本定律（四）.pdf",
    "练习5 力学基本定律（五）.pdf",
    "练习6  物体的形变.pdf",
    "练习7  流体力学（一）.pdf",
    "练习8  流体力学（二）.pdf",
    "练习9  机械振动（一）.pdf",
    "练习10  机械振动（二）.pdf",
    "练习11  波动（一）.pdf",
    "练习12 波动（二）.pdf",
    "练习13 统计物理学基础（一）.pdf",
    "练习14  统计物理学基础（二）.pdf",
    "练习15  统计物理学基础（三）.pdf",
    "练习16  热力学基础（一）.pdf",
    "练习17  热力学基础（二）.pdf",
    "练习18  热力学基础（三）.pdf",
    "练习19  静电场（一）.pdf",
    "练习20  静电场（二）.pdf",
    "练习21   静电场（三）.pdf",
    "练习22  恒定电流.pdf",
    "练习23  稳恒磁场（一）.pdf",
    "练习24  稳恒磁场（二）.pdf",
    "练习25  电磁感应与电磁波（一）.pdf",
    "练习26  电磁感应与电磁波（二）.pdf",
    "练习27  波动光学（一）.pdf",
    "练习28  波动光学（二）.pdf",
    "练习29  几何光学（一）.pdf",
    "练习30  几何光学（一）.pdf",
    "练习31  量子力学基础（一）.pdf",
    "练习32  量子力学基础（二）.pdf",
    "练习33  激光及其医学应用.pdf",
    "练习34 X射线.pdf",
  ];

  var FILES = {
    outline: "资料/01_知识点大纲提纲/(供参考）大学物理C复习提纲.pdf",
    midtermPaper: "资料/03_历年真题/2026年上学期大学物理C（医用物理学）期中试卷.pdf",
    midtermAnswer: "资料/03_历年真题/2026年上学期大学物理C期中考试答案.pdf",
    midtermGuide: "资料/04_摘要与笔记/期中试卷_保姆级逐题解析.md",
    emGuide: "资料/04_摘要与笔记/电磁学大题_保姆级逐题解析.md",
    opticsGuide: "资料/04_摘要与笔记/光学大题_保姆级逐题解析.md",
    opticsMcq: "资料/04_摘要与笔记/光学选择填空_保姆级.md",
    exam2022: "资料/03_历年真题/2022年下学期医用物理学试卷.doc",
    exam2023: "资料/03_历年真题/2023年下学期医用物理学试卷.doc",
    exam2024: "资料/03_历年真题/2024年下学期医用物理学试卷.doc",
    huangbenQ: "资料/02_练习题/黄本题目/大学物理练习册原件.pdf",
    huangbenAns: "资料/02_练习题/练习册答案/医用物理学练习册答案/练习1 力学基本定律（一）.pdf",
  };

  function huangbenAnswerLinksHtml() {
    return (
      '<div class="hb-ans-grid" id="mat-huangben-answers">' +
      HUANGBEN_ANS.map(function (file, i) {
        var path = HUANGBEN_ANS_BASE + file;
        var label = "练习 " + (i + 1);
        return (
          '<a class="btn btn--ans" href="' +
          readerUrl(path) +
          '" target="_blank" rel="noopener">' +
          label +
          "</a>"
        );
      }).join("") +
      "</div>"
    );
  }

  var HAVE = [
    { text: "老师发布的复习提纲", tier: "official" },
    { text: "2026 上学期期中试卷 + 官方答案", tier: "official" },
    { text: "2022 / 2023 / 2024 下学期期末真题", tier: "fact" },
    { text: "黄本原题 PDF", tier: "fact" },
    { text: "黄本练习 1–34 答案", tier: "fact" },
    { text: "4 份站长整理", tier: "site" },
  ];

  var MISSING = [
    "任课老师官方 PPT",
    "任课老师当学期画重点 / 复习重点",
    "当学期明确考试范围",
    "当学期题型与分值分配",
    "更多年份完整真题",
    "其他经人工确认的课程资料",
  ];

  var TOOLS = [
    {
      id: "mat-outline",
      title: "复习提纲",
      hook: "「忘了整门课到底有哪些内容时，用它最快。」",
      source: "老师发布 · 官方资料",
      detailSummary: "我建议怎么用？",
      actions: [{ label: "打开提纲", path: FILES.outline, primary: true }],
      detail: [
        { t: "official", html: "28 页考点与公式，文件名含「供参考」。" },
        { t: "site", html: "适合串全册、错题回去对章节。" },
        {
          t: "exp",
          html: "提纲很适合查漏，但别光靠打勾判断自己会不会——最好配合做题，最后再来翻。",
        },
      ],
    },
    {
      id: "mat-huangben",
      title: "黄本",
      hook: "「真正拿来自己刷题的主力资料。」",
      source: "官方练习册 · 题目 + 答案已齐",
      detailSummary: "怎么刷？",
      actions: [
        { label: "打开题目", path: FILES.huangbenQ, primary: true },
        { label: "打开答案", path: FILES.huangbenAns, anchor: "#mat-huangben-answers" },
      ],
      detail: [
        { t: "fact", html: "题目：整册扫描 PDF（34 页）。答案：练习 1–34 各一份，按编号对照。" },
        { t: "exp", html: "流程：做题 → 对答案 → 卡步骤再看站长整理或其他解析。" },
        { t: "exp", html: "很多题和历年真题同源，但更按专题拆开，适合针对性练。" },
      ],
      answerGrid: true,
    },
    {
      id: "mat-finals",
      title: "历年真题",
      hook: "「想知道自己到底会不会，做一套卷子最直接。」",
      source: "历年期末卷 · Word 下载",
      detailSummary: "什么时候刷？",
      actions: [
        { label: "2022 下", path: FILES.exam2022 },
        { label: "2023 下", path: FILES.exam2023 },
        { label: "2024 下", path: FILES.exam2024 },
      ],
      detail: [
        { t: "fact", html: "三份下学期卷，下载后用 WPS / Word 打开。" },
        { t: "exp", html: "不知道弱项时，可以先拿一套限时做，当摸底。" },
        { t: "site", html: "公式还不会时硬刷会挫败，先有一点基础再刷更顺。" },
      ],
    },
    {
      id: "mat-midterm",
      title: "2026 期中卷",
      hook: "「可以先拿一套完整卷子摸底。」",
      source: "2026 上学期 · 官方试卷 + 答案",
      detailSummary: "为什么适合摸底？",
      actions: [
        { label: "试卷", path: FILES.midtermPaper, primary: true },
        { label: "官方答案", path: FILES.midtermAnswer },
      ],
      detail: [
        { t: "official", html: "完整期中卷 + 官方答案 PDF。" },
        { t: "exp", html: "不知道从哪开始时，先做一套看自己卡在哪。" },
        { t: "site", html: "只复习后半册时可跳过。" },
      ],
    },
    {
      id: "mat-guides",
      title: "站长整理",
      hook: "「真的卡住，再来看题目是怎么一步一步拆的。」",
      source: "站长整理 · 个人辅学资料（非官方答案）",
      detailSummary: "什么时候看？",
      actions: [
        { label: "期中", path: FILES.midtermGuide },
        { label: "电磁", path: FILES.emGuide },
        { label: "光学大题", path: FILES.opticsGuide },
        { label: "光学选择填空", path: FILES.opticsMcq },
      ],
      detail: [
        { t: "site", html: "4 份：期中卷逐题、电磁大题、光学大题、光学选择填空。" },
        { t: "exp", html: "先自己做，再打开同题；时间极紧、真的卡死时才优先看。" },
      ],
    },
  ];

  var MODES = {
    semester: {
      title: "一个学期",
      now: [
        "跟课理解",
        "复习提纲",
        "黄本刷题",
        "真题阶段性自测",
        "外部学习资源（待补充）",
        "学院辅学活动（待补充）",
      ],
      later: ["站长整理（卡步骤时）", "更多套真题"],
      skip: ["不必一开始就只刷期末卷"],
      why: "有时间就把基础铺开，用做题发现薄弱处。",
      how: "跟课 → 提纲串框架 → 黄本练 → 卡住看解析 → 阶段性做真题。",
    },
    twoMonths: {
      title: "约 2 个月",
      now: ["复习提纲", "黄本专题", "真题 2–3 套", "站长整理（卡步骤时）"],
      later: ["期中卷（前半册弱时）"],
      skip: ["重复性很高的泛化视频", "提纲通读（只看薄弱章）"],
      why: "开始压缩，但还要留时间真正做题。",
      how: "提纲串结构 → 黄本 / 真题练 → 错题回流提纲。",
    },
    twoWeeks: {
      title: "约 2 周",
      now: ["真题 1–2 套摸底", "黄本补薄弱专题", "站长整理", "提纲查漏"],
      later: ["期中卷"],
      skip: ["黄本 34 份全刷", "多份整理通读"],
      why: "先找漏洞，再专题补，最后提纲串一遍。",
      how: "卷子摸底 → 找弱项 → 黄本练 → 卡住看整理 → 提纲翻错题章。",
    },
    sprint: {
      title: "约 3 天",
      now: ["期中卷 + 答案", "1 份最卡专题的站长整理"],
      later: [],
      skip: ["多套 doc 真题", "黄本全套", "提纲通读"],
      why: "时间很少，用冲刺站 + 最小资料组合。",
      how: "卷子摸底 → 补薄弱专题 → 提纲查漏（见冲刺站）。",
      sprint: true,
    },
  };

  var HISTORY = [
    {
      tier: "exp",
      text: "上一学年复习时，感觉光学题量不少（个人印象，不代表今年）。",
    },
    {
      tier: "exp",
      text: "印象中期末大题好像有五道左右（记不清，以当年试卷为准）。",
    },
    {
      tier: "exp",
      text: "有些题和黄本 / 历年卷有似曾相识感，但不保证今年还是原题。",
    },
    {
      tier: "exp",
      text: "短时间复习时，我会：卷子摸底 → 薄弱专题 → 黄本 → 卡住看整理 → 最后提纲查漏。",
    },
    {
      tier: "fact",
      text: "当时用的线上资料：提纲、2026 期中、2022–2024 下 doc、4 份站长整理、黄本题目与答案。",
    },
  ];

  var TOPICS = [
    { t: "力学", r: "Ch1", m: "提纲、期中卷、黄本练习 1–5" },
    { t: "弹性 / 流体", r: "Ch2–3", m: "提纲、黄本 6–8" },
    { t: "振动波动 / 统计 / 热力学", r: "Ch4–6", m: "提纲、期中、黄本 9–18" },
    { t: "静电场", r: "Ch7", m: "提纲、期中、电磁整理" },
    { t: "磁场 / 电磁感应", r: "Ch9–10", m: "提纲、电磁整理、真题" },
    { t: "光学", r: "Ch11–12", m: "光学两份站长整理、黄本 27–30" },
    { t: "量子", r: "Ch13", m: "提纲、黄本 31–34、真题选择" },
  ];

  function tierLabel(t) {
    if (t === "official") return '<span class="tier tier--official">官方</span>';
    if (t === "fact") return '<span class="tier tier--fact">资料事实</span>';
    if (t === "site") return '<span class="tier tier--site">站长整理</span>';
    return '<span class="tier tier--exp">站长经验</span>';
  }

  function disclosureSummary(label) {
    return (
      '<summary class="disclosure-trigger">' +
      '<span class="disclosure-label">' + label + "</span>" +
      '<span class="disclosure-icon" aria-hidden="true">⌄</span>' +
      "</summary>"
    );
  }

  function btn(a) {
    if (a.anchor) {
      return '<a class="btn" href="' + a.anchor + '">' + a.label + "</a>";
    }
    if (!a.path) return "";
    var cls = "btn" + (a.primary ? " btn--primary" : "");
    return (
      '<a class="' + cls + '" href="' + readerUrl(a.path) + '" target="_blank" rel="noopener">' + a.label + "</a>"
    );
  }

  function renderHave() {
    var root = document.getElementById("have-list");
    HAVE.forEach(function (item) {
      var li = document.createElement("li");
      li.innerHTML = tierLabel(item.tier) + item.text;
      root.appendChild(li);
    });
    var miss = document.getElementById("miss-list");
    MISSING.forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      miss.appendChild(li);
    });
  }

  function renderTools() {
    var root = document.getElementById("tool-cards");
    TOOLS.forEach(function (tool) {
      var card = document.createElement("article");
      card.className = "tool-card";
      card.id = tool.id;
      var detailHtml = tool.detail
        .map(function (x) {
          return "<p>" + tierLabel(x.t) + x.html + "</p>";
        })
        .join("");
      card.innerHTML =
        "<div class=\"tool-head\"><h3>" +
        tool.title +
        "</h3><p class=\"tool-hook\">" +
        tool.hook +
        "</p><p class=\"tool-source\">" +
        tool.source +
        "</p></div>" +
        '<div class="tool-actions">' +
        tool.actions.map(btn).join("") +
        "</div>" +
        '<details class="disclosure">' +
        disclosureSummary(tool.detailSummary) +
        '<div class="tool-detail">' +
        detailHtml +
        (tool.footnote ? "<p>" + tool.footnote + "</p>" : "") +
        "</div></details>" +
        (tool.answerGrid
          ? '<details class="disclosure" id="mat-huangben-answers-wrap">' +
            disclosureSummary("练习 1–34 全部答案") +
            '<div class="tool-detail">' +
            huangbenAnswerLinksHtml() +
            "</div></details>"
          : "");
      root.appendChild(card);
    });
  }

  function renderSlots() {
    document.getElementById("external").innerHTML =
      '<div class="slot-card">' +
      "<h3>外部学习资源 <span class=\"slot-badge\">待补充</span></h3>" +
      "<p>这里以后会补一些真正值得看的 B 站课程、UP 主和练习资源。时间充足时，学这门课不只有本站几份考试资料。</p>" +
      "</div>";

    document.getElementById("college").innerHTML =
      '<div class="slot-card">' +
      "<h3>学院辅学活动 <span class=\"slot-badge\">待补充</span></h3>" +
      "<p>除了自己看资料，学院也可能会有面对学生的辅学活动。如果后续拿到准确安排，会整理到这里。</p>" +
      "</div>";
  }

  function renderModes() {
    var tabs = document.getElementById("mode-tabs");
    var panels = document.getElementById("mode-panels");
    var sidebarModes = document.getElementById("sidebar-modes");
    var keys = ["semester", "twoMonths", "twoWeeks", "sprint"];

    keys.forEach(function (key, i) {
      var m = MODES[key];
      var tab = document.createElement("button");
      tab.type = "button";
      tab.className = "mode-tab" + (i === 0 ? " is-active" : "");
      tab.dataset.mode = key;
      tab.textContent = m.title;
      tabs.appendChild(tab);

      var sLi = document.createElement("li");
      sLi.innerHTML = '<a href="#time" data-mode="' + key + '">' + m.title + "</a>";
      sidebarModes.appendChild(sLi);

      var panel = document.createElement("div");
      panel.className = "mode-panel" + (i === 0 ? " is-active" : "");
      panel.dataset.mode = key;
      panel.innerHTML =
        '<div class="mode-grid">' +
        '<div class="mode-col"><h4>现在最值得用</h4><ul>' +
        m.now.map(function (x) { return "<li>" + x + "</li>"; }).join("") +
        "</ul></div>" +
        '<div class="mode-col"><h4>有时间再补</h4><ul>' +
        (m.later.length ? m.later.map(function (x) { return "<li>" + x + "</li>"; }).join("") : "<li>—</li>") +
        "</ul></div>" +
        '<div class="mode-col"><h4>可以先不碰</h4><ul>' +
        m.skip.map(function (x) { return "<li>" + x + "</li>"; }).join("") +
        "</ul></div></div>" +
        '<p class="mode-why"><strong>为什么：</strong>' + m.why + "</p>" +
        '<p class="mode-why"><strong>大概怎么用：</strong>' + m.how + "</p>" +
        '<p class="exp-note"><span class="tier tier--exp">站长经验</span>仅供参考，不代表所有同学体感，也不代表任课老师要求。</p>' +
        (m.sprint ? '<p style="margin-top:0.75rem"><a class="btn btn--primary" href="index.html">进入补考冲刺站 →</a></p>' : "");
      panels.appendChild(panel);
    });

    tabs.addEventListener("click", function (e) {
      var b = e.target.closest(".mode-tab");
      if (!b) return;
      activateMode(b.dataset.mode);
    });
    sidebarModes.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-mode]");
      if (!a) return;
      e.preventDefault();
      activateMode(a.dataset.mode);
      document.getElementById("time").scrollIntoView({ behavior: "smooth" });
    });

    function activateMode(key) {
      tabs.querySelectorAll(".mode-tab").forEach(function (t) {
        t.classList.toggle("is-active", t.dataset.mode === key);
      });
      panels.querySelectorAll(".mode-panel").forEach(function (p) {
        p.classList.toggle("is-active", p.dataset.mode === key);
      });
    }
  }

  function renderTopics() {
    var root = document.getElementById("topic-map");
    TOPICS.forEach(function (t) {
      var d = document.createElement("details");
      d.className = "disclosure";
      d.innerHTML =
        disclosureSummary(t.t + ' <span class="map-ref">' + t.r + "</span>") +
        '<div class="map-body">本站有：' + t.m + "。</div>";
      root.appendChild(d);
    });
  }

  function renderHistory() {
    document.getElementById("history-root").innerHTML =
      '<div class="warn-box"><strong>说明</strong>以下主要来自站长本人上一学年的复习与考试经历。仅代表往年个人经历，不代表本学年考试范围、题型或命题方式。未来也可能收录学长学姐分享。</div>' +
      '<div class="owner-say"><strong>站长说：</strong>真题可以先拿来摸底；黄本适合专题练；卡住再看站长整理；提纲适合查漏，但单独看容易以为「好像懂了」。</div>' +
      '<ul style="margin:0.85rem 0 0;padding-left:1.1rem;font-size:0.88rem">' +
      HISTORY.map(function (p) {
        return "<li>" + tierLabel(p.tier) + p.text + "</li>";
      }).join("") +
      "</ul>";
  }

  function renderAbout() {
    document.getElementById("about-root").innerHTML =
      "<dl>" +
      "<dt>官方资料</dt><dd>复习提纲、2026 期中卷及官方答案</dd>" +
      "<dt>资料事实</dt><dd>文件是否在线、黄本题目与答案、真题年份</dd>" +
      "<dt>站长整理</dt><dd>站长整理的辅学解析与使用建议，非阅卷标准</dd>" +
      "<dt>站长经验</dt><dd>站长本人复习感受，均标「站长经验」</dd>" +
      "<dt>版本</dt><dd>V2.3.5 预览 · Student Review Candidate</dd>" +
      "</dl>";
  }

  function initSidebarSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.sidebar-nav a[href^="#"]'));
    var headerOffset =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h"), 10) || 56;
    var scrollOffset = headerOffset + 32;

    function setActive(id) {
      links.forEach(function (a) {
        var href = a.getAttribute("href").slice(1);
        var match = href === id || (href === "time" && id === "time");
        a.classList.toggle("is-active", match);
      });
    }

    function getCurrentSection() {
      var y = window.scrollY + scrollOffset;
      var current = SECTION_ORDER[0];
      for (var i = 0; i < SECTION_ORDER.length; i++) {
        var el = document.getElementById(SECTION_ORDER[i]);
        if (el && el.offsetTop <= y) {
          current = SECTION_ORDER[i];
        }
      }
      return current;
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        setActive(getCurrentSection());
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    links.forEach(function (a) {
      a.addEventListener("click", function () {
        var id = a.getAttribute("href").slice(1);
        setTimeout(function () {
          setActive(id);
        }, 80);
        closeSidebar();
      });
    });
  }

  function closeSidebar() {
    var sidebar = document.getElementById("sidebar");
    var backdrop = document.getElementById("sidebar-backdrop");
    var toggle = document.querySelector(".sidebar-toggle");
    if (sidebar) sidebar.classList.remove("is-open");
    if (backdrop) {
      backdrop.classList.remove("is-visible");
      backdrop.hidden = true;
    }
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  function initMobileNav() {
    var toggle = document.querySelector(".sidebar-toggle");
    var sidebar = document.getElementById("sidebar");
    var backdrop = document.getElementById("sidebar-backdrop");
    if (!toggle || !sidebar) return;

    toggle.addEventListener("click", function () {
      var open = !sidebar.classList.contains("is-open");
      sidebar.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (backdrop) {
        backdrop.classList.toggle("is-visible", open);
        backdrop.hidden = !open;
      }
    });

    if (backdrop) {
      backdrop.addEventListener("click", closeSidebar);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderHave();
    renderTools();
    renderSlots();
    renderModes();
    renderTopics();
    renderHistory();
    renderAbout();
    initSidebarSpy();
    initMobileNav();
  });
})();
