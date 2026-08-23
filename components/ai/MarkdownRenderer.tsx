"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  // Simple, safe Markdown parser tailored for assistant responses
  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let listItems: string[] = [];

    const flushList = (keyPrefix: number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${keyPrefix}`} className="list-disc list-inside my-2 space-y-1 text-concrete-800">
            {listItems.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {parseInline(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const flushTable = (keyPrefix: number) => {
      if (tableRows.length > 0) {
        const header = tableRows[0];
        const body = tableRows.slice(2); // skip separator row if present
        elements.push(
          <div key={`table-${keyPrefix}`} className="my-3 overflow-x-auto rounded-lg border border-concrete-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs text-concrete-800 border-collapse">
              <thead className="bg-concrete-100 text-charcoal-black font-semibold border-b border-concrete-200">
                <tr>
                  {header.map((col, idx) => (
                    <th key={idx} className="px-3 py-2 border-r border-concrete-200 last:border-0">
                      {parseInline(col.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-concrete-200 hover:bg-concrete-50">
                    {row.map((col, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 border-r border-concrete-200 last:border-0">
                        {parseInline(col.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Check Table row
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        flushList(idx);
        inTable = true;
        const cols = trimmed.slice(1, -1).split("|");
        tableRows.push(cols);
        return;
      } else if (inTable) {
        flushTable(idx);
      }

      // Check Headings
      if (trimmed.startsWith("### ")) {
        flushList(idx);
        elements.push(
          <h3 key={idx} className="text-base font-bold text-accent-orange mt-4 mb-2">
            {parseInline(trimmed.replace(/^###\s+/, ""))}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith("## ")) {
        flushList(idx);
        elements.push(
          <h2 key={idx} className="text-lg font-bold text-charcoal-black mt-4 mb-2 border-b border-concrete-200 pb-1">
            {parseInline(trimmed.replace(/^##\s+/, ""))}
          </h2>
        );
        return;
      }
      if (trimmed.startsWith("# ")) {
        flushList(idx);
        elements.push(
          <h1 key={idx} className="text-xl font-extrabold text-charcoal-black mt-5 mb-3">
            {parseInline(trimmed.replace(/^#\s+/, ""))}
          </h1>
        );
        return;
      }

      // Check Bullet list
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        listItems.push(trimmed.replace(/^[-*]\s+/, ""));
        return;
      } else {
        flushList(idx);
      }

      // Empty line
      if (trimmed === "") {
        elements.push(<div key={idx} className="h-2" />);
        return;
      }

      // Regular paragraph
      elements.push(
        <p key={idx} className="leading-relaxed text-concrete-800 my-1">
          {parseInline(line)}
        </p>
      );
    });

    flushList(lines.length);
    flushTable(lines.length);

    return elements;
  };

  // Helper to parse bold (**), italic (*), and code (`) inline
  const parseInline = (text: string): React.ReactNode => {
    // Regex split for **bold**, *italic*, and `code`
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-charcoal-black">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={i} className="italic text-concrete-700">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-concrete-100 text-accent-orange text-xs font-mono border border-concrete-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return <div className="space-y-1 text-sm text-concrete-800">{renderFormattedText(content)}</div>;
};
