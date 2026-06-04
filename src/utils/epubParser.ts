import JSZip from 'jszip';
import { Book, Chapter } from '../types';

/**
 * Utility to strip HTML tags and tidy up chapter content for reading.
 * Stays safe from unclosed tags, and respects line breaks, paragraphs, and emphasis.
 */
export function cleanHtmlContent(html: string): string {
  // Parse HTML string to remove scripts, styles, etc., while retaining minimal semantic structure.
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove scripts, styles, links
  const elementsToRemove = doc.querySelectorAll('script, style, head, link, iframe, svg');
  elementsToRemove.forEach((el) => el.remove());

  // Replace images with placeholders or friendly descriptive tags
  const images = doc.querySelectorAll('img');
  images.forEach((img) => {
    const alt = img.getAttribute('alt') || 'imagine';
    const placeholder = doc.createElement('div');
    placeholder.className = 'text-xs text-center border border-dashed border-gray-400 p-2 my-2 italic';
    placeholder.textContent = `[Ilustrație: ${alt}]`;
    img.replaceWith(placeholder);
  });

  // Keep linebreaks, paragraphs, blockquotes, basic inline elements.
  // We can serialize the body back as beautiful formatted tags or convert to structured paragraphs.
  const bodyContent = doc.body ? doc.body.innerHTML : html;

  // Let's return clean markup that we can render inside the book pages
  return bodyContent.trim();
}

/**
 * Helper to identify chapters in plain text files.
 */
export function parseTxtFile(text: string, fileName: string): Book {
  const lineSeparator = '\n';
  const lines = text.split(lineSeparator);
  const chapters: Chapter[] = [];
  
  let currentChapterTitle = 'Pagina de Titlu / Introducere';
  let currentChapterLines: string[] = [];
  let chapterCounter = 1;

  // Romanian chapter indicators: "Capitolul", "Partea", "Canto", "Scenă", "CH.", "III." etc.
  const chapterRegex = /^(capitolul|cap\.|partea|canto|actul|scena)\s+(\d+|[ivxlcdm]+)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this line looks like a chapter header
    if (chapterRegex.test(line) || (line.toUpperCase() === line && line.length > 3 && line.length < 50 && lines[i - 1]?.trim() === '' && lines[i + 1]?.trim() === '')) {
      // Save prior chapter if it has text
      if (currentChapterLines.length > 0) {
        chapters.push({
          id: `chapter-${chapterCounter++}`,
          title: currentChapterTitle,
          content: currentChapterLines.map(l => `<p class="my-3 text-justify leading-relaxed indent-4">${l}</p>`).join('')
        });
        currentChapterLines = [];
      }
      currentChapterTitle = line;
    } else {
      if (line !== '') {
        currentChapterLines.push(line);
      } else if (currentChapterLines.length > 0 && currentChapterLines[currentChapterLines.length - 1] !== '') {
        // preserve paragraph boundaries with an empty placeholder
        currentChapterLines.push('');
      }
    }
  }

  // Push the final chapter
  if (currentChapterLines.length > 0 || chapters.length === 0) {
    chapters.push({
      id: `chapter-${chapterCounter}`,
      title: currentChapterTitle,
      content: currentChapterLines
        .filter(l => l !== '')
        .map(l => `<p class="my-3 text-justify leading-relaxed indent-4">${l}</p>`)
        .join('')
    });
  }

  // Clean title from fileName
  const cleanTitle = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");

  const coverColors = ['#8B4513', '#2E8B57', '#4682B4', '#800020', '#4B0082', '#1A1A1A'];
  const randomColor = coverColors[Math.floor(Math.random() * coverColors.length)];

  return {
    id: `book-${Date.now()}`,
    title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
    author: 'Autor Necunoscut',
    coverColor: randomColor,
    coverDesign: ['classic', 'minimalist', 'ornate', 'geometric'][Math.floor(Math.random() * 4)],
    chapters,
    dateAdded: new Date().toLocaleDateString('ro-RO'),
    isCustom: true
  };
}

/**
 * Full EPUB parser. Uses JSZip to extract content of standard .epub container.
 */
