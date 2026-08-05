import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import DOMPurify from 'dompurify';
import { processQuestionText } from '@/utils/latexProcessor';

interface ContentRendererProps {
  content: string;
  className?: string;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({ content, className = "" }) => {
  // Process the content to convert mathematical notation to LaTeX
  const processedContent = processQuestionText(content || '');

  const renderMathInline = (text: string): string => {
    // Handle inline math ($...$) and display math ($$...$$)
    let result = text;
    
    // Process display math first ($$...$$)
    result = result.replace(/\$\$([\s\S]*?)\$\$/g, (match, mathContent) => {
      try {
        const html = katex.renderToString(mathContent.trim(), {
          displayMode: true,
          throwOnError: false,
          strict: false,
          trust: true,
        });
        return `<div class="my-4 text-center katex-display">${html}</div>`;
      } catch (error) {
        return `<div class="text-red-600 bg-red-50 p-2 rounded my-2 text-sm">Math Error: ${mathContent}</div>`;
      }
    });

    // Process inline math ($...$)
    result = result.replace(/\$([^\$\n]+?)\$/g, (match, mathContent) => {
      try {
        const html = katex.renderToString(mathContent.trim(), {
          displayMode: false,
          throwOnError: false,
          strict: false,
          trust: true,
        });
        return `<span class="katex-inline">${html}</span>`;
      } catch (error) {
        return `<span class="text-red-600 text-sm">Math Error: ${mathContent}</span>`;
      }
    });

    return result;
  };

  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Inline markdown: bold, italic, code, strikethrough, links — applied AFTER math protection
  const renderInline = (text: string): string => {
    let out = text;
    out = out.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-muted text-[0.9em]">$1</code>');
    out = out.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
    out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    out = out.replace(/__([^_]+)__/g, '<strong class="font-semibold">$1</strong>');
    out = out.replace(/~~([^~]+)~~/g, '<s>$1</s>');
    out = out.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2">$1</a>'
    );
    return renderMathInline(out);
  };

  const headingClass = (level: number): string => {
    switch (level) {
      case 1:
        return 'text-2xl sm:text-3xl font-bold mt-8 mb-4 first:mt-0 tracking-tight';
      case 2:
        return 'text-xl sm:text-2xl font-bold mt-8 mb-3 first:mt-0 tracking-tight';
      case 3:
        return 'text-lg sm:text-xl font-semibold mt-6 mb-3 first:mt-0';
      case 4:
        return 'text-base sm:text-lg font-semibold mt-5 mb-2 first:mt-0';
      default:
        return 'text-base font-semibold mt-4 mb-2 first:mt-0 text-muted-foreground';
    }
  };

  const formatContent = (text: string): string => {
    if (!text) return '';

    // Content authored as HTML — render as-is (math only)
    if (/<(p|h[1-6]|div|ul|ol|table|br\s*\/?)>/i.test(text)) {
      return renderMathInline(text);
    }

    const lines = text.replace(/\r\n/g, '\n').split('\n');
    let html = '';
    let i = 0;

    const listItemHtml = (content: string, indent: number) =>
      `<li class="leading-relaxed${indent > 0 ? ' ml-5' : ''}">${renderInline(content)}</li>`;

    while (i < lines.length) {
      const raw = lines[i];
      const line = raw.trim();

      // Blank line -> block separator
      if (!line) {
        i++;
        continue;
      }

      // Fenced code block
      if (line.startsWith('```')) {
        const buf: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          buf.push(lines[i]);
          i++;
        }
        i++;
        html += `<pre class="my-5 p-4 rounded-lg bg-muted overflow-x-auto text-sm"><code>${escapeHtml(
          buf.join('\n')
        )}</code></pre>`;
        continue;
      }

      // Horizontal rule
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
        html += '<hr class="my-8 border-border" />';
        i++;
        continue;
      }

      // ATX heading (#, ##, ...)
      const heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        const level = heading[1].length;
        html += `<h${level} class="${headingClass(level)}">${renderInline(heading[2].trim())}</h${level}>`;
        i++;
        continue;
      }

      // Blockquote
      if (line.startsWith('>')) {
        const buf: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          buf.push(lines[i].trim().replace(/^>\s?/, ''));
          i++;
        }
        html += `<blockquote class="my-5 border-l-4 border-primary/60 pl-4 italic text-muted-foreground">${renderInline(
          buf.join('<br />')
        )}</blockquote>`;
        continue;
      }

      // Ordered list
      if (/^\d+[.)]\s+/.test(line)) {
        let items = '';
        let start = parseInt(line.match(/^(\d+)/)![1], 10);
        while (i < lines.length) {
          const cur = lines[i];
          const t = cur.trim();
          const m = t.match(/^\d+[.)]\s+(.*)$/);
          if (m) {
            items += listItemHtml(m[1], 0);
            i++;
          } else if (t && /^\s{2,}/.test(cur) && items) {
            // continuation of previous item
            items = items.replace(/<\/li>$/, `<br />${renderInline(t)}</li>`);
            i++;
          } else {
            break;
          }
        }
        html += `<ol start="${start}" class="my-5 space-y-2 list-decimal pl-6 marker:font-semibold marker:text-primary">${items}</ol>`;
        continue;
      }

      // Unordered list
      if (/^[-*•]\s+/.test(line)) {
        let items = '';
        while (i < lines.length) {
          const cur = lines[i];
          const t = cur.trim();
          const m = t.match(/^[-*•]\s+(.*)$/);
          if (m) {
            const indent = /^\s{2,}/.test(cur) ? 1 : 0;
            items += listItemHtml(m[1], indent);
            i++;
          } else if (t && /^\s{2,}/.test(cur) && items) {
            items = items.replace(/<\/li>$/, `<br />${renderInline(t)}</li>`);
            i++;
          } else {
            break;
          }
        }
        html += `<ul class="my-5 space-y-2 list-disc pl-6 marker:text-primary">${items}</ul>`;
        continue;
      }

      // Paragraph: collect until blank line or a new block starts
      const para: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (
          !t ||
          t.startsWith('```') ||
          t.startsWith('>') ||
          /^#{1,6}\s+/.test(t) ||
          /^\d+[.)]\s+/.test(t) ||
          /^[-*•]\s+/.test(t) ||
          /^(-{3,}|\*{3,}|_{3,})$/.test(t)
        ) {
          break;
        }
        para.push(t);
        i++;
      }

      if (para.length) {
        // A single short line ending without punctuation acts as a subtitle
        const single = para.length === 1 ? para[0] : '';
        const looksLikeSubtitle =
          single &&
          single.length <= 70 &&
          !/[.!?,:;]$/.test(single) &&
          (single === single.toUpperCase() || /^[A-Z0-9]/.test(single)) &&
          single === single.toUpperCase();

        if (looksLikeSubtitle) {
          html += `<h3 class="${headingClass(3)}">${renderInline(single)}</h3>`;
        } else {
          html += `<p class="mb-5 text-base leading-7 sm:leading-8">${renderInline(
            para.join('<br />')
          )}</p>`;
        }
      }
    }

    return html;
  };



  const formattedHTML = formatContent(processedContent);
  const sanitizedHTML = DOMPurify.sanitize(formattedHTML, {
    ADD_TAGS: ['span', 'div', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'pre', 'code', 'strong', 'em', 's', 'a'],
    ADD_ATTR: ['class', 'style', 'href', 'target', 'rel', 'start'],
  });

  return (
    <div 
      className={`max-w-none text-foreground break-words [&_img]:rounded-lg [&_img]:my-4 [&_table]:w-full [&_p:last-child]:mb-0 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};

export { ContentRenderer };
