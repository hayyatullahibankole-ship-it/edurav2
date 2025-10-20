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

    // Split content into lines and process them
    const lines = text.split('\n');
    let result = '';
    let currentParagraph: string[] = [];
    let inNumberedList = false;
    
    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const content = currentParagraph.join('\n');
        result += `<div class="mb-12 text-base leading-relaxed">${renderMathInline(content)}</div>`;
        currentParagraph = [];
      }
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Empty line - flush current paragraph
      if (!line) {
        if (inNumberedList) {
          inNumberedList = false;
        }
        flushParagraph();
        continue;
      }
      
      // Check if line starts with a number followed by period (numbered list item)
      const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
      
      if (numberedMatch) {
        // Flush any existing paragraph before starting numbered list
        flushParagraph();
        
        const [, num, content] = numberedMatch;
        result += `<div class="flex gap-3 mb-6">
          <span class="font-semibold text-primary min-w-[32px]">${num}.</span>
          <div class="flex-1 leading-relaxed">${renderMathInline(content)}</div>
        </div>`;
        inNumberedList = true;
      } else if (inNumberedList && line && !line.match(/^\d+\./)) {
        // Continuation of previous numbered item (indented content)
        result += `<div class="ml-11 mb-3 leading-relaxed">${renderMathInline(line)}</div>`;
      } else {
        // Regular paragraph line
        if (inNumberedList) {
          inNumberedList = false;
        }
        currentParagraph.push(line);
      }
    }
    
    // Flush any remaining paragraph
    flushParagraph();
    
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
