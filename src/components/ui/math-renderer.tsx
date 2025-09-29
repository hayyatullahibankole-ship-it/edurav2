import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { processQuestionText } from '@/utils/latexProcessor';

interface MathRendererProps {
  content: string;
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ content, className = "" }) => {
  // Process the content to convert mathematical notation to LaTeX
  const processedContent = processQuestionText(content || '');
  
  const isSentenceLike = (s: string) => {
    const wordCount = (s.match(/[A-Za-z]{2,}/g) || []).length;
    const hasEnv = /\\begin\{|\\end\{|matrix|align|equation\*/.test(s);
    return wordCount >= 6 && !hasEnv;
  };

  const hasDollar = /\$/.test(processedContent);
  const hasMathToken = /(\\(frac|sqrt|begin|end|cos|sin|tan|log|ln|vec|sum|int|leq|geq|neq|times|div|alpha|beta|gamma|delta|theta|lambda|mu|sigma|Omega|pi|infty|partial|nabla)|\^|_|√|×|÷)/.test(processedContent);
  
  const renderHybridContent = (text: string) => {
    const segments = text.split(/(\s+)/);
    return segments.map((seg, i) => {
      if (seg.trim() === '') {
        return <span key={`sp-${i}`}>{seg}</span>;
      }

      // Handle trailing punctuation
      const match = seg.match(/^(.*?)([.,;:!?])$/);
      const core = match ? match[1] : seg;
      const punct = match ? match[2] : '';

      // If a backslash appears attached to a prior word, split to preserve spacing (e.g., "text\\cos x")
      const bs = core.indexOf('\\');
      if (bs > 0 && /[A-Za-z0-9)]$/.test(core.slice(0, bs))) {
        const before = core.slice(0, bs);
        const after = core.slice(bs);
        try {
          const html = katex.renderToString(after, {
            displayMode: false,
            throwOnError: false,
            strict: false,
            trust: true,
          });
          return (
            <React.Fragment key={`split-${i}`}>
              <span>{before}</span>
              <span> </span>
              <span dangerouslySetInnerHTML={{ __html: html }} />
              {punct && <span>{punct}</span>}
            </React.Fragment>
          );
        } catch {
          return <span key={`t-${i}`}>{seg}</span>;
        }
      }

      const looksMath = /(\\(frac|sqrt|cos|sin|tan|log|ln|vec|sum|int|leq|geq|neq|times|div|alpha|beta|gamma|delta|theta|lambda|mu|sigma|Omega|pi|infty|partial|nabla)|\^|_|√|×|÷)/.test(core);
      if (looksMath) {
        try {
          const html = katex.renderToString(core, {
            displayMode: false,
            throwOnError: false,
            strict: false,
            trust: true,
          });
          return (
            <React.Fragment key={`m-${i}`}>
              <span dangerouslySetInnerHTML={{ __html: html }} />
              {punct && <span>{punct}</span>}
            </React.Fragment>
          );
        } catch (e) {
          // Fall back to plain text if KaTeX fails
          return <span key={`t-${i}`}>{seg}</span>;
        }
      }

      return <span key={`t-${i}`}>{seg}</span>;
    });
  };

  const renderMathContent = (text: string) => {
    // Enhanced math delimiter detection and error handling
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math (display mode)
        const mathContent = part.slice(2, -2);
        if (isSentenceLike(mathContent)) {
          return (
            <div key={index} className="my-4 text-base leading-relaxed whitespace-pre-wrap">
              {renderHybridContent(mathContent)}
            </div>
          );
        }
        try {
          return (
            <div
              key={index}
              className="my-4 text-center"
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(mathContent, {
                  displayMode: true,
                  throwOnError: false,
                  errorColor: '#dc2626',
                  strict: false,
                  trust: true,
                  macros: {
                    "\\vec": "\\overrightarrow{#1}",
                    "\\pmatrix": "\\begin{pmatrix}#1\\end{pmatrix}",
                    "\\bmatrix": "\\begin{bmatrix}#1\\end{bmatrix}",
                    "\\vmatrix": "\\begin{vmatrix}#1\\end{vmatrix}",
                    "\\,": "\\,", // thin space
                    "\\;": "\\;", // medium space
                    "\\quad": "\\quad", // large space
                    "\\qquad": "\\qquad" // very large space
                  }
                })
              }}
            />
          );
        } catch (error) {
          return (
            <div key={index} className="text-red-600 bg-red-50 p-2 rounded border my-2 text-sm">
              <span className="font-medium">Math Display Error:</span> {mathContent}
            </div>
          );
        }
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        // Inline math
        const mathContent = part.slice(1, -1);
        if (isSentenceLike(mathContent)) {
          return (
            <span key={index} className="whitespace-pre-wrap">
              {renderHybridContent(mathContent)}
            </span>
          );
        }
        try {
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(mathContent, {
                  displayMode: false,
                  throwOnError: false,
                  errorColor: '#dc2626',
                  strict: false,
                  trust: true,
                  macros: {
                    "\\vec": "\\overrightarrow{#1}",
                    "\\pmatrix": "\\begin{pmatrix}#1\\end{pmatrix}",
                    "\\bmatrix": "\\begin{bmatrix}#1\\end{bmatrix}",
                    "\\vmatrix": "\\begin{vmatrix}#1\\end{vmatrix}",
                    "\\,": "\\,", // thin space
                    "\\;": "\\;", // medium space
                    "\\quad": "\\quad", // large space
                    "\\qquad": "\\qquad" // very large space
                  }
                })
              }}
            />
          );
        } catch (error) {
          return (
            <span key={index} className="text-red-600 bg-red-50 px-1 rounded text-sm">
              <span className="font-medium">Math Error:</span> {mathContent}
            </span>
          );
        }
      } else {
        // Regular text - handle line breaks and preserve formatting
        return part.split('\n').map((line, lineIndex, array) => (
          <React.Fragment key={`${index}-${lineIndex}`}>
            {line}
            {lineIndex < array.length - 1 && <br />}
          </React.Fragment>
        ));
      }
    });
  };

  return (
    <div className={className}>
      {hasDollar ? renderMathContent(processedContent) : (hasMathToken ? renderHybridContent(processedContent) : processedContent)}
    </div>
  );
};

export { MathRenderer };