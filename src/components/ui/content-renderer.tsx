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

    // If content already has HTML tags, process it differently
    if (text.includes('<p>') || text.includes('<h1>') || text.includes('<h2>') || text.includes('<div>')) {
      // Content already has HTML formatting, just render math
      return renderMathInline(text);
    }

    // Split content by double line breaks to create paragraphs
    const paragraphs = text.split(/\n\n+/);
    let result = '';
    
    for (const para of paragraphs) {
      const trimmedPara = para.trim();
      if (!trimmedPara) continue;

      // Check if it's a heading (starts with # or is short and uppercase)
      if (trimmedPara.startsWith('#')) {
        const headingText = trimmedPara.replace(/^#+\s*/, '');
        result += `<h3 class="text-xl font-bold mb-4 mt-8">${renderMathInline(headingText)}</h3>`;
        continue;
      }

      // Check for numbered list items
      const lines = trimmedPara.split('\n');
      const hasNumberedList = lines.some(line => /^\d+\.\s+/.test(line.trim()));
      
      if (hasNumberedList) {
        // Process as numbered list
        let inList = false;
        for (const line of lines) {
          const trimmedLine = line.trim();
          const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
          
          if (numberedMatch) {
            const [, num, content] = numberedMatch;
            result += `<div class="flex gap-3 mb-4">
              <span class="font-semibold text-primary min-w-[32px]">${num}.</span>
              <div class="flex-1 leading-relaxed">${renderMathInline(content)}</div>
            </div>`;
            inList = true;
          } else if (trimmedLine && inList) {
            // Continuation line
            result += `<div class="ml-11 mb-2 leading-relaxed">${renderMathInline(trimmedLine)}</div>`;
          }
        }
      } else {
        // Regular paragraph - preserve internal line breaks as <br>
        const htmlContent = trimmedPara
          .split('\n')
          .map(line => line.trim())
          .filter(line => line)
          .join('<br class="my-2">');
        
        result += `<p class="mb-6 text-base leading-relaxed">${renderMathInline(htmlContent)}</p>`;
      }
    }
    
    return result;
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
