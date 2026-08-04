import type { MouseEvent, ReactNode } from "react";
import { usePlatformToast } from "./PlatformToast";

function ServiceIcon({ children }: { children: ReactNode }) {
  return <span className="service-icon">{children}</span>;
}

const services = [
  {
    title: "PPT与汇报",
    subtitle: "从零开始做PPT，掌握AI辅助制作与多人协作的三种方法",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="4" y="3" width="16" height="14" rx="2" />
        <path d="M8 21h8M12 17v4M8 8h8M8 12h5" />
      </svg>
    ),
  },
  {
    title: "报销指南",
    subtitle: "了解学生会和学院报销的完整流程",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M7 3h10l2 3v15l-3-2-2 2-2-2-2 2-2-2-3 2V6l2-3Z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    ),
  },
  {
    title: "Excel与表格",
    subtitle: "从零学习Excel，掌握AI辅助整理、分析与校对表格",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M9 4v16M15 9v11" />
      </svg>
    ),
  },
  {
    title: "实验课准备",
    subtitle: "预习实验流程、准备所需材料并了解注意事项",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" />
        <path d="M7 16h10" />
      </svg>
    ),
  },
  {
    title: "AI辅学资料库",
    subtitle: "汇集学院辅学活动、课程资料与AI学习工具",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 5a3 3 0 0 1 3-2h13v16H7a3 3 0 0 0-3 2V5Z" />
        <path d="M4 19a3 3 0 0 1 3-2h13" />
      </svg>
    ),
  },
  {
    title: "请假与证明",
    subtitle: "了解请假流程、所需材料与证明办理方式",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M14 3v4h4M9 12h6M9 16h4" />
      </svg>
    ),
  },
] as const;

export function PlatformServices() {
  const { showToast } = usePlatformToast();

  function handleSoon(event: MouseEvent) {
    event.preventDefault();
    showToast("即将开放");
  }

  return (
    <section
      className="services-section"
      id="services"
      aria-labelledby="services-title"
    >
      <div className="section-heading">
        <div>
          <div className="section-kicker">Everyday services</div>
          <h2 id="services-title">常用服务入口</h2>
        </div>
        <a className="text-link" href="#" onClick={handleSoon}>
          查看全部服务 →
        </a>
      </div>
      <div className="service-list">
        {services.map((service) => (
          <a
            className="service-item"
            href="#"
            key={service.title}
            onClick={handleSoon}
          >
            <ServiceIcon>{service.icon}</ServiceIcon>
            <span className="service-copy">
              <strong>{service.title}</strong>
              <small>{service.subtitle}</small>
            </span>
            <span className="arrow">→</span>
          </a>
        ))}
      </div>
    </section>
  );
}
