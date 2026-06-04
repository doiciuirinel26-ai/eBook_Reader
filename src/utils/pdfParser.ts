import { Book, Chapter } from '../types';

/**
 * Dynamically injects script tags for pdfjs-dist CDN and resolves the pdfjsLib instance.
 * Loads a highly stable, compatible version of PDF.js that runs on any browser.
 */
function loadPdfScript(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      // Configure PDF worker with a matching stable version CDN path
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = () => {
      reject(new Error('Eroare la încărcarea modulului de procesare PDF. Vă rugăm să verificați conexiunea la internet.'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Client-side PDF file parser. Analyzes pages, groups text structures vertically by line, 
 * automatically splits books into comfortable chapters on regex cues, and paginates contents cleanly.
 */
export async function parsePdfFile(file: File): Promise<Book> {
  const pdfjsLib = await loadPdfScript();
  const arrayBuffer = await file.arrayBuffer();
  
  // Disable range requests and stream requests to run completely client-side in a single array buffer
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    useSystemFonts: true,
    disableFontFace: false
  });
  
  const pdf = await loadingTask.promise;
  const chapters: Chapter[] = [];
  
  let currentChapterTitle = 'Pagina de Titlu / Introducere';
  let currentChapterLines: string[] = [];
  let chapterCounter = 1;
  
  // Romanian chapter indicators: "Capitolul", "Partea", "Canto", "Scenă", "CH.", "III." etc.
  const chapterRegex = /^(capitolul|cap\.|partea|canto|actul|scena)\s+(\d+|[ivxlcdm]+)/i;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Group pdf text items by Y coordinate to accurately synthesize distinct lines
    const items = textContent.items as Array<any>;
    if (items.length === 0) continue;

    // Sort items vertically (top-to-bottom) then horizontally (left-to-right)
    const sortedItems = [...items].sort((a, b) => {
      const aY = a.transform[5];
      const bY = b.transform[5];
      if (Math.abs(aY - bY) > 4) {
        return bY - aY; // higher Y is top in PDF coordinates
      }
      return a.transform[4] - b.transform[4]; // lower X is left
    });

    const pageLines: string[] = [];
    let currentLine = '';
    let lastY = sortedItems[0]?.transform[5];

    for (const item of sortedItems) {
      const y = item.transform[5];
      // If vertical delta is significant, finalize current line and start next line
      if (Math.abs(y - lastY) > 4) {
        if (currentLine.trim()) {
          pageLines.push(currentLine.trim());
        }
        currentLine = item.str;
      } else {
        if (currentLine && !currentLine.endsWith(' ') && !item.str.startsWith(' ')) {
          currentLine += ' ' + item.str;
        } else {
          currentLine += item.str;
        }
      }
      lastY = y;
    }
    
    if (currentLine.trim()) {
      pageLines.push(currentLine.trim());
    }

    // Parse the lines we synthesized on this page
    for (const line of pageLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Detect potential new chapter headers
      const isChapterHeader = chapterRegex.test(trimmed) || 
        (trimmed.toUpperCase() === trimmed && trimmed.length > 4 && trimmed.length < 60 && trimmed.replace(/[\d\s\W]/g, '').length > 3);

      if (isChapterHeader) {
        // Push the previous chapter if it has harvested line content
        if (currentChapterLines.length > 10) {
          chapters.push({
            id: `pdf-ch-${chapterCounter++}`,
            title: currentChapterTitle,
            content: currentChapterLines
              .map(l => `<p class="my-3 text-justify leading-relaxed indent-4">${l}</p>`)
              .join('')
          });
          currentChapterLines = [];
          currentChapterTitle = trimmed;
        } else {
          // If the previous chapter had almost no text, just combine & override title
          currentChapterTitle = trimmed;
        }
      } else {
        currentChapterLines.push(trimmed);
      }
    }

    // Auto-split huge chapters (e.g., every 8-10 dense PDF pages) to maintain optimal pagination speeds
    if (currentChapterLines.length > 250) {
      chapters.push({
        id: `pdf-ch-${chapterCounter++}`,
        title: currentChapterTitle,
        content: currentChapterLines
          .map(l => `<p class="my-3 text-justify leading-relaxed indent-4">${l}</p>`)
          .join('')
      });
      currentChapterLines = [];
      currentChapterTitle = `Secțiunea ${chapterCounter} (pag. ${pageNum})`;
    }
  }

  // Finalize processing of the last remaining chapter lines
  if (currentChapterLines.length > 0 || chapters.length === 0) {
    chapters.push({
      id: `pdf-ch-${chapterCounter}`,
      title: currentChapterTitle,
      content: currentChapterLines
        .map(l => `<p class="my-3 text-justify leading-relaxed indent-4">${l}</p>`)
        .join('')
    });
  }

  // Generate a clean title based on file name
  const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  const coverColors = ['#5C2522', '#2A4325', '#1F3443', '#5E3E1A', '#4A154B', '#1E293B', '#374151'];
  const randomColor = coverColors[Math.floor(Math.random() * coverColors.length)];

  return {
    id: `pdf-${Date.now()}`,
    title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
    author: 'Autor Necunoscut',
    coverColor: randomColor,
    coverDesign: ['classic', 'geometric', 'ornate', 'minimalist'][Math.floor(Math.random() * 4)],
    chapters,
    dateAdded: new Date().toLocaleDateString('ro-RO'),
    isCustom: true
  };
}
