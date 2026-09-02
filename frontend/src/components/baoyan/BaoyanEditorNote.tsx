interface BaoyanEditorNoteProps {
  children: string;
}

export function BaoyanEditorNote({ children }: BaoyanEditorNoteProps) {
  return (
    <aside className="baoyan-editor-note" aria-label="站长有话说">
      <p className="baoyan-editor-note-label">
        <span aria-hidden="true">“</span>
        站长有话说
      </p>
      <p className="baoyan-editor-note-text">{children}</p>
    </aside>
  );
}
