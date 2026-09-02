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
          `<a href="${surveyUrl}" target="_blank" rel="noopener">填个反馈 →</a>`,
        );
      }

      if (email) {
        const subject = encodeURIComponent("[物理补考站反馈]");
        const body = encodeURIComponent(
          "当前页面：" + window.location.href + "\n\n",
        );
        parts.push(
          `也可以直接发邮件：<a href="mailto:${email}?subject=${subject}&body=${body}">${email}</a>`,
        );
      }

      if (parts.length) {
        container.innerHTML =
          "有问题、发现错误，或者有什么特别想要的功能，都可以直接告诉我。" +
          parts.join(" ");
      } else {
        container.textContent = "反馈渠道正在配置中，请稍后再试。";
      }
    })
    .catch(() => {
      container.textContent = "反馈入口加载失败，请返回平台首页反馈。";
    });
})();
