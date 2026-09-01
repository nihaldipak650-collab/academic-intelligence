(function () {
  const container = document.getElementById("physics-feedback");
  if (!container) return;

  fetch("../../data/site-config.json")
    .then((response) => response.json())
    .then((cfg) => {
      const surveyUrl = (cfg.physicsFeedbackUrl || cfg.feedbackUrl || "").trim();
      const email = (cfg.feedbackEmail || "").trim();
      const parts = [];

      if (surveyUrl) {
        parts.push(
          `<a href="${surveyUrl}" target="_blank" rel="noopener">填写反馈问卷</a>`,
        );
      }
      if (email) {
        const subject = encodeURIComponent("[物理补考站反馈]");
        const body = encodeURIComponent(
          "当前页面：" + window.location.href + "\n\n请描述问题：\n",
        );
        parts.push(
          `<a href="mailto:${email}?subject=${subject}&body=${body}">发邮件到 ${email}</a>`,
        );
      }

      if (parts.length) {
        container.innerHTML =
          "发现资料有错、链接打不开或有建议？" + parts.join(" · ");
      } else {
        container.textContent = "反馈渠道正在配置中，请稍后再试。";
      }
    })
    .catch(() => {
      container.textContent = "反馈入口加载失败，请返回平台首页反馈。";
    });
})();
