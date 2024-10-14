import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const renderLatex = (content: string): React.ReactNode => {
  try {
    const regexAll = /\\\[(.*?)\\\]|\$(.*?)\$|\\\\\((.*?)\\\\\)|\\\\\[(.*?)\\\\\]|\\([a-zA-Z]+)|([^$\\]+)/g;
    let segments: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    const handleTextFormula = (text: string): React.ReactNode[] => {
      const regexTextFormula = /([^\\]*)\\\\\((.*?)\\\\\)/g;
      let result: React.ReactNode[] = [];
      let lastTextIndex = 0;
      let textMatch;

      while ((textMatch = regexTextFormula.exec(text)) !== null) {
        const plainText = text.substring(lastTextIndex, textMatch.index);
        if (plainText) {
          result.push(<span key={`text-${lastTextIndex}`}>{plainText}</span>);
        }
        result.push(<InlineMath key={`formula-${textMatch.index}`}>{textMatch[2]}</InlineMath>);
        lastTextIndex = regexTextFormula.lastIndex;
      }

      const remainingText = text.substring(lastTextIndex);
      if (remainingText) {
        result.push(<span key={`text-${lastTextIndex}`}>{remainingText}</span>);
      }

      return result;
    };
    if (content) {
      while ((match = regexAll.exec(content)) !== null) {
        if (match[1]) {
          segments.push(<BlockMath key={`block-${match.index}`}>{match[1]}</BlockMath>);
        } else if (match[2]) {
          segments.push(<InlineMath key={`inline-${match.index}`}>{match[2]}</InlineMath>);
        } else if (match[3]) {
          segments.push(<InlineMath key={`inline-formula-${match.index}`}>{match[3]}</InlineMath>);
        } else if (match[4]) {
          segments.push(<BlockMath key={`block-formula-${match.index}`}>{match[4]}</BlockMath>);
        } else if (match[5]) {
          switch (match[5]) {
            case 'textunderscore':
              segments.push(<span key={`textunderscore-${match.index}`}>_</span>);
              break;
            default:
              segments.push(<span key={`unknown-${match.index}`}>{`\\${match[5]}`}</span>);
              break;
          }
        } else if (match[6]) {
          segments.push(...handleTextFormula(match[6]));
        }
        lastIndex = regexAll.lastIndex;
      }
    }

    const remainingPlainText = content.substring(lastIndex);
    if (remainingPlainText) {
      segments.push(...handleTextFormula(remainingPlainText));
    }

    return segments;
  } catch (error) {
    console.error('Error rendering LaTeX content:', error);
    return <div>Error rendering LaTeX content</div>;
  }
};

export default renderLatex;
