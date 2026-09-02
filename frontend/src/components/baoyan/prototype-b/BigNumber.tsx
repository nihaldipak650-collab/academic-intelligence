import type { ReactNode } from "react";
import type { SourceRegistry } from "./sourceRegistry";
import { FootnoteRef } from "./SourceFootnotes";

interface BigNumberProps {
  value: string;
  label: string;
  sublabel?: string;
  body: ReactNode;
  sourceIds?: string[];
  registry: SourceRegistry;
}

export function BigNumber({
  value,
  label,
  sublabel,
  body,
  sourceIds = [],
  registry,
}: BigNumberProps) {
  return (
    <figure className="ed-big-number">
      <div className="ed-big-number-value serif">{value}</div>
      <figcaption>
        <p className="ed-big-number-label">{label}</p>
        {sublabel && <p className="ed-big-number-sublabel">{sublabel}</p>}
        <div className="ed-big-number-body">{body}</div>
        {sourceIds.length > 0 && (
          <p className="ed-big-number-fn">
            <FootnoteRef sourceIds={sourceIds} registry={registry} />
          </p>
        )}
      </figcaption>
    </figure>
  );
}
