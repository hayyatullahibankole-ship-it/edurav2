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

        // Detect section headers (capitalized lines without markdown #, short length)
        if (!trimmedBlock.includes('\n') && 
            /^[A-Z]/.test(trimmedBlock) && 
            trimmedBlock.length < 60 &&
            !trimmedBlock.endsWith('.') &&
            !trimmedBlock.match(/^\d+[\.)]/)) {
          return `<h2 class="text-2xl font-bold mt-12 mb-6 pb-3 border-b-2 border-primary/20 text-primary">${renderMathInline(trimmedBlock)}</h2>`;
        }

        // Handle headers (# Header, ## Header, ### Header)
        if (trimmedBlock.startsWith('#')) {
          const headerMatch = trimmedBlock.match(/^(#{1,6})\s+(.+)$/);
          if (headerMatch) {
            const level = headerMatch[1].length;
            const headerText = renderMathInline(headerMatch[2]);
            return `<h${level} class="font-bold mt-12 mb-6 ${level === 1 ? 'text-4xl' : level === 2 ? 'text-3xl' : level === 3 ? 'text-2xl' : level === 4 ? 'text-xl' : 'text-lg'} ${level <= 2 ? 'border-b-2 border-border/30 pb-3' : ''}">${headerText}</h${level}>`;
          }
        }

        // Handle blockquotes (> text)
        if (trimmedBlock.startsWith('>')) {
          const quoteText = trimmedBlock
            .split('\n')
            .map(line => line.replace(/^>\s*/, ''))
            .join('<br/>');
          return `<blockquote class="border-l-[6px] border-primary bg-muted/30 rounded-r-lg px-6 py-4 my-10 italic text-foreground/90 shadow-sm">${renderMathInline(quoteText)}</blockquote>`;
        }

        // Handle horizontal rules (---)
        if (trimmedBlock === '---' || trimmedBlock === '***') {
          return '<hr class="my-12 border-t-2 border-border/50"/>';
        }

        // Handle unordered lists (- item or * item or emoji bullets)
        if (/^[-*•]\s/.test(trimmedBlock) || /^[\u0030-\u0039\uFE0F\u20E3]+\s/.test(trimmedBlock)) {
          const listItems = trimmedBlock
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
              // Check if it's an emoji bullet
              const emojiMatch = line.match(/^([\u0030-\u0039\uFE0F\u20E3]+)\s*(.+)$/);
              if (emojiMatch) {
                return `<li class="mb-4 flex items-start gap-3"><span class="text-2xl flex-shrink-0 mt-0.5">${emojiMatch[1]}</span><span class="flex-1 leading-relaxed">${renderMathInline(emojiMatch[2])}</span></li>`;
              }
              const itemText = line.replace(/^[-*•]\s*/, '');
              return `<li class="mb-3 leading-relaxed">${renderMathInline(itemText)}</li>`;
            })
            .join('');
          return `<ul class="list-disc pl-6 my-8 space-y-1">${listItems}</ul>`;
        }

        // Handle numbered lists (1. item, 2. item) with special Example: handling
        if (/^\d+\.\s/.test(trimmedBlock)) {
          const lines = trimmedBlock.split('\n').filter(line => line.trim());
          let listHTML = '';
          let i = 0;
          
          while (i < lines.length) {
            const line = lines[i];
            const numberMatch = line.match(/^(\d+)\.\s*(.+)$/);
            
            if (numberMatch) {
              const itemText = numberMatch[2];
              let exampleHTML = '';
              
              // Check if next line is an Example:
              if (i + 1 < lines.length && lines[i + 1].trim().startsWith('Example:')) {
                const exampleText = lines[i + 1].replace(/^Example:\s*/i, '');
                exampleHTML = `<div class="mt-2 ml-6 p-3 bg-muted/40 rounded-lg border-l-4 border-primary/30">
          <span class="text-xs font-semibold text-primary uppercase tracking-wide">Example</span>
          <p class="text-sm mt-1 text-muted-foreground">${renderMathInline(exampleText)}</p>
        </div>`;
                i++; // Skip the example line
              }
              
              listHTML += `<li class="mb-6">
        <div class="text-base leading-relaxed font-medium">${renderMathInline(itemText)}</div>
        ${exampleHTML}
      </li>`;
            }
            i++;
          }
          
          return `<ol class="list-decimal pl-8 my-8 space-y-2 text-lg [&>li::marker]:text-primary [&>li::marker]:font-bold">${listHTML}</ol>`;
        }

        // Handle tab-separated tables (before markdown table check)
        if (trimmedBlock.includes('\t')) {
          const rows = trimmedBlock.split('\n').filter(row => row.trim());
          if (rows.length > 1) {
            // First row is header
            const headerCells = rows[0].split('\t').map(cell => 
              `<th class="border border-border bg-primary/10 px-6 py-4 font-bold text-left">${renderMathInline(cell.trim())}</th>`
            ).join('');
            
            // Remaining rows are body
            const bodyRows = rows.slice(1).map((row, idx) => {
              const cells = row.split('\t').map(cell =>
                `<td class="border border-border px-6 py-4">${renderMathInline(cell.trim())}</td>`
              ).join('');
              return `<tr class="${idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'} hover:bg-muted/40 transition-colors">${cells}</tr>`;
            }).join('');

            return `<table class="w-full my-10 border-collapse border-2 border-border rounded-lg overflow-hidden shadow-sm"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
          }
        }

        // Handle markdown tables (basic markdown table detection)
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

            return `<table class="w-full my-10 border-collapse border-2 border-border rounded-lg overflow-hidden shadow-sm"><thead class="bg-primary/10"><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
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
