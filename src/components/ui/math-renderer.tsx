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
  
  const renderMathContent = (text: string) => {
    // Enhanced math delimiter detection and error handling
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math (display mode)
        const mathContent = part.slice(2, -2);
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
                    "\\vmatrix": "\\begin{vmatrix}#1\\end{vmatrix}"
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
                    "\\vmatrix": "\\begin{vmatrix}#1\\end{vmatrix}"
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
      {renderMathContent(processedContent)}
    </div>
  );
};

export { MathRenderer };