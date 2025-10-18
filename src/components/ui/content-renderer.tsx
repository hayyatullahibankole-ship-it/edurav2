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

  const formatContent = (text: string): string => {
    if (!text) return '';

    // Split by double line breaks to create paragraphs
    const blocks = text.split('\n\n');
    
    return blocks
      .map(block => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return '';

        // Handle emoji section headers (like 🧩 Examples, 🧾 Practice)
        const emojiHeaderMatch = trimmedBlock.match(/^([\p{Emoji}])\s+(.+)$/u);
        if (emojiHeaderMatch && trimmedBlock.split('\n').length === 1) {
          return `<div class="text-2xl font-bold mt-12 mb-6 pb-4 border-b-4 border-primary/30 bg-primary/5 p-5 rounded-xl shadow-sm flex items-center gap-3">
            <span class="text-3xl">${emojiHeaderMatch[1]}</span>
            <span>${renderMathInline(emojiHeaderMatch[2])}</span>
          </div>`;
        }

        // Handle headers (# Header, ## Header, ### Header)
        if (trimmedBlock.startsWith('#')) {
          const headerMatch = trimmedBlock.match(/^(#{1,6})\s+(.+)$/);
          if (headerMatch) {
            const level = headerMatch[1].length;
            const headerText = renderMathInline(headerMatch[2]);
            return `<h${level} class="font-bold mt-12 mb-6 ${level === 1 ? 'text-4xl' : level === 2 ? 'text-3xl' : level === 3 ? 'text-2xl' : level === 4 ? 'text-xl' : 'text-lg'} ${level <= 2 ? 'border-b-2 border-border/30 pb-4' : ''}">${headerText}</h${level}>`;
          }
        }

        // Handle blockquotes (> text)
        if (trimmedBlock.startsWith('>')) {
          const quoteText = trimmedBlock
            .split('\n')
            .map(line => line.replace(/^>\s*/, ''))
            .join('<br/>');
          return `<blockquote class="border-l-[6px] border-primary bg-muted/30 rounded-r-lg px-8 py-6 my-10 italic text-foreground/90 text-lg leading-relaxed shadow-md">${renderMathInline(quoteText)}</blockquote>`;
        }

        // Handle horizontal rules (---)
        if (trimmedBlock === '---' || trimmedBlock === '***') {
          return '<hr class="my-12 border-t-2 border-border/50"/>';
        }

        // Handle emoji number bullets (1️⃣, 2️⃣, etc.)
        // These are: digit + optional variation selector + combining enclosing keycap
        const emojiNumberPattern = /^[0-9]\uFE0F?\u20E3\s/;
        if (emojiNumberPattern.test(trimmedBlock)) {
          const listItems = trimmedBlock
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
              const emojiMatch = line.match(/^([0-9]\uFE0F?\u20E3)\s*(.+)$/);
              if (emojiMatch) {
                return `<li class="mb-8 flex items-start gap-4 p-4 rounded-lg bg-muted/20">
                  <span class="text-4xl font-bold flex-shrink-0 text-primary">${emojiMatch[1]}</span>
                  <span class="flex-1 leading-loose text-lg pt-1">${renderMathInline(emojiMatch[2])}</span>
                </li>`;
              }
              return '';
            })
            .join('');
          return `<ul class="list-none pl-0 my-10 space-y-4">${listItems}</ul>`;
        }

        // Handle unordered lists (- item or * item)
        if (/^[-*•]\s/.test(trimmedBlock)) {
          const listItems = trimmedBlock
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
              const itemText = line.replace(/^[-*•]\s*/, '');
              return `<li class="mb-4 leading-loose">${renderMathInline(itemText)}</li>`;
            })
            .join('');
          return `<ul class="list-disc pl-8 my-8 space-y-2">${listItems}</ul>`;
        }

        // Handle numbered lists (1. item, 2. item)
        if (/^\d+\.\s/.test(trimmedBlock)) {
          const listItems = trimmedBlock
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
              const itemText = line.replace(/^\d+\.\s*/, '');
              return `<li class="mb-4 leading-loose">${renderMathInline(itemText)}</li>`;
            })
            .join('');
          return `<ol class="list-decimal pl-8 my-8 space-y-2">${listItems}</ol>`;
        }

        // Handle tab-separated tables (for content like "🧩 Examples")
        if (trimmedBlock.includes('\t') && trimmedBlock.split('\n').length > 1) {
          const rows = trimmedBlock.split('\n').filter(row => row.trim());
          const tableRows = rows.map((row, idx) => {
            const cells = row.split('\t').filter(cell => cell.trim()).map(cell =>
              `<td class="border border-border px-6 py-4 ${idx === 0 ? 'font-semibold bg-muted' : ''}">${renderMathInline(cell.trim())}</td>`
            ).join('');
            return `<tr class="${idx % 2 === 1 ? 'bg-card' : 'bg-muted/20'} hover:bg-muted/40 transition-colors">${cells}</tr>`;
          }).join('');

          return `<table class="w-full my-10 border-collapse border-2 border-border rounded-lg overflow-hidden shadow-md"><tbody>${tableRows}</tbody></table>`;
        }

        // Handle tables (basic markdown table detection)
        if (trimmedBlock.includes('|') && trimmedBlock.split('\n').length > 1) {
          const rows = trimmedBlock.split('\n').filter(row => row.trim());
          if (rows.length > 1 && rows[1].includes('---')) {
            const headerCells = rows[0].split('|').filter(cell => cell.trim()).map(cell => 
              `<th class="border border-border bg-muted px-6 py-4 font-bold text-left">${renderMathInline(cell.trim())}</th>`
            ).join('');
            
            const bodyRows = rows.slice(2).map((row, idx) => {
              const cells = row.split('|').filter(cell => cell.trim()).map(cell =>
                `<td class="border border-border px-6 py-4">${renderMathInline(cell.trim())}</td>`
              ).join('');
              return `<tr class="${idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'} hover:bg-muted/40 transition-colors">${cells}</tr>`;
            }).join('');

            return `<table class="w-full my-10 border-collapse border-2 border-border rounded-lg overflow-hidden shadow-md"><thead class="bg-primary/10"><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
          }
        }

        // Regular paragraph - replace single line breaks with <br/>
        const formatted = trimmedBlock
          .split('\n')
          .filter(line => line.trim())
          .map(line => renderMathInline(line))
          .join('<br/>');
        
        return formatted ? `<p class="mb-8 leading-loose text-lg">${formatted}</p>` : '';
      })
      .filter(p => p)
      .join('');
  };

  const formattedHTML = formatContent(processedContent);
  const sanitizedHTML = DOMPurify.sanitize(formattedHTML, {
    ADD_TAGS: ['span', 'div', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr'],
    ADD_ATTR: ['class', 'style'],
  });

  return (
    <div 
      className={`prose dark:prose-invert max-w-none prose-headings:scroll-mt-20 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};

export { ContentRenderer };
