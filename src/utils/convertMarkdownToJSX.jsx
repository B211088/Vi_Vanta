import React from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

const cx = (...c) => c.filter(Boolean).join(" ");

const inlineParse = (text) => {
  if (!text) return [];

  // Bảo toàn inline code trước
  const codeParts = [];
  let i = 0;
  text.split(/(`[^`]*`)/g).forEach((seg) => {
    if (/^`[^`]*`$/.test(seg)) {
      codeParts.push(
        <code key={`code-${i++}`} className="px-1 py-0.5 rounded bg-gray-100">
          {seg.slice(1, -1)}
        </code>
      );
    } else {
      // Inline math $...$ hoặc \( ... \)
      const mathSplit = seg.split(/(\$[^$]+\$|\\\([^()]+\\\))/g);
      mathSplit.forEach((m) => {
        if (/^\$[^$]+\$$/.test(m)) {
          codeParts.push(
            <InlineMath key={`im-${i++}`} math={m.slice(1, -1)} />
          );
        } else if (/^\\\([^()]+\\\)$/.test(m)) {
          codeParts.push(
            <InlineMath key={`im-${i++}`} math={m.slice(2, -2)} />
          );
        } else {
          // **bold**, *italic*, [text](url), superscript ngoài math: x^2 -> x<sup>2</sup>
          let nodes = [m];

          // links
          nodes = nodes.flatMap((chunk) =>
            typeof chunk === "string"
              ? chunk.split(/(\[[^\]]+\]\([^)]+\))/g).map((p, idx) => {
                  if (/^\[[^\]]+\]\([^)]+\)$/.test(p)) {
                    const [_, label, url] =
                      p.match(/^\[([^\]]+)\]\(([^)]+)\)$/) || [];
                    return (
                      <a
                        key={`a-${i++}-${idx}`}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-600 underline"
                      >
                        {label}
                      </a>
                    );
                  }
                  return p;
                })
              : [chunk]
          );

          // bold+italic ***x***
          nodes = nodes.flatMap((chunk) =>
            typeof chunk === "string"
              ? chunk.split(/(\*\*\*[^*]+\*\*\*)/g).map((p) => {
                  if (/^\*\*\*[^*]+\*\*\*$/.test(p)) {
                    return (
                      <strong key={`b+i-${i++}`} className="italic">
                        {p.slice(3, -3)}
                      </strong>
                    );
                  }
                  return p;
                })
              : [chunk]
          );

          // **bold**
          nodes = nodes.flatMap((chunk) =>
            typeof chunk === "string"
              ? chunk.split(/(\*\*[^*]+\*\*)/g).map((p) => {
                  if (/^\*\*[^*]+\*\*$/.test(p)) {
                    return <strong key={`b-${i++}`}>{p.slice(2, -2)}</strong>;
                  }
                  return p;
                })
              : [chunk]
          );

          // *italic*
          nodes = nodes.flatMap((chunk) =>
            typeof chunk === "string"
              ? chunk.split(/(\*[^*]+\*)/g).map((p) => {
                  if (/^\*[^*]+\*$/.test(p)) {
                    return <em key={`i-${i++}`}>{p.slice(1, -1)}</em>;
                  }
                  return p;
                })
              : [chunk]
          );

          // Superscript ngoại lệ đơn giản: số mũ hoặc mũ 1-3 ký tự chữ/số (tránh phá LaTeX vì đã tách)
          nodes = nodes.flatMap((chunk) =>
            typeof chunk === "string"
              ? chunk
                  .split(/(\b[0-9A-Za-z]+)\^([0-9A-Za-z]{1,3})/g)
                  .map((p, idx, arr) => {
                    // arr pattern groups come in triples; handle via match:
                    const m2 = p.match(
                      /^(\b[0-9A-Za-z]+)\^([0-9A-Za-z]{1,3})$/
                    );
                    if (m2) {
                      return (
                        <React.Fragment key={`sup-${i++}-${idx}`}>
                          {m2[1]}
                          <sup>{m2[2]}</sup>
                        </React.Fragment>
                      );
                    }
                    return p;
                  })
              : [chunk]
          );

          codeParts.push(
            ...nodes.map((n, idx2) => (
              <React.Fragment key={`t-${i++}-${idx2}`}>{n}</React.Fragment>
            ))
          );
        }
      });
    }
  });

  return codeParts;
};

