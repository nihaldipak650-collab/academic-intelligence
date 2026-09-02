(function () {
  "use strict";

  var OUTLINE_PDF =
    "资料/01_知识点大纲提纲/(供参考）大学物理C复习提纲.pdf";

  var MATERIALS = {
    outline: {
      path: OUTLINE_PDF,
      label: "复习提纲 PDF",
      online: true,
    },
    midtermPaper: {
      path: "资料/03_历年真题/2026年上学期大学物理C（医用物理学）期中试卷.pdf",
      label: "2026 期中试卷",
      online: true,
    },
    midtermAnswer: {
      path: "资料/03_历年真题/2026年上学期大学物理C期中考试答案.pdf",
      label: "2026 期中答案",
      online: true,
    },
    midtermGuide: {
      path: "资料/04_摘要与笔记/期中试卷_保姆级逐题解析.md",
      label: "期中保姆级",
      online: true,
    },
    emGuide: {
      path: "资料/04_摘要与笔记/电磁学大题_保姆级逐题解析.md",
      label: "电磁大题保姆级",
      online: true,
    },
    opticsGuide: {
      path: "资料/04_摘要与笔记/光学大题_保姆级逐题解析.md",
      label: "光学大题保姆级",
      online: true,
    },
    opticsMcq: {
      path: "资料/04_摘要与笔记/光学选择填空_保姆级.md",
      label: "光学选择填空保姆级",
      online: true,
    },
    exam2022: {
      path: "资料/03_历年真题/2022年下学期医用物理学试卷.doc",
      label: "2022 下试卷",
      online: true,
    },
    exam2023: {
      path: "资料/03_历年真题/2023年下学期医用物理学试卷.doc",
      label: "2023 下试卷",
      online: true,
    },
    exam2024: {
      path: "资料/03_历年真题/2024年下学期医用物理学试卷.doc",
      label: "2024 下试卷",
      online: true,
    },
    huangbenAnswers: {
      path: "资料/02_练习题/练习册答案/医用物理学练习册答案/练习1 力学基本定律（一）.pdf",
      label: "黄本答案（练习 1 示例）",
      online: true,
    },
  };

  var STUDY_MODES = {
    semester: {
      id: "semester",
      label: "正常跟学 · 一学期",
      summary: "按课堂进度走完整门课；以提纲串知识、黄本/真题巩固。",
      order: [
        "跟课堂章节，每周对照复习提纲对应页勾考点",
        "每章：先读提纲 → 有黄本题目则练习并对答案 → 无题目则用期中/期末同类题",
        "期中前重点 Ch1–7；期中后补 Ch9–13",
        "每月用一套真题限时自测，错题回流提纲",
      ],
      priority: "复习提纲（知识地图）> 课堂笔记（本站暂无 PPT）> 黄本答案（需自备题目）> 真题",
      time: "建议每周 3–5 小时；具体课时随学校排课（本站无精确课表，保守估计）",
      done: "能说出每章 3 个关键词；章末能独立完成 1–2 道典型计算",
      defer: "不必一次刷完所有历年卷；量子/光学可放在学期后半",
      evidence: "infer",
    },
    month: {
      id: "month",
      label: "系统强化 · 约 1 个月",
      summary: "已上过课但零散；用一个月把全册考点串起来并刷题。",
      order: [
        "第 1 周：Ch1–4（力学→振动波动）提纲 + 期中卷力学/波动题",
        "第 2 周：Ch5–7（统计/热/静电）提纲 + 期中卷热学/静电题",
        "第 3 周：Ch9–10（磁场/电磁感应）电磁保姆级 + 2023 下卷电磁题",
        "第 4 周：Ch11–13 光学/量子保姆级 + 2024 下卷 + 提纲通读",
      ],
      priority: "提纲通读 > 保姆级（电磁/光学）> 2022–2024 下真题 > 黄本答案",
      time: "约 25–35 小时总量；每天 1–1.5 小时较现实（推断，待你确认）",
      done: "每知识块能完成 1 套同类题；错题有对应提纲页码",
      defer: "黄本题目正文未上线；PPT 未上线；2016–2021 真题未上线",
      evidence: "infer",
    },
    week: {
      id: "week",
      label: "考前复习 · 约 1 周",
      summary: "期末临近；专题过一遍 + 刷 2–3 套卷。",
      order: [
        "前 2 天：按专题 A–F 过保姆级（力学/热学见期中；电磁/光学见 MD）",
        "中间 3 天：2023 下 → 2024 下 限时各一套",
        "最后 2 天：复习提纲全文速览 + 再做 2026 期中或 2022 下",
      ],
      priority: "保姆级 MD > 历年真题 doc > 复习提纲 > 黄本答案",
      time: "每天 2–3 小时，共约 14–20 小时（参考现有补考站 1 周路径）",
      done: "近 3 年卷各完成 1 套；错题能回到提纲章节",
      defer: "暂不追求黄本全覆盖；37 页扫描卷未上线",
      evidence: "outline",
    },
    sprint: {
      id: "sprint",
      label: "临考冲刺 · 约 3 天",
      summary: "时间极紧；请使用已上线的补考速成站（专门编排）。",
      order: [
        "请直接进入「补考/冲刺站」— 已含 3 天路径、勾选清单、专题索引",
        "本站 V1 不提供第二套 3 天计划，避免与冲刺站重复",
      ],
      priority: "补考速成站 index.html 内的路径为准",
      time: "见冲刺站「只剩 3 天」区块",
      done: "完成冲刺站三步 checklist + 至少 1 套卷",
      defer: "全册系统学习暂缓",
      evidence: "outline",
      external: "index.html",
    },
  };

  var TOPICS = [
    {
      id: "mechanics",
      title: "力学基本定律",
      chapters: "第一章 · 提纲 p1–2",
      learn: "质点运动学、变力功、动能定理、刚体定轴转动与摩擦矩（提纲明确）",
      materials: ["outline", "midtermPaper", "midtermGuide", "huangbenAnswers"],
      when: "跟学/强化：每周跟课；考前：期中卷计算 1 及同类真题",
      ready: "能独立写出转动+摩擦矩题的主要步骤（参考期中保姆级）",
      support: "strong",
      evidence: "outline",
      pages: "1–2",
    },
    {
      id: "elasticity",
      title: "物体的弹性",
      chapters: "第二章 · 提纲 p3",
      learn: "线应变、杨氏模量、剪应变与体应变概念（提纲明确）",
      materials: ["outline", "huangbenAnswers"],
      when: "跟学：学完本章读提纲；练习：黄本练习 6（仅有答案，需自备题目）",
      ready: "能解释三种应变及模量含义",
      support: "partial",
      gap: "无专题保姆级；黄本题目正文未上线",
      evidence: "outline",
      pages: "3",
    },
    {
      id: "fluids",
      title: "流体的运动",
      chapters: "第三章 · 提纲 p4",
      learn: "连续性方程、伯努利方程计算（提纲明确）",
      materials: ["outline", "midtermGuide", "midtermPaper", "huangbenAnswers"],
      when: "例题：期中保姆级计算 2；练习：黄本练习 7–8 答案",
      ready: "能列出伯努利+连续性并代入求解",
      support: "medium",
      evidence: "outline",
      pages: "4",
    },
    {
      id: "vibration",
      title: "振动、波动与声",
      chapters: "第四章 · 提纲 p5–6",
      learn: "简谐振动、波的叠加、干涉、多普勒等（提纲明确）",
      materials: ["outline", "midtermGuide", "midtermPaper", "huangbenAnswers"],
      when: "期中卷选择 5–8、计算 3；黄本练习 9–12 答案",
      ready: "相位/合成/波函数类题能自判对错",
      support: "medium",
      evidence: "outline",
      pages: "5–6",
    },
    {
      id: "stat",
      title: "统计物理学",
      chapters: "第五章 · 提纲 p7–8",
      learn: "理想气体、麦克斯韦分布、碰撞频率与自由程（提纲明确）",
      materials: ["outline", "midtermGuide", "midtermPaper", "huangbenAnswers"],
      when: "期中选择 9–10；黄本练习 13–15 答案",
      ready: "能选用气体公式并说明物理量含义",
      support: "medium",
      evidence: "outline",
      pages: "7–8",
    },
    {
      id: "thermo",
      title: "热力学基础",
      chapters: "第六章 · 提纲 p9–10",
      learn: "第一定律、循环、卡诺效率、熵（提纲明确）",
      materials: ["outline", "midtermGuide", "midtermPaper", "exam2023", "huangbenAnswers"],
      when: "期中计算 4（布雷顿循环）；期末卷热学大题",
      ready: "卡诺效率公式会用；循环题能画图",
      support: "medium",
      evidence: "outline",
      pages: "9–10",
    },
    {
      id: "electrostatics",
      title: "静电场",
      chapters: "第七章 · 提纲 p11–14",
      learn: "库仑定律、高斯定理、电势、导体与电容（提纲明确）",
      materials: ["outline", "midtermGuide", "emGuide", "midtermPaper", "huangbenAnswers"],
      when: "期中静电选择/计算 5；电磁保姆级前 3 题；黄本 19–21 答案",
      ready: "高斯对称性能判断；电容题有思路",
      support: "strong",
      evidence: "outline",
      pages: "11–14",
    },
    {
      id: "magnetism",
      title: "稳恒磁场",
      chapters: "第九章 · 提纲 p15–16",
      learn: "毕奥-萨伐尔、安培环路、安培力、磁矩（提纲明确；第八章未出现在提纲）",
      materials: ["outline", "emGuide", "exam2023", "huangbenAnswers"],
      when: "电磁保姆级题 4–6 相关；期末卷磁场题",
      ready: "能算简单安培力积分",
      support: "medium",
      gap: "无单独磁场保姆级卷；依赖电磁大题 MD",
      evidence: "outline",
      pages: "15–16",
    },
    {
      id: "induction",
      title: "电磁感应与电磁波",
      chapters: "第十章 · 提纲 p17–18",
      learn: "法拉第定律、动生/感生电动势、互感、麦克斯韦方程（提纲明确）",
      materials: ["outline", "emGuide", "exam2024", "huangbenAnswers"],
      when: "电磁保姆级后半；黄本 25–26 答案",
      ready: "能区分动生与感生来源",
      support: "medium",
      evidence: "outline",
      pages: "17–18",
    },
    {
      id: "wave-optics",
      title: "波动光学",
      chapters: "第十一章 · 提纲 p19–23",
      learn: "干涉、衍射、光栅、偏振（提纲明确）",
      materials: ["outline", "opticsGuide", "opticsMcq", "huangbenAnswers"],
      when: "光学大题 MD + 选择填空 MD；黄本 27–28 答案",
      ready: "光栅/薄膜/杨氏双缝能套公式",
      support: "strong",
      evidence: "outline",
      pages: "19–23",
    },
    {
      id: "geo-optics",
      title: "几何光学",
      chapters: "第十二章 · 提纲 p24",
      learn: "球面成像、薄透镜、简化眼与屈光矫正（提纲明确）",
      materials: ["outline", "opticsGuide", "opticsMcq", "huangbenAnswers"],
      when: "光学大题 MD 几何部分；黄本 29–30 答案",
      ready: "薄透镜成像公式能列方程",
      support: "medium",
      evidence: "outline",
      pages: "24",
    },
    {
      id: "quantum",
      title: "量子力学与近代物理",
      chapters: "第十三章 · 提纲 p25–28",
      learn: "光电效应、氢原子、波函数、势阱、量子数（提纲明确）",
      materials: ["outline", "huangbenAnswers"],
      when: "提纲 p25–28；黄本练习 31–34 答案；真题中选择/填空",
      ready: "能写光电效应、势阱基本结论",
      support: "weak",
      gap: "无量子保姆级 MD 上线；物理1.txt 等历史资料未上线",
      evidence: "outline",
      pages: "25–28",
    },
  ];

  var MATERIAL_GUIDE = [
    {
      id: "outline",
      title: "复习提纲（官方考点清单）",
      good: "串知识、考前查漏、定位章节",
      bad: "零基础首学、需要详细例题步骤时",
      how: "按章读标题与公式框 → 合上回忆 → 对照 PDF 原页（勿只信 OCR 摘录）",
      session: "全册 90–120 min；单章 8–15 min（维护文档估计）",
      next: "错题回到对应章 → 找真题/保姆级同类题",
      evidence: "outline",
      links: ["outline"],
    },
    {
      id: "exams",
      title: "真题（期中 PDF + 2022–2024 下 doc）",
      good: "自测、熟悉题型、期末/补考刷题",
      bad: "还没读过提纲就硬刷",
      how: "限时做题 → 对官方答案 → 卡步骤看保姆级",
      session: "一套约 90 min + 复盘 30–60 min",
      next: "错题标号 → 回流提纲 + 保姆级",
      evidence: "outline",
      links: ["midtermPaper", "midtermAnswer", "exam2022", "exam2023", "exam2024"],
    },
    {
      id: "guides",
      title: "保姆级解析（4 份 MD）",
      good: "卡步骤、模仿计算过程",
      bad: "当作阅卷标准答案；完全没听课直接当教材",
      how: "先自做 → 再逐段对照 MD → 隔日重做",
      session: "2–3 题 / 25–40 min",
      next: "同类题回真题或黄本",
      evidence: "infer",
      links: ["midtermGuide", "emGuide", "opticsGuide", "opticsMcq"],
    },
    {
      id: "huangben",
      title: "黄本练习册答案（34 份 PDF）",
      good: "有纸质/扫描题目时核对步骤",
      bad: "没有题目正文时无法单独使用",
      how: "练习 N 题目 + 打开「练习 N」答案 PDF",
      session: "视题目数量",
      next: "仍不会 → 真题同类题",
      evidence: "outline",
      links: ["huangbenAnswers"],
      gap: "题目正文未上线；仅答案可用",
    },
  ];

  var OFFLINE = [
    { name: "官方课件 PPT", reason: "体积大，未放线上" },
    { name: "37 页老扫描期末卷", reason: "年份杂、扫描不清" },
    { name: "2016–2021 年真题 doc", reason: "第一批仅放 2022–2024 下" },
    { name: "黄本题目正文", reason: "尚未导全" },
    { name: "pdf_json.json / midterm_text.txt", reason: "历史维护文件，线上不存在" },
    { name: "物理1.txt、更多保姆级", reason: "维护文档提及，当前目录无此文件" },
  ];

  function readerUrl(relPath) {
    return "read.html?path=" + encodeURIComponent(relPath);
  }

  function evidenceLabel(key) {
    if (key === "outline") return { text: "提纲明确", cls: "evidence--outline" };
    if (key === "infer") return { text: "材料推断", cls: "evidence--infer" };
    return { text: "待确认", cls: "evidence--pending" };
  }

  function renderEvidence(key) {
    var e = evidenceLabel(key);
    return '<span class="evidence ' + e.cls + '">' + e.text + "</span>";
  }

  function materialChip(key) {
    var m = MATERIALS[key];
    if (!m || !m.online) {
      return '<span class="chip-link chip-link--missing">' + (m ? m.label : key) + "（未上线）</span>";
    }
    return (
      '<a class="chip-link" href="' +
      readerUrl(m.path) +
      '" target="_blank" rel="noopener">' +
      m.label +
      "</a>"
    );
  }

  function renderModes() {
    var tabs = document.getElementById("mode-tabs");
    var panels = document.getElementById("mode-panels");
    if (!tabs || !panels) return;

    Object.keys(STUDY_MODES).forEach(function (id, index) {
      var mode = STUDY_MODES[id];
      var tab = document.createElement("button");
      tab.type = "button";
      tab.className = "mode-tab" + (index === 0 ? " is-active" : "");
      tab.dataset.mode = id;
      tab.textContent = mode.label;
      tabs.appendChild(tab);

      var panel = document.createElement("div");
      panel.className = "mode-panel" + (index === 0 ? " is-active" : "");
      panel.dataset.mode = id;
      panel.innerHTML =
        "<p>" +
        renderEvidence(mode.evidence) +
        mode.summary +
        "</p>" +
        '<div class="mode-meta">' +
        '<div class="mode-block"><strong>推荐顺序</strong><ol>' +
        mode.order.map(function (s) {
          return "<li>" + s + "</li>";
        }).join("") +
        "</ol></div>" +
        '<div class="mode-block"><strong>资料优先级</strong><p>' +
        mode.priority +
        "</p></div>" +
        '<div class="mode-block"><strong>时间（估计）</strong><p>' +
        mode.time +
        "</p></div>" +
        '<div class="mode-block"><strong>完成标准</strong><p>' +
        mode.done +
        "</p></div>" +
        '<div class="mode-block"><strong>可暂缓</strong><p>' +
        mode.defer +
        "</p></div>" +
        "</div>" +
        (mode.external
          ? '<div class="sprint-cta"><strong>临考请用专用冲刺站</strong><p>已有完整 3 天路径、勾选清单与专题索引，无需在本页重复。</p><a class="btn" href="' +
            mode.external +
            '">进入补考 / 冲刺站 →</a></div>'
          : "");

      panels.appendChild(panel);
    });

    tabs.addEventListener("click", function (e) {
      var btn = e.target.closest(".mode-tab");
      if (!btn) return;
      var mode = btn.dataset.mode;
      tabs.querySelectorAll(".mode-tab").forEach(function (t) {
        t.classList.toggle("is-active", t === btn);
      });
      panels.querySelectorAll(".mode-panel").forEach(function (p) {
        p.classList.toggle("is-active", p.dataset.mode === mode);
      });
    });
  }

  function supportLabel(level) {
    if (level === "strong") return "本站支持较好";
    if (level === "medium") return "部分支持（提纲+部分题）";
    if (level === "partial") return "仅提纲/答案，缺专题练习";
    return "支持较弱，请主要靠提纲+真题";
  }

  function renderTopics() {
    var grid = document.getElementById("topic-grid");
    if (!grid) return;

    TOPICS.forEach(function (topic) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "map-card";
      card.innerHTML =
        '<div class="map-card-head"><h3>' +
        topic.title +
        '</h3><span class="map-chapters">' +
        topic.chapters +
        "</span></div>" +
        '<div class="map-detail">' +
        "<p>" +
        renderEvidence(topic.evidence) +
        "<strong>学什么：</strong>" +
        topic.learn +
        "</p>" +
        "<p><strong>可用资料：</strong></p><div class=\"material-links\">" +
        topic.materials.map(materialChip).join("") +
        "</div>" +
        "<p><strong>什么时候用：</strong>" +
        topic.when +
        "</p>" +
        "<p><strong>进入下一块前：</strong>" +
        topic.ready +
        "</p>" +
        "<p><strong>本站支持：</strong>" +
        supportLabel(topic.support) +
        " · 提纲 p" +
        topic.pages +
        "</p>" +
        (topic.gap ? '<div class="gap-note">缺口：' + topic.gap + "</div>" : "") +
        "</div>";
      card.addEventListener("click", function () {
        var open = card.classList.toggle("is-open");
        card.setAttribute("aria-expanded", open ? "true" : "false");
      });
      grid.appendChild(card);
    });
  }

  function renderMaterialGuide() {
    var root = document.getElementById("material-guide");
    if (!root) return;

    MATERIAL_GUIDE.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "material-card";
      card.innerHTML =
        "<h3>" +
        renderEvidence(item.evidence) +
        item.title +
        "</h3>" +
        "<dl>" +
        "<dt>适合</dt><dd>" +
        item.good +
        "</dd>" +
        "<dt>不适合</dt><dd>" +
        item.bad +
        "</dd>" +
        "<dt>怎么用</dt><dd>" +
        item.how +
        "</dd>" +
        "<dt>单次大约</dt><dd>" +
        item.session +
        "</dd>" +
        "<dt>学完以后</dt><dd>" +
        item.next +
        "</dd>" +
        (item.gap ? "<dt>注意</dt><dd>" + item.gap + "</dd>" : "") +
        "</dl>" +
        '<div class="material-links">' +
        item.links.map(materialChip).join("") +
        "</div>";
      root.appendChild(card);
    });
  }

  function renderOffline() {
    var list = document.getElementById("offline-list");
    if (!list) return;
    OFFLINE.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent = item.name + " — " + item.reason;
      list.appendChild(li);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderModes();
    renderTopics();
    renderMaterialGuide();
    renderOffline();
  });
})();
