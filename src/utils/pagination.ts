import { StyleSettings } from '../types';

export function paginateChapterContent(
  content: string,
  settings: StyleSettings,
  isMobile: boolean,
  containerHeight?: number
): string[] {
  const paragraphs = parseContent(content);
  if (paragraphs.length === 0) return [emptyPage()];

  // DOM-based: accurate, accounts for real font size + line height
  if (containerHeight && containerHeight > 80 && typeof document !== 'undefined') {
    return domPaginate(paragraphs, settings, containerHeight);
  }

  // Fallback when DOM not ready yet
  return wordCountPaginate(paragraphs, settings, isMobile);
}

// ─── Parse HTML/text content into individual paragraph strings ──────────────

function parseContent(content: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const result: string[] = [];

  const nodes = doc.querySelectorAll('p, blockquote, li, h1, h2, h3, h4');
  if (nodes.length > 0) {
    nodes.forEach(node => {
      const text = node.textContent?.trim();
      if (!text) return;
      const tag = node.tagName.toLowerCase();
      if (tag.startsWith('h')) {
        result.push(`<h2>${text}</h2>`);
      } else if (tag === 'blockquote') {
        result.push(`<blockquote>${text}</blockquote>`);
      } else {
        result.push(`<p>${text}</p>`);
      }
    });
  } else {
    const raw = doc.body?.textContent || content;
    raw.split(/\n\s*\n/).forEach(block => {
      const text = block.trim().replace(/\s+/g, ' ');
      if (text) result.push(`<p>${text}</p>`);
    });
  }

  return result;
}

// ─── DOM-based pagination: inserts paragraphs until overflow detected ────────

function domPaginate(
  paragraphs: string[],
  settings: StyleSettings,
  containerHeight: number
): string[] {
  const probe = document.createElement('div');
  probe.style.cssText = [
    'position:fixed',
    'top:-99999px',
    'left:-99999px',
    'width:500px',
    `height:${containerHeight}px`,
    'overflow:hidden',
    `font-size:${settings.fontSize}px`,
    `line-height:${settings.lineHeight}`,
    'visibility:hidden',
    'pointer-events:none',
    'box-sizing:border-box',
    'word-break:break-word',
    'overflow-wrap:break-word',
  ].join(';');
  document.body.appendChild(probe);

  const pages: string[] = [];
  let current: string[] = [];

  for (const para of paragraphs) {
    current.push(para);
    probe.innerHTML = current.join('');

    if (probe.scrollHeight > containerHeight) {
      if (current.length === 1) {
        // Single paragraph already overflows — still add it as its own page
        pages.push(current.join(''));
        current = [];
      } else {
        // Last paragraph caused overflow — commit without it, restart with it
        current.pop();
        pages.push(current.join(''));
        current = [para];

        // Re-check: does this lone paragraph also overflow?
        probe.innerHTML = para;
        if (probe.scrollHeight > containerHeight) {
          // Split into sentences and paginate those
          const sentencePages = splitLongParagraph(para, probe, containerHeight);
          const last = sentencePages.pop();
          sentencePages.forEach(sp => pages.push(sp));
          current = last ? [last] : [];
        }
      }
    }
  }

  if (current.length > 0) pages.push(current.join(''));
  document.body.removeChild(probe);
  return pages.length > 0 ? pages : [emptyPage()];
}

// Splits a single overflowing paragraph by sentences until it fits
function splitLongParagraph(
  para: string,
  probe: HTMLDivElement,
  maxHeight: number
): string[] {
  const text = para.replace(/<[^>]+>/g, '');
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
  const pages: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const test = current + sentence;
    probe.innerHTML = `<p>${test}</p>`;
    if (probe.scrollHeight > maxHeight && current.length > 0) {
      pages.push(`<p>${current.trim()}</p>`);
      current = sentence;
    } else {
      current = test;
    }
  }

  if (current.trim()) pages.push(`<p>${current.trim()}</p>`);
  return pages.length > 0 ? pages : [`<p>${text}</p>`];
}

// ─── Word-count fallback (used before DOM dimensions are known) ──────────────

function wordCountPaginate(
  paragraphs: string[],
  settings: StyleSettings,
  isMobile: boolean
): string[] {
  const base = isMobile ? 120 : (settings.twoPageSpread ? 190 : 210);
  const fontScale = Math.pow(18 / settings.fontSize, 1.4);
  const lineScale = 1.6 / settings.lineHeight;
  const limit = Math.max(50, Math.floor(base * fontScale * lineScale));

  const pages: string[] = [];
  let current: string[] = [];
  let wordCount = 0;

  for (const para of paragraphs) {
    const words = para.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    if (wordCount + words > limit && current.length > 0) {
      pages.push(current.join(''));
      current = [para];
      wordCount = words;
    } else {
      current.push(para);
      wordCount += words;
    }
  }

  if (current.length > 0) pages.push(current.join(''));
  return pages.length > 0 ? pages : [emptyPage()];
}

function emptyPage(): string {
  return '<p style="opacity:0.35;text-align:center;padding-top:35%;font-style:italic">Pagina goală</p>';
}
