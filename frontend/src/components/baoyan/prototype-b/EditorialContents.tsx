export interface EditorialContentEntry {
  number: string;
  title: string;
  sectionId: string;
}

interface EditorialContentsProps {
  entries: EditorialContentEntry[];
}

export function EditorialContents({ entries }: EditorialContentsProps) {
  return (
    <nav className="ed-contents" aria-label="文章目录">
      <p className="ed-contents-label">Contents</p>
      <ol className="ed-contents-list">
        {entries.map((entry) => (
          <li key={entry.sectionId}>
            <a href={`#${entry.sectionId}`} className="ed-contents-link">
              <span className="ed-contents-num">{entry.number}</span>
              <span className="ed-contents-title">{entry.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