export const convertMarkdownToJSX = (content) => {
  if (!content) return null;

  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let listBuf = [];
  let listType = null; // 'ul' | 'ol'
  let olStart = 1;
  let inFence = false;
  let fenceLang = "";
  let fenceLines = [];
  let inMathBlock = false; // $$ ... $$ or \[ ... \]

  const flushList = () => {
    if (!listBuf.length) return;
    if (listType === "ul") {
      out.push(
        <ul
          key={`ul-${out.length}`}
          className="list-disc list-inside space-y-2 mb-4 text-gray-700"
        >
          {listBuf.map((li, idx) => (
            <li key={idx} className="mb-1">
              {li}
            </li>
          ))}
        </ul>
      );
    } else if (listType === "ol") {
      out.push(
        <ol
          key={`ol-${out.length}`}
          start={olStart}
          className="list-decimal list-inside space-y-2 mb-4 text-gray-700"
        >
          {listBuf.map((li, idx) => (
            <li key={idx} className="mb-1">
              {li}
            </li>
          ))}
        </ol>
      );
    }
    listBuf = [];
    listType = null;
    olStart = 1;
  };

  const flushFence = () => {
    if (!inFence) return;
    out.push(
      <pre
        key={`pre-${out.length}`}
        className="mb-4 overflow-auto rounded bg-gray-900 text-gray-100 p-3"
      >
        <code
          className={cx("whitespace-pre", fenceLang && `language-${fenceLang}`)}
        >
          {fenceLines.join("\n")}
        </code>
      </pre>
    );
    inFence = false;
    fenceLang = "";
    fenceLines = [];
  };

  const flushMath = () => {
    if (!inMathBlock) return;
    out.push(
      <BlockMath key={`bm-${out.length}`} math={fenceLines.join("\n")} />
    );
    inMathBlock = false;
    fenceLines = [];
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const raw = lines[idx];

    // Math block toggles
    if (/^\s*(\$\$|\\\[)\s*$/.test(raw)) {
      if (inMathBlock) {
        flushMath();
      } else {
        flushList();
        flushFence();
        inMathBlock = true;
        fenceLines = [];
      }
      continue;
    }

    // Code fence
    const fenceOpen = raw.match(/^\s*```(\w+)?\s*$/);
    if (fenceOpen) {
      if (inFence) {
        // already in fence → closing
        flushFence();
      } else {
        flushList();
        flushMath();
        inFence = true;
        fenceLang = fenceOpen[1] || "";
        fenceLines = [];
      }
      continue;
    }
    if (inFence) {
      fenceLines.push(raw);
      continue;
    }
    if (inMathBlock) {
      fenceLines.push(raw);
      continue;
    }

    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }

    // Headers
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushList();
      const level = h[1].length;
      const tag = `h${level}`;
      out.push(
        React.createElement(
          tag,
          {
            key: `h-${out.length}`,
            className: cx(
              "mt-6 mb-3 font-semibold text-gray-800",
              level === 1 && "text-3xl",
              level === 2 && "text-2xl",
              level === 3 && "text-xl",
              level >= 4 && "text-lg"
            ),
          },
          inlineParse(h[2])
        )
      );
      continue;
    }

    const singleLineBlock = line.match(/^\\\[(.+)\\\]$/);
    if (singleLineBlock) {
      flushList();
      out.push(
        <BlockMath
          key={`bm-inline-${out.length}`}
          math={singleLineBlock[1].trim()}
        />
      );
      continue;
    }

    // Mixed content: text ... \[ math \] ... text (trên 1 dòng)
    if (line.includes("\\[") && line.includes("\\]")) {
      flushList();
      const parts = line.split(/(\\\[[\s\S]+?\\\])/g);
      out.push(
        <p
          key={`p-mixed-${out.length}`}
          className="text-gray-800 leading-relaxed mb-4"
        >
          {parts.map((part, i) => {
            if (/^\\\[[\s\S]+\\\]$/.test(part)) {
              const math = part.slice(2, -2).trim();
              return <BlockMath key={`bm-mix-${i}`} math={math} />;
            }
            return (
              <React.Fragment key={`frag-${i}`}>
                {inlineParse(part)}
              </React.Fragment>
            );
          })}
        </p>
      );
      continue;
    }

    // Blockquote
    if (/^>\s+/.test(line)) {
      flushList();
      out.push(
        <blockquote
          key={`q-${out.length}`}
          className="border-l-4 border-gray-300 pl-4 italic  mb-4"
        >
          {inlineParse(line.replace(/^>\s+/, ""))}
        </blockquote>
      );
      continue;
    }

    // HR
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flushList();
      out.push(
        <hr key={`hr-${out.length}`} className="my-6 border-gray-200" />
      );
      continue;
    }

    // List items
    const ul = line.match(/^[-*]\s+(.*)$/);
    const ol = line.match(/^(\d+)\.\s+(.*)$/);

    if (ul) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listBuf.push(<span>{inlineParse(ul[1])}</span>);
      continue;
    }
    if (ol) {
      const startNum = Number(ol[1]);
      if (listType !== "ol") {
        flushList();
        listType = "ol";
        olStart = startNum || 1;
      }
      listBuf.push(<span>{inlineParse(ol[2])}</span>);
      continue;
    }

    // Paragraph (with possible inline math)
    flushList();
    out.push(
      <p key={`p-${out.length}`} className=" leading-relaxed ">
        {inlineParse(line)}
      </p>
    );
  }

  // finalize
  flushList();
  flushFence();
  flushMath();

  return <div className="prose max-w-none">{out}</div>;
};

export const convertMarkdownToHTML = (content) => {
  return "";
};

export const MarkdownRenderer = ({ content }) => {
  return (
    <div className="prose max-w-none text-justify">
      {convertMarkdownToJSX(content)}
    </div>
  );
};
