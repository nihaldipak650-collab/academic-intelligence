# Academic Intelligence

Academic Intelligence 是一个面向学术资料处理的 Python 项目。Retriever v0.1 可根据导师英文姓名和学校英文名称查询 OpenAlex，综合姓名、最近任职机构、历史 affiliations 和少量发文量信息选择候选作者，并下载该作者近 5 个日历年的全部论文。

## 导师信息网站 0.1

仓库包含一个直接展示现有 Markdown 导师画像的静态测试网站。在本目录运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\start_web.ps1
```

然后访问 <http://localhost:8000/>。启动时会从 `data/reports/` 同步配置中选定的报告，但不会修改原始报告。网站配置、更新方式和静态部署说明见 [`web/README.md`](web/README.md)。

生产环境采用 GitHub Pages，并由 `.github/workflows/deploy-pages.yml` 在 `main` 分支推送后自动发布。详细的首次启用、内容更新和回滚步骤见网站说明。

## 安装

建议使用 Python 3.10 或更高版本：

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

## 配置 OpenAlex API Key

项目根目录包含一个不会被 Git 提交的 `.env` 文件。打开该文件，将占位符替换为自己的 OpenAlex API Key：

```dotenv
OPENALEX_API_KEY=your_openalex_api_key_here
```

Retriever 启动时会自动加载该配置，并在所有 OpenAlex 请求中添加 `api_key` 参数。如果变量不存在或为空，程序仍会使用原来的匿名访问模式。

请勿把真实 Key 写入 README、源代码或提交到版本控制。

## 使用

在项目根目录运行：

```powershell
python main.py --name "Rong Xiang" --institution "Central South University"
```

可通过 `--years` 调整时间范围。成功运行后会生成：

- `data/raw/author.json`：最终匹配的 OpenAlex 作者记录
- `data/raw/works.json`：该作者时间范围内的论文记录

程序使用 OpenAlex cursor 分页获取全部结果，而非只获取第一页。访问 OpenAlex API 需要可用的互联网连接。
