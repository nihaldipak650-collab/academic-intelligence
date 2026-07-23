import {
  Children,
  Fragment,
  isValidElement,
  useMemo,
  type ReactNode,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { EvidenceTag } from "./EvidenceTag";

export interface ReportHeading {
  depth: number;
  id: string;
  text: string;
}

const evidencePattern =
  /(No Evidence|Low[–-]Medium|High[–-]Medium|Medium[–-]High|High|Medium|Low)/g;
const doiPattern = /\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi;

function plainText(value: ReactNode): string {
  return Children.toArray(value)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }
      if (isValidElement<{ children?: ReactNode }>(child)) {
        return plainText(child.props.children);
      }
      return "";
    })
    .join("");
}

export function slugifyHeading(value: string) {
  const slug = value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[*_`~[\]():：，。！？、/\\'"“”‘’]/g, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return slug || "section";
}

function uniqueSlug(base: string, used: Map<string, number>) {
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
}

export function extractHeadings(markdown: string): ReportHeading[] {
  const used = new Map<string, number>();
  return markdown
    .split(/\r?\n/)
    .map((line) => /^(#{2,4})\s+(.+?)\s*$/.exec(line))
    .filter((match): match is RegExpExecArray => Boolean(match))
    .map((match) => {
      const text = match[2].replace(/[*_`[\]]/g, "").trim();
      return {
        depth: match[1].length,
        id: uniqueSlug(slugifyHeading(text), used),
        text,
      };
    });
}

function trimDoi(value: string) {
  let doi = value.replace(/[.,;:]+$/g, "");
  while (
    doi.endsWith(")") &&
    (doi.match(/\(/g)?.length ?? 0) < (doi.match(/\)/g)?.length ?? 0)
  ) {
    doi = doi.slice(0, -1);
  }
  return doi;
}

export function doiHref(value: string) {
  return `https://doi.org/${trimDoi(value)}`;
}

function decorateString(value: string, keyPrefix: string): ReactNode[] {
  const matches: Array<{ index: number; value: string; kind: "doi" | "tag" }> =
    [];
  for (const match of value.matchAll(doiPattern)) {
    const before = value.slice(Math.max(0, (match.index ?? 0) - 16), match.index);
    if (!/doi\.org\/$/i.test(before)) {
      matches.push({ index: match.index ?? 0, value: match[0], kind: "doi" });
    }
  }
  for (const match of value.matchAll(evidencePattern)) {
    matches.push({ index: match.index ?? 0, value: match[0], kind: "tag" });
  }
  matches.sort((a, b) => a.index - b.index || b.value.length - a.value.length);

  const result: ReactNode[] = [];
  let cursor = 0;
  matches.forEach((match, index) => {
    if (match.index < cursor) {
      return;
    }
    if (match.index > cursor) {
      result.push(value.slice(cursor, match.index));
    }
    if (match.kind === "doi") {
      const doi = trimDoi(match.value);
      result.push(
        <a
          className="doi-link"
          href={doiHref(doi)}
          target="_blank"
          rel="noopener noreferrer"
          key={`${keyPrefix}-doi-${index}`}
        >
          {doi}
        </a>,
      );
      cursor = match.index + doi.length;
    } else {
      result.push(
        <EvidenceTag
          level={match.value.replace("-", "–")}
          key={`${keyPrefix}-tag-${index}`}
        />,
      );
      cursor = match.index + match.value.length;
    }
  });
  if (cursor < value.length) {
    result.push(value.slice(cursor));
  }
  return result.length ? result : [value];
}

function decorateChildren(children: ReactNode) {
  return Children.map(children, (child, index) =>
    typeof child === "string"
      ? decorateString(child, `text-${index}`)
      : child,
  );
}

export function MarkdownReport({ markdown }: { markdown: string }) {
  const headings = useMemo(() => extractHeadings(markdown), [markdown]);
  const components = useMemo<Components>(() => {
    let headingCursor = 0;
    const heading =
      (Tag: "h1" | "h2" | "h3" | "h4") =>
      ({ children }: { children?: ReactNode }) => {
        const depth = Number(Tag.slice(1));
        const text = plainText(children);
        let id: string | undefined;
        if (depth >= 2) {
          const item = headings[headingCursor];
          id = item?.id;
          headingCursor += 1;
        }
        return (
          <Tag id={id} tabIndex={id ? -1 : undefined}>
            {decorateChildren(children)}
          </Tag>
        );
      };
    return {
      h1: heading("h1"),
      h2: heading("h2"),
      h3: heading("h3"),
      h4: heading("h4"),
      p: ({ children }) => <p>{decorateChildren(children)}</p>,
      li: ({ children }) => <li>{decorateChildren(children)}</li>,
      strong: ({ children }) => (
        <strong>{decorateChildren(children)}</strong>
      ),
      blockquote: ({ children }) => (
        <blockquote>{decorateChildren(children)}</blockquote>
      ),
      table: ({ children }) => (
        <div className="table-scroll" role="region" aria-label="证据表格">
          <table>{children}</table>
        </div>
      ),
      th: ({ children }) => <th>{decorateChildren(children)}</th>,
      td: ({ children }) => <td>{decorateChildren(children)}</td>,
      a: ({ href = "", children }) => (
        <a
          href={href}
          target={/^https?:/i.test(href) ? "_blank" : undefined}
          rel={/^https?:/i.test(href) ? "noopener noreferrer" : undefined}
        >
          {children}
        </a>
      ),
      code: ({ children, className }) => (
        <code className={className}>{children}</code>
      ),
    };
  }, [headings]);

  return (
    <Fragment>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </Fragment>
  );
}
