import { type ReactNode } from "react";

function ServiceIcon({ children }: { children: ReactNode }) {
  return <span className="service-icon">{children}</span>;
}

interface SubjectRosterItem {
  name: string;
  statusLabel: string;
  href?: string;
  featured?: boolean;
  hint?: string;
}

interface EverydayEntry {
  num: string;
  title: string;
  subtitle: string;
  tag?: string;
  support?: string;
  subjects?: SubjectRosterItem[];
  icon: ReactNode;
}

const ICON = {
  ppt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="4" y="3" width="16" height="14" rx="2" />
      <path d="M8 21h8M12 17v4M8 8h8M8 12h5" />
    </svg>
  ),
  baoxiao: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M7 3h10l2 3v15l-3-2-2 2-2-2-2 2-2-2-3 2V6l2-3Z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),
  excel: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M9 4v16M15 9v11" />
    </svg>
  ),
  qingjia: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M14 3v4h4M9 12h6M9 16h4" />
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      <path d="M9 12h6M9 15h4" />
    </svg>
  ),
  disk: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="8" />
      <path d="M7 13h10M8.5 17h.01M15.5 17h.01" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  ),
  repeat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  folderEye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      <path d="M12 10c-2.4 0-3.9 1.9-3.9 1.9s1.5 2.1 3.9 2.1 3.9-2.1 3.9-2.1S14.4 10 12 10Z" />
      <path d="M12 11.9h.01" />
    </svg>
  ),
  video: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M10 9l5 3-5 3V9Z" />
    </svg>
  ),
  study: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M9 18h6M10 21h4M12 3a5 5 0 0 1 3 9c-.7.5-1 1.2-1 2h-4c0-.8-.3-1.5-1-2a5 5 0 0 1 3-9Z" />
    </svg>
  ),
  compass: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-1.8 4.2-4.2 1.8 1.8-4.2 4.2-1.8Z" />
    </svg>
  ),
  books: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 5h7v15H4zM13 4h7v15h-7z" />
      <path d="M7.5 5V3M16.5 4V2" />
    </svg>
  ),
  pen: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" />
    </svg>
  ),
};

const make = (
  num: string,
  title: string,
  subtitle: string,
  icon: ReactNode,
  extra?: { tag?: string; support?: string; subjects?: SubjectRosterItem[] },
) => ({ num, title, subtitle, icon, tag: extra?.tag, support: extra?.support, subjects: extra?.subjects }) as EverydayEntry;

const PPT_MODES = [
  { name: "可编辑 PPT", desc: "可以继续改文字、结构、图片和版式，支持二次编辑。" },
  { name: "网页式演示", desc: "更自由的版式和视觉表达。" },
  { name: "学术 PPT", desc: "论文、研究、答辩：帮助组织逻辑、证据和图表。" },
];

const sectionOneRegular: EverydayEntry[] = [
  make("02", "学生报销，到底怎么报？", "弄清完整流程、判断你现在卡在哪一步、检查材料，再告诉你下一步。", ICON.baoxiao),
  make("03", "Excel 不会做图？把数据交给 AI", "从清洗、公式和统计开始，让 AI 帮你理解数据，再选择真正适合的图表和可视化方式。", ICON.excel),
  make("04", "如果我要请假，到底应该怎么请？", "弄清请假入口、需要哪些材料、找谁审批，以及自己现在做到哪一步。", ICON.qingjia),
];

const sectionTwo: EverydayEntry[] = [
  make("05", "微信、QQ、电脑里的文件怎么整理？", "文件散得到处都是，先让 AI 帮你建立一套以后真的找得到、也能继续维持的整理方法。", ICON.folder),
  make("06", "C 盘爆红了，哪些东西到底能删？", "先让 AI 帮你理解这些目录和文件是什么，再分成可以清、需要确认、最好别碰。", ICON.disk),
  make("07", "手机到底怎么清，才不会误删？", "先看看空间到底被什么占掉，再从大视频、重复照片、聊天软件缓存和下载文件开始处理。", ICON.phone),
  make("08", "那些每天重复做的操作，能不能交给 AI？", "批量改名、整理文件、复制信息、格式转换、重复填表……很多事情不难，只是特别烦。", ICON.repeat),
  make("09", "让 AI 看懂你的整个文件夹", "不只是移动文件，而是先理解几百个文件分别是什么，再分类、命名和重新组织。", ICON.folderEye),
  make("10", "一个长视频，怎么让 AI 帮我真正学进去？", "信息少时帮你找到真正值得看的部分；信息密时帮你建结构、做笔记，把长内容变成自己的知识。", ICON.video),
];

const learningFeatures: EverydayEntry[] = [
  make("11", "如何用 AI 真正辅助学习？", "AI 不只是回答问题。它可以参与整个学习过程：帮你理解、制造练习、暴露盲点、纠正错误，再把知识真正变成自己的东西。", ICON.study, { tag: "重点专题", support: "理解 · 练习 · 复盘 · 内化" }),
  make("12", "一个普通人，到底该怎么开始用 AI？", "先知道什么事情值得交给 AI，怎么表达需求、怎么检查结果，再慢慢进入 Prompt、Workflow、Agent 和编程。", ICON.compass, { tag: "重点专题" }),
];

