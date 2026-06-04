import { StyleSettings } from '../types';

/**
 * Intelligently splits a chapter's content into pages based on style configuration and responsive screen layout.
 * We use sentence-boundary grouping to ensure pages end at natural sentence limits rather than chopped-up words,
 * and we scale capacity dynamically according to font size and dual/single-page setup.
 */
export function paginateChapterContent(
  content: string,
  settings: StyleSettings,
  isMobile: boolean
): string[] {
  // 1. Create a virtual DOM parser to handle rich HTML content securely
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  // Extract all text-containing elements or text directly
  const paragraphs: string[] = [];
  
  // If the epub/txt content is already structured as paragraphs
  const pTags = doc.querySelectorAll('p, blockquote, li, h1, h2, h3, h4');
  if (pTags.length > 0) {
    pTags.forEach(p => {
      const text = p.textContent?.trim();
      if (text) {
        // Tag format preservation
        const tagName = p.tagName.toLowerCase();
        if (tagName.startsWith('h')) {
          paragraphs.push(`__HEADER__:${tagName}:${text}`);
        } else if (tagName === 'blockquote') {
          paragraphs.push(`__QUOTE__:${text}`);
        } else {
          paragraphs.push(text);
        }
      }
    });
  } else {
    // Treat as raw text, split by double newlines or single newlines
    const rawText = doc.body ? doc.body.textContent || '' : content;
    rawText.split(/\n\s*\n/).forEach(block => {
      const text = block.trim().replace(/\s+/g, ' ');
      if (text) {
        paragraphs.push(text);
      }
    });
  }

  // If there are no paragraphs, show at least a blank placeholder
  if (paragraphs.length === 0) {
    return ['[Pagină goală]'];
  }

  // 2. Determine word capacity per page dynamically
  // Two-page spread has half the width per page, so fewer words per side
  const baseWordsPerPage = isMobile ? 130 : (settings.twoPageSpread ? 200 : 220);

  // Inverse exponential scale for font sizing (larger fonts -> fewer words per page)
  const scale = Math.pow(18 / settings.fontSize, 1.3);
  const wordsPerPageLimit = Math.max(60, Math.floor(baseWordsPerPage * scale));

  const pages: string[] = [];
  let currentPageParagraphs: string[] = [];
  let currentPageWordCount = 0;

  // Process text block-by-block
  for (let i = 0; i < paragraphs.length; i++) {
    const block = paragraphs[i];
    let isHeader = false;
    let isQuote = false;
    let cleanText = block;

    if (block.startsWith('__HEADER__:')) {
      isHeader = true;
      const parts = block.split(':');
      cleanText = parts.slice(2).join(':');
    } else if (block.startsWith('__QUOTE__:')) {
      isQuote = true;
      cleanText = block.substring(10);
    }

    const wordCount = cleanText.split(/\s+/).length;

    // Check if adding this entire block exceeds the target word count
    if (currentPageWordCount + wordCount <= wordsPerPageLimit + 30 || currentPageWordCount === 0) {
      // Add text block to current page
      currentPageParagraphs.push(formatParagraph(cleanText, isHeader, isQuote));
      currentPageWordCount += wordCount;
    } else {
      // If the block is very long (e.g. massive single paragraph), split it into sentences
      if (wordCount > wordsPerPageLimit / 2) {
        const sentences = splitIntoSentences(cleanText);
        let subParagraphText = '';
        let subWordCount = 0;

        for (let s = 0; s < sentences.length; s++) {
          const sentence = sentences[s];
          const sentenceWordCount = sentence.split(/\s+/).length;

          if (currentPageWordCount + subWordCount + sentenceWordCount > wordsPerPageLimit && currentPageWordCount > 0) {
            // Commit remaining subParagraph as finished
            if (subParagraphText) {
              currentPageParagraphs.push(formatParagraph(subParagraphText, isHeader, isQuote));
            }
            // Push page
            pages.push(assemblePageHTML(currentPageParagraphs));
            // Reset page state
            currentPageParagraphs = [];
            currentPageWordCount = 0;
            subParagraphText = '';
            subWordCount = 0;
          }

          subParagraphText += (subParagraphText ? ' ' : '') + sentence;
          subWordCount += sentenceWordCount;
        }

        if (subParagraphText) {
          currentPageParagraphs.push(formatParagraph(subParagraphText, isHeader, isQuote));
          currentPageWordCount += subWordCount;
        }
      } else {
        // Simple case: Push current page, start new page with the block
        pages.push(assemblePageHTML(currentPageParagraphs));
        currentPageParagraphs = [formatParagraph(cleanText, isHeader, isQuote)];
        currentPageWordCount = wordCount;
      }
    }
  }

  // Add the last remaining page
  if (currentPageParagraphs.length > 0) {
    pages.push(assemblePageHTML(currentPageParagraphs));
  }

  return pages;
}

/**
 * Format string as beautiful React-safe HTML tag
 */
function formatParagraph(text: string, isHeader: boolean, isQuote: boolean): string {
  if (isHeader) {
    return `<h2>${text}</h2>`;
  }
  if (isQuote) {
    return `<blockquote>${text}</blockquote>`;
  }
  return `<p>${text}</p>`;
}

/**
 * Merges HTML string segments together perfectly
 */
function assemblePageHTML(paragraphs: string[]): string {
  return `<div class="story-page-content text-inherit select-none transition-all duration-300">${paragraphs.join('')}</div>`;
}

/**
 * Splits standard paragraph by Romanian sentence boundaries.
 */
function splitIntoSentences(text: string): string[] {
  // Splitting pattern capturing common sentence endings: (.), (?), (!)
  const regex = /[^.!?]+[.!?]+(\s|$)/g;
  const matches = text.match(regex);
  if (matches) {
    return matches.map(m => m.trim());
  }
  return [text];
}