export async function parseEpubFile(file: File): Promise<Book> {
  const zip = new JSZip();
  let zipContent: JSZip;
  
  try {
    zipContent = await zip.loadAsync(file);
  } catch (err) {
    throw new Error('Acesta nu pare a fi un fișier ZIP/EPUB valid.');
  }

  // 1. Locate container.xml to find the rootfile (OPF file)
  const containerXmlNode = zipContent.file('META-INF/container.xml');
  if (!containerXmlNode) {
    throw new Error('Eroare EPUB: Lipsește fișierul de configurare container.xml.');
  }

  const containerContent = await containerXmlNode.async('string');
  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerContent, 'text/xml');
  const rootfilePath = containerDoc.querySelector('rootfile')?.getAttribute('full-path');
  
  if (!rootfilePath) {
    throw new Error('Eroare EPUB: Nu s-a putut găsi calea către structura cărții.');
  }

  // Get the directory containing the OPF metadata to resolve relative paths
  const opfDir = rootfilePath.includes('/') ? rootfilePath.substring(0, rootfilePath.lastIndexOf('/') + 1) : '';

  // 2. Read the OPF file
  const opfFileNode = zipContent.file(rootfilePath);
  if (!opfFileNode) {
    throw new Error(`Eroare EPUB: Nu s-a găsit fișierul de structură la calea ${rootfilePath}.`);
  }

  const opfContent = await opfFileNode.async('string');
  const opfDoc = parser.parseFromString(opfContent, 'text/xml');

  // Extract Metadata
  const title = opfDoc.querySelector('title, dc\\:title')?.textContent || file.name.replace('.epub', '');
  const author = opfDoc.querySelector('creator, dc\\:creator')?.textContent || 'Autor Anonim';
  const description = opfDoc.querySelector('description, dc\\:description')?.textContent || undefined;

  // Extract Manifest (lists all assets in EPUB and their IDs)
  const manifestItems = opfDoc.querySelectorAll('manifest > item');
  const manifestMap = new Map<string, { href: string; mediaType: string }>();
  manifestItems.forEach((item) => {
    const itemId = item.getAttribute('id');
    const href = item.getAttribute('href');
    const mediaType = item.getAttribute('media-type') || '';
    if (itemId && href) {
      // Decode URL paths inside epub files
      const decodedHref = decodeURIComponent(href);
      manifestMap.set(itemId, { href: decodedHref, mediaType });
    }
  });

  // Extract Spine (defines order of pages/chapters)
  const spineItems = opfDoc.querySelectorAll('spine > itemref');
  const spineIds: string[] = [];
  spineItems.forEach((item) => {
    const idref = item.getAttribute('idref');
    if (idref) {
      spineIds.push(idref);
    }
  });

  if (spineIds.length === 0) {
    throw new Error('Eroare EPUB: Book Spine (ordinea capitolelor) este goală.');
  }

  // 3. Read chapter files in spinal order
  const chapters: Chapter[] = [];
  let chapterIndex = 1;

  for (const spineId of spineIds) {
    const manifestItem = manifestMap.get(spineId);
    if (!manifestItem) continue;

    // Resolve exact path within zip
    const fullRelativePath = `${opfDir}${manifestItem.href}`.replace(/\/\.\.\//g, '/');
    // Normalize path (handle moving back levels)
    const normalizedPath = normalizeZipPath(fullRelativePath);
    
    const fileInZip = zipContent.file(normalizedPath);
    if (!fileInZip) {
      // Direct lookup matching raw href just in case
      const backupNode = zipContent.file(manifestItem.href) || zipContent.file(opfDir + manifestItem.href);
      if (!backupNode) continue;
    }

    const actualFileNode = fileInZip || zipContent.file(manifestItem.href) || zipContent.file(opfDir + manifestItem.href);
    if (!actualFileNode) continue;

    const rawHtml = await actualFileNode.async('string');
    
    // Parse title and body
    const chapterDoc = parser.parseFromString(rawHtml, 'text/html');
    let chapterTitle = chapterDoc.querySelector('title')?.textContent || chapterDoc.querySelector('h1, h2, h3')?.textContent || '';
    
    if (!chapterTitle || chapterTitle.trim().length === 0) {
      chapterTitle = `Capitolul ${chapterIndex}`;
    } else {
      chapterTitle = chapterTitle.trim();
    }

    const cleanHtml = cleanHtmlContent(rawHtml);
    
    // Skip empty spines
    if (cleanHtml.replace(/<[^>]*>/g, '').trim().length > 10) {
      chapters.push({
        id: `epub-ch-${spineId}-${chapterIndex}`,
        title: chapterTitle,
        content: cleanHtml
      });
      chapterIndex++;
    }
  }

  // Fallback if no clean chapters could be loaded
  if (chapters.length === 0) {
    // Attempt fallback by loading any files with .html or .xhtml ending in zip order
    const htmlFiles = Object.keys(zipContent.files).filter(path => 
      path.endsWith('.html') || path.endsWith('.xhtml') || path.endsWith('.htm')
    ).sort();

    if (htmlFiles.length > 0) {
      for (const filePath of htmlFiles) {
        const fileNode = zipContent.file(filePath);
        if (!fileNode) continue;
        const html = await fileNode.async('string');
        const cleanContent = cleanHtmlContent(html);
        if (cleanContent.trim().length > 20) {
          chapters.push({
            id: `fallback-ch-${filePath}`,
            title: `Capitolul ${chapterIndex}`,
            content: cleanContent
          });
          chapterIndex++;
        }
      }
    }
  }

  if (chapters.length === 0) {
    throw new Error('Nu s-a putut extrage text citibil din fișierul EPUB.');
  }

  const coverColors = ['#5C2522', '#2A4325', '#1F3443', '#5E3E1A', '#4A154B', '#1E293B', '#374151'];
  const randomColor = coverColors[Math.floor(Math.random() * coverColors.length)];

  return {
    id: `epub-${Date.now()}`,
    title: title.trim(),
    author: author.trim(),
    description,
    coverColor: randomColor,
    coverDesign: ['classic', 'geometric', 'ornate', 'minimalist'][Math.floor(Math.random() * 4)],
    chapters,
    dateAdded: new Date().toLocaleDateString('ro-RO'),
    isCustom: true
  };
}

/**
 * Utility to resolve relative directory paths inside unzipped structures
 */
function normalizeZipPath(path: string): string {
  const parts = path.split('/');
  const stack: string[] = [];
  for (const part of parts) {
    if (part === '.' || part === '') continue;
    if (part === '..') {
      if (stack.length > 0) stack.pop();
    } else {
      stack.push(part);
    }
  }
  return stack.join('/');
}