const sectionThreeExamples: EverydayEntry[] = [
  make(
    "13",
    "把一学期的辅学资料变成 AI 学习系统",
    "PPT、PDF、讲义和课本，不只是存下来，而是变成能问、能解释、能练习、能复习的学习系统。",
    ICON.books,
    {
      tag: "例子",
      subjects: [
        { name: "物理", statusLabel: "已收录", href: "review/physics-c/course.html", featured: true, hint: "完整资料站 · Beta" },
        { name: "有机化学", statusLabel: "还在收录" },
        { name: "计算机", statusLabel: "也在收录" },
      ],
    },
  ),
  make("14", "用 AI 把一个脑洞写成第一篇一万字小说", "从一句想法开始，让 AI 帮你扩展人物、世界观、冲突和章节，再由人不断选择、修改和继续创作。", ICON.pen, { tag: "例子" }),
];

export function PlatformServices() {
  function renderEntry(entry: EverydayEntry) {
    const body = (
      <>
        <ServiceIcon>{entry.icon}</ServiceIcon>
        <span className="service-copy">
          <strong>
            {entry.title}
            {entry.tag ? <span className="service-tag">{entry.tag}</span> : null}
          </strong>
          <small>{entry.subtitle}</small>
          {entry.subjects ? (
            <ul className="subject-roster" aria-label="学科收录进度">
              {entry.subjects.map((subject) =>
                subject.href ? (
                  <li key={subject.name}>
                    <a
                      className={`subject-roster-item subject-roster-item--link${subject.featured ? " subject-roster-item--featured" : ""}`}
                      href={subject.href}
                    >
                      <span className="subject-copy">
                        <span className="subject-name">{subject.name}</span>
                        {subject.hint ? <span className="subject-hint">{subject.hint}</span> : null}
                      </span>
                      <span className="subject-status">
                        {subject.statusLabel} <span aria-hidden="true">→</span>
                      </span>
                    </a>
                  </li>
                ) : (
                  <li className="subject-roster-item is-pending" key={subject.name}>
                    <span className="subject-name">{subject.name}</span>
                    <span className="subject-status">{subject.statusLabel}</span>
                  </li>
                ),
              )}
            </ul>
          ) : null}
        </span>
      </>
    );
    return (
      <div className="service-item display-only" key={entry.num}>
        {body}
      </div>
    );
  }

  return (
    <section
      className="services-section"
      id="services"
      aria-labelledby="services-title"
    >
      <div className="section-heading">
        <div>
          <div className="section-kicker">Everyday AI</div>
          <h2 id="services-title">AI 可以帮你干什么？</h2>
        </div>
        <p className="section-intro">
          这些都是我想拿 AI 实际解决的问题。先看看哪一个对你最有用。
        </p>
      </div>

      <div className="everyday-group">
        <div className="everyday-group-head">
          <h3>AI 帮我把事情做出来</h3>
        </div>

        <div className="service-list ppt-block">
          <div className="service-item ppt-expanded display-only">
            <span className="ppt-left">
              <ServiceIcon>{ICON.ppt}</ServiceIcon>
              <span className="service-copy">
                <strong>让 AI 帮你做一份真正能用的 PPT</strong>
                <small>
                  从 Word、PDF 或零散材料开始，让 AI 帮你理解内容、整理结构、生成页面，再继续完成重复修改、格式调整和细节微调。
                </small>
              </span>
              <span className="ppt-flow" aria-hidden="true">
                材料 · 理解 · 结构 · 页面 · 修改 · 交付
              </span>
            </span>
            <span className="ppt-modes">
              {PPT_MODES.map((mode) => (
                <span className="ppt-mode" key={mode.name}>
                  <b>{mode.name}</b>
                  <em>{mode.desc}</em>
                </span>
              ))}
            </span>
          </div>
        </div>
        <div className="service-list cols-3">{sectionOneRegular.map(renderEntry)}</div>
      </div>

      <div className="everyday-group">
        <div className="everyday-group-head">
          <h3>AI 帮我收拾数字生活</h3>
        </div>
        <div className="service-list">{sectionTwo.map(renderEntry)}</div>
      </div>

      <div className="everyday-group">
        <div className="everyday-group-head">
          <h3>AI 帮我学习和创造</h3>
        </div>
        <div className="learning-features">
          {learningFeatures.map((entry) => (
            <div className="feature-card" key={entry.num}>
              <span className="feature-top">
                <span className="num">{entry.num}</span>
                <span className="feature-tag">{entry.tag}</span>
              </span>
              <h4>{entry.title}</h4>
              <p>{entry.subtitle}</p>
              {entry.support ? <small className="support">{entry.support}</small> : null}
            </div>
          ))}
        </div>
        <div className="subgroup-label">上面两个大命题，落到两个具体例子</div>
        <div className="service-list">{sectionThreeExamples.map(renderEntry)}</div>
      </div>
    </section>
  );
}
