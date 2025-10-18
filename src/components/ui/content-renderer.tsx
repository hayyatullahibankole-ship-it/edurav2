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

    // Split by double newlines to preserve paragraph structure
    const blocks = text.split('\n\n');
    
    return blocks
      .map(block => {
        const trimmed = block.trim();
        if (!trimmed) return '';

        // Check for tables ONLY (strict: 3+ tabs, 3+ rows, no questions/answers)
        if (trimmed.includes('\t')) {
          const rows = trimmed.split('\n').filter(row => row.trim());
          if (rows.length >= 3) {
            const firstRow = rows[0];
            const tabCount = (firstRow.match(/\t/g) || []).length;
            const isRealTable = 
              tabCount >= 2 &&
              !firstRow.includes('?') &&
              !firstRow.includes('(') &&
              rows.every(row => !row.includes('(A)') && !row.includes('(B)'));
            
            if (isRealTable) {
              const headerCells = rows[0].split('\t').map(cell => 
                `<th class="border border-border bg-primary/10 px-3 py-2 font-semibold text-left text-sm">${renderMathInline(cell.trim())}</th>`
              ).join('');
              const bodyRows = rows.slice(1).map((row, idx) => {
                const cells = row.split('\t').map(cell =>
                  `<td class="border border-border px-3 py-2 text-sm">${renderMathInline(cell.trim())}</td>`
                ).join('');
                return `<tr class="${idx % 2 === 0 ? 'bg-card' : 'bg-muted/20'}">${cells}</tr>`;
              }).join('');
              return `<div class="overflow-x-auto my-6"><table class="w-full border-collapse border border-border rounded-lg text-sm"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>`;
            }
          }
        }

        // For everything else: preserve exact formatting with line breaks
        const processedContent = trimmed
          .split('\n')
          .map(line => renderMathInline(line))
          .join('\n');
        
        return `<div class="mb-6 text-base leading-relaxed whitespace-pre-line">${processedContent}</div>`;
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
      className={`prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:scroll-mt-20 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};

export { ContentRenderer };
