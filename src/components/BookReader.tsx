import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Book, StyleSettings, PageData } from '../types';
import { paginateChapterContent } from '../utils/pagination';
import { playPageTurnSound } from '../utils/audio';
import { updateBookProgress, updateBookBookmarks, saveBookToDB } from '../utils/db';
import { useTranslation, LANGUAGES, LanguageCode } from '../utils/localization';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  Volume2,
  VolumeX,
  Menu,
  Bookmark,
  Sparkles,
  Columns,
  Eye,
  Minimize2,
  Trash2,
  Search
} from 'lucide-react';

interface BookmarksListProps {
  bookmarks: import('../types').Bookmark[];
  currentChapterIndex: number;
  currentPageIndex: number;
  onNavigate: (chapterIndex: number, pageIndex: number) => void;
  onDelete: (id: string) => void;
  noBookmarksTitle: string;
  noBookmarksTip: string;
}

const BookmarksList: React.FC<BookmarksListProps> = ({
  bookmarks, currentChapterIndex, currentPageIndex,
  onNavigate, onDelete, noBookmarksTitle, noBookmarksTip
}) => {
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-16 px-6 space-y-3">
        <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E3DDD3] flex items-center justify-center text-[#8A8178] mx-auto">
          <Bookmark className="w-5 h-5" />
        </div>
        <p className="text-xs text-[#2D2A26] font-bold">{noBookmarksTitle}</p>
        <p className="text-[11px] text-[#8A8178] leading-relaxed font-light">{noBookmarksTip}</p>
      </div>
    );
  }
  return (
    <>
      {bookmarks.map((bookmark) => {
        const isCurrent = bookmark.chapterIndex === currentChapterIndex && bookmark.pageIndex === currentPageIndex;
        return (
          <div
            key={bookmark.id}
            className={`p-3.5 rounded-xl border transition flex gap-3 items-start relative hover:shadow-xs group ${
              isCurrent
                ? 'border-[#5A5A40] bg-[#5A5A40]/5 ring-2 ring-[#5A5A40]/5'
                : 'border-[#E3DDD3] bg-[#FAF8F5]/10 hover:border-[#D8D2C6]'
            }`}
          >
            <button
              onClick={() => onNavigate(bookmark.chapterIndex, bookmark.pageIndex)}
              className="flex-1 text-left min-w-0"
              title="Navighează la această pagină"
            >
              <div className="flex items-center gap-1 mb-1 text-[10px] font-bold text-[#5A5A40] font-mono">
                <Bookmark className="w-3 h-3 fill-[#5A5A40]" />
                <span>CAP. {bookmark.chapterIndex + 1} • PAGINA {bookmark.pageIndex + 1}</span>
              </div>
              <p className="text-xs text-[#2D2A26] font-serif italic line-clamp-2 border-l-2 border-[#E3DDD3] pl-2 py-0.5 my-1.5 bg-[#FAF8F5]/30">
                {`„${bookmark.previewText}"`}
              </p>
              <span className="text-[9px] text-[#8A8178] font-mono">Salvat la: {bookmark.dateAdded}</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(bookmark.id); }}
              className="p-1 rounded-lg hover:bg-red-50 text-[#8A8178] hover:text-red-600 border border-transparent hover:border-red-100 transition self-start flex-shrink-0"
              title="Șterge marcajul"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </>
  );
};

interface BookReaderProps {
  book: Book;
  onClose: () => void;
  onProgressUpdate: () => void;
}

export const BookReader: React.FC<BookReaderProps> = ({ book, onClose, onProgressUpdate }) => {
  const { t, currentLanguage } = useTranslation();

  // Mobile / Width auto-sensing
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  const [readingLanguage, setReadingLanguage] = useState<string>('original');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationErrorText, setTranslationErrorText] = useState<string>('');

  // Reader Settings State
  const [settings, setSettings] = useState<StyleSettings>({
    fontFamily: 'serif-merriweather',
    fontSize: 18,
    lineHeight: 1.6,
    theme: 'parchment',
    twoPageSpread: window.innerWidth >= 768
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showChapters, setShowChapters] = useState<boolean>(false);
  const [sidebarTab, setSidebarTab] = useState<'chapters' | 'bookmarks' | 'search'>('chapters');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Navigation State
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(
    book.progress?.chapterIndex ?? 0
  );
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(
    book.progress?.pageIndex ?? 0
  );

  // Active paginated chapter details
  const [paginatedPages, setPaginatedPages] = useState<string[]>([]);

  // Measured page content dimensions for accurate DOM-based pagination
  const [pageContentSize, setPageContentSize] = useState<{ w: number; h: number } | null>(null);
  const pageContentRef = useRef<HTMLDivElement>(null);

  // Observe page content area resize to re-paginate on window resize
  useEffect(() => {
    const el = pageContentRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.height > 80 && rect.width > 100) {
        setPageContentSize({ w: Math.floor(rect.width), h: Math.floor(rect.height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Custom 3D Animation states
  const [isTurning, setIsTurning] = useState<boolean>(false);
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null);
  
  // We keep track of the text we're flipping so that the visual transition shows exactly what was on the page
  const [oldPageLeftContent, setOldPageLeftContent] = useState<string>('');
  const [oldPageRightContent, setOldPageRightContent] = useState<string>('');
  const [turningPageFrontContent, setTurningPageFrontContent] = useState<string>('');
  const [turningPageBackContent, setTurningPageBackContent] = useState<string>('');

  // Get active reading text: original or translated
  const getActiveChapterContent = () => {
    const chapter = book.chapters?.[currentChapterIndex];
    if (!chapter) return { title: '', content: '' };

    if (readingLanguage !== 'original' && chapter.translations?.[readingLanguage]) {
      return {
        title: chapter.translations[readingLanguage].title,
        content: chapter.translations[readingLanguage].content
      };
    }

    return {
      title: chapter.title,
      content: chapter.content
    };
  };

  const handleTranslateChapter = async (targetLangCode: string) => {
    const chapter = book.chapters?.[currentChapterIndex];
    if (!chapter) return;

    setIsTranslating(true);
    setTranslationErrorText('');

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: chapter.title,
          content: chapter.content,
          targetLanguage: targetLangCode
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Translation request failed');
      }

      const data = await response.json();
      
      if (!chapter.translations) {
        chapter.translations = {};
      }
      chapter.translations[targetLangCode] = {
        title: data.translatedTitle,
        content: data.translatedContent
      };

      await saveBookToDB(book);
      setReadingLanguage(targetLangCode);
      onProgressUpdate();
    } catch (err: any) {
      console.error('Translation failed:', err);
      setTranslationErrorText(err?.message || 'Eroare de traducere. Reîncercați.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, currentChapterIndex, isTurning, paginatedPages.length]);

  // Swipe Gestures
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Resize Listener
  useEffect(() => {
    const handleResize = () => {
      const mobileStatus = window.innerWidth < 768;
      setIsMobile(mobileStatus);
      setSettings(prev => ({
        ...prev,
        twoPageSpread: !mobileStatus // Auto-spread on tablet/desktop, single on mobile
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Recalculate pages when content, styles, or measured container size changes
  useEffect(() => {
    if (book.chapters && book.chapters[currentChapterIndex]) {
      const activeContent = getActiveChapterContent();
      const pages = paginateChapterContent(
        activeContent.content,
        settings,
        isMobile,
        pageContentSize ?? undefined
      );
      setPaginatedPages(pages);

      if (currentPageIndex >= pages.length) {
        setCurrentPageIndex(Math.max(0, pages.length - 1));
      }
    }
  }, [book, currentChapterIndex, readingLanguage, settings, isMobile, pageContentSize]);

  // Push reading progression back to indexedDB
  useEffect(() => {
    updateBookProgress(book.id, currentChapterIndex, currentPageIndex).then(() => {
      onProgressUpdate();
    });
  }, [book.id, currentChapterIndex, currentPageIndex]);

  // Color mapping based on ReaderTheme
  const getThemeColors = () => {
    switch (settings.theme) {
      case 'warm-paper': // Sepia Style
        return {
          bg: '#FAF0E6',
          text: '#4A443F',
          border: '#D8D2C6',
          accent: '#5A5A40',
          pageShadow: 'shadow-[inset_0_0_40px_rgba(90,90,64,0.04)]'
        };
      case 'slate-dark': // Night Style
        return {
          bg: '#2D2A26',
          text: '#F5F2ED',
          border: '#4A443F',
          accent: '#A69E93',
          pageShadow: 'shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]'
        };
      case 'midnight-velvet': // Forest Sage Olive Style
        return {
          bg: '#5A5A40',
          text: '#F5F2ED',
          border: '#484833',
          accent: '#D8D2C6',
          pageShadow: 'shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]'
        };
      case 'classic-white': // Pure Bone Style
        return {
          bg: '#FBF9F6',
          text: '#2D2A26',
          border: '#E3DDD3',
          accent: '#5A5A40',
          pageShadow: 'shadow-[inset_0_0_45px_rgba(0,0,0,0.01)]'
        };
      case 'parchment': // Ivory Style (Default)
      default:
        return {
          bg: '#F9F4E8',
          text: '#2D2A26',
          border: '#E3DDD3',
          accent: '#5A5A40',
          pageShadow: 'shadow-[inset_0_0_40px_rgba(90,90,64,0.03)]'
        };
    }
  };

  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'serif-playfair':
        return 'font-serif-playfair';
      case 'sans-inter':
        return 'font-sans-inter';
      case 'sans-grotesk':
        return 'font-sans-grotesk';
      case 'mono-jetbrains':
        return 'font-mono-jetbrains';
      case 'serif-merriweather':
      default:
        return 'font-serif-merriweather';
    }
  };

  const colors = getThemeColors();

  // Navigation Logic with 3D Page flip trigger
  const handleNextPage = () => {
    if (isTurning) return;

    // Dual spread pagination skips 2 pages at once
    const step = settings.twoPageSpread ? 2 : 1;
    const nextPageIndex = currentPageIndex + step;

    // Trigger audio rustle
    if (soundEnabled) playPageTurnSound();

    if (nextPageIndex < paginatedPages.length) {
      // Configure 3D Flip overlay content
      setOldPageLeftContent(paginatedPages[currentPageIndex] || '');
      setOldPageRightContent(paginatedPages[currentPageIndex + 1] || '');
      setTurningPageFrontContent(paginatedPages[currentPageIndex + (settings.twoPageSpread ? 1 : 0)] || '');
      setTurningPageBackContent(paginatedPages[nextPageIndex] || '');

      setTurnDirection('next');
      setIsTurning(true);

      setTimeout(() => {
        setCurrentPageIndex(nextPageIndex);
        setIsTurning(false);
        setTurnDirection(null);
      }, 700); // matching 3D flip animation delay duration
    } else {
      // Try to jump to next chapter if exists
      if (currentChapterIndex + 1 < book.chapters.length) {
        setTurnDirection('next');
        setIsTurning(true);
        if (soundEnabled) playPageTurnSound();

        setTimeout(() => {
          setCurrentChapterIndex(prev => prev + 1);
          setCurrentPageIndex(0);
          setIsTurning(false);
          setTurnDirection(null);
        }, 700);
      }
    }
  };

  const handlePrevPage = () => {
    if (isTurning || (currentPageIndex === 0 && currentChapterIndex === 0)) return;

    // Dual spread skips 2 pages
    const step = settings.twoPageSpread ? 2 : 1;
    const prevPageIndex = currentPageIndex - step;

    if (soundEnabled) playPageTurnSound();

    if (prevPageIndex >= 0) {
      // 3D Flip animation
      setOldPageLeftContent(paginatedPages[currentPageIndex] || '');
      setOldPageRightContent(paginatedPages[currentPageIndex + 1] || '');
      setTurningPageFrontContent(paginatedPages[prevPageIndex + (settings.twoPageSpread ? 1 : 0)] || '');
      setTurningPageBackContent(paginatedPages[currentPageIndex] || '');

      setTurnDirection('prev');
      setIsTurning(true);

      setTimeout(() => {
        setCurrentPageIndex(prevPageIndex);
        setIsTurning(false);
        setTurnDirection(null);
      }, 700);
    } else {
      // Try to leap back to previous chapter's last page
      if (currentChapterIndex > 0) {
        const prevChIndex = currentChapterIndex - 1;
        const prevChContent = book.chapters[prevChIndex].content;
        const tempPages = paginateChapterContent(prevChContent, settings, isMobile);
        
        // Target last page index
        // In double spread, last index needs to be even
        let targetIndex = tempPages.length - 1;
        if (settings.twoPageSpread && targetIndex % 2 !== 0) {
          targetIndex = Math.max(0, targetIndex - 1);
        }

        setTurnDirection('prev');
        setIsTurning(true);

        setTimeout(() => {
          setCurrentChapterIndex(prevChIndex);
          setCurrentPageIndex(targetIndex);
          setIsTurning(false);
          setTurnDirection(null);
        }, 700);
      }
    }
  };

  // Swipe Gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touch = e.changedTouches[0];
    const diff = touch.clientX - touchStartX;

    // Minimum 50px delta swipe to navigate
    if (diff > 50) {
      handlePrevPage(); // Swiped left -> right = go back
    } else if (diff < -50) {
      handleNextPage(); // Swiped right -> left = go forward
    }
    setTouchStartX(null);
  };

  // Bookmark Helpers and Handlers
  const currentBookmarkId = `${book.id}-${currentChapterIndex}-${currentPageIndex}`;
  const isPageBookmarked = (book.bookmarks || []).some(bm => bm.id === currentBookmarkId);

  const handleToggleBookmark = async () => {
    const existingBookmarks = book.bookmarks || [];
    let updatedBookmarks;
    if (isPageBookmarked) {
      updatedBookmarks = existingBookmarks.filter(bm => bm.id !== currentBookmarkId);
    } else {
      const pageText = paginatedPages[currentPageIndex] || '';
      // Clean HTML tags and compress spacing
      const cleanText = pageText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const preview = cleanText.length > 100 ? cleanText.substring(0, 100) + '...' : cleanText || 'Pagină goală...';

      const newBookmark = {
        id: currentBookmarkId,
        chapterIndex: currentChapterIndex,
        pageIndex: currentPageIndex,
        chapterTitle: currentChapterTitle,
        previewText: preview,
        dateAdded: new Date().toLocaleDateString('ro-RO', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      updatedBookmarks = [...existingBookmarks, newBookmark];
    }

    await updateBookBookmarks(book.id, updatedBookmarks);
    onProgressUpdate();
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    const existingBookmarks = book.bookmarks || [];
    const updated = existingBookmarks.filter(bm => bm.id !== bookmarkId);
    await updateBookBookmarks(book.id, updated);
    onProgressUpdate();
  };

  // --- Search and Highlight System ---

  // Regex-based HTML text highlighter that preserves HTML structure/tags.
  const highlightHTML = (html: string, query: string): string => {
    if (!query || !query.trim()) return html;
    const escapedQuery = query.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    try {
      const parts = html.split(/(<[^>]+>)/g);
      return parts.map(part => {
        if (part.startsWith('<')) {
          return part; 
        }
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return part.replace(regex, '<mark class="bg-amber-300 text-[#2D2A26] px-1 rounded shadow-xs font-semibold">$1</mark>');
      }).join('');
    } catch (e) {
      return html;
    }
  };

  interface SearchResult {
    chapterIndex: number;
    chapterTitle: string;
    previewBefore: string;
    matchText: string;
    previewAfter: string;
  }

  const getSearchResults = (): SearchResult[] => {
    if (!searchQuery || searchQuery.trim().length < 2) return [];
    const query = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    book.chapters.forEach((chapter, chIdx) => {
      const plainText = chapter.content.replace(/<[^>]*>/g, ' ');
      let index = plainText.toLowerCase().indexOf(query);
      let matchCount = 0;
      
      while (index !== -1 && matchCount < 40) {
        const start = Math.max(0, index - 40);
        const end = Math.min(plainText.length, index + query.length + 50);
        
        const previewBefore = (start > 0 ? '...' : '') + plainText.substring(start, index);
        const matchText = plainText.substring(index, index + query.length);
        const previewAfter = plainText.substring(index + query.length, end) + (end < plainText.length ? '...' : '');

        results.push({
          chapterIndex: chIdx,
          chapterTitle: chapter.title,
          previewBefore,
          matchText,
          previewAfter
        });

        index = plainText.toLowerCase().indexOf(query, index + 1);
        matchCount++;
      }
    });

    return results;
  };

  const handleSearchResultClick = (result: SearchResult) => {
    setCurrentChapterIndex(result.chapterIndex);
    
    const targetChapterContent = book.chapters[result.chapterIndex].content;
    const pages = paginateChapterContent(targetChapterContent, settings, isMobile);
    
    let targetPageIndex = 0;
    for (let i = 0; i < pages.length; i++) {
      const plainPageText = pages[i].replace(/<[^>]*>/g, ' ').toLowerCase();
      const cleanSearchStr = result.matchText.toLowerCase();
      if (plainPageText.includes(cleanSearchStr)) {
        targetPageIndex = i;
        break;
      }
    }

    if (settings.twoPageSpread && targetPageIndex % 2 !== 0) {
      targetPageIndex = Math.max(0, targetPageIndex - 1);
    }

    setCurrentPageIndex(targetPageIndex);
    if (soundEnabled) playPageTurnSound();
  };

  // Layout page components
  const pageLeftIndex = currentPageIndex;
  const pageRightIndex = currentPageIndex + 1;

  const currentChapterTitle = getActiveChapterContent().title || 'Capitol';

  return (
    <div
      id="reader-workspace"
      className="fixed inset-0 z-40 bg-[#4A443F] flex flex-col overflow-hidden select-none animate-reader-open"
    >
      {/* Tabletop background wood layout */}
      <div className="absolute inset-0 bg-wood-texture opacity-30 select-none pointer-events-none" />

      {/* Top Controls header layout */}
      <header
        id="reader-header"
        className="relative z-10 h-14 md:h-16 bg-[#FBF9F6] border-b border-[#E3DDD3] flex items-center justify-between px-3 md:px-6 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <button
            id="reader-back-library-btn"
            onClick={onClose}
            className="flex items-center gap-1 text-sm text-[#8A8178] hover:text-[#2D2A26] px-2 py-1.5 hover:bg-[#FAF8F5] rounded-xl transition duration-200 border border-transparent hover:border-[#E3DDD3]"
          >
            <ChevronLeft className="w-5 h-5 text-[#5A5A40]" />
            <span className="font-sans hidden sm:inline">{t('library')}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 border-l border-[#E3DDD3] pl-3">
            <h2 className="text-sm font-serif font-bold text-[#2D2A26] max-w-[160px] line-clamp-1">
              {book.title}
            </h2>
          </div>
        </div>

        {/* Center — chapter + page on all sizes */}
        <div className="flex flex-col items-center text-center font-mono">
          <span className="text-[11px] text-[#5A5A40] font-semibold line-clamp-1 max-w-[160px] sm:max-w-xs">{currentChapterTitle}</span>
          <span className="text-[9px] text-[#8A8178]/80 mt-0.5">
            {currentPageIndex + 1} / {paginatedPages.length}
          </span>
        </div>

        {/* Interaction control triggers */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            id="toggle-sound-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 text-[#8A8178] hover:text-[#2D2A26] hover:bg-[#FAF8F5] rounded-xl transition duration-200 border border-transparent hover:border-[#E3DDD3] cursor-pointer"
            title={soundEnabled ? 'Dezactivează sunet paginare' : 'Activează sunet paginare'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-[#5A5A40]" /> : <VolumeX className="w-5 h-5 text-[#8A8178]" />}
          </button>

          <button
            id="toggle-bookmark-btn"
            onClick={handleToggleBookmark}
            className={`p-2 rounded-xl transition duration-200 border flex items-center gap-1 text-sm ${
              isPageBookmarked 
                ? 'border-[#5A5A40]/30 text-[#5A5A40] bg-[#5A5A40]/10 font-bold' 
                : 'border-transparent text-[#8A8178] hover:text-[#2D2A26] hover:bg-[#FAF8F5]'
            }`}
            title={isPageBookmarked ? t('marked') : t('markPage')}
          >
            <Bookmark className={`w-5 h-5 ${isPageBookmarked ? 'fill-[#5A5A40]' : ''}`} />
            <span className="hidden lg:inline font-sans">{isPageBookmarked ? t('marked') : t('markPage')}</span>
          </button>

          <button
            id="menu-chapters-btn"
            onClick={() => { setShowChapters(true); setShowSettings(false); setSidebarTab('chapters'); }}
            className={`p-2 rounded-xl transition duration-200 flex items-center gap-1 text-sm ${
              showChapters && sidebarTab === 'chapters' ? 'bg-[#5A5A40] text-[#F5F2ED] font-bold' : 'text-[#8A8178] hover:text-[#2D2A26] hover:bg-[#FAF8F5]'
            }`}
            title={t('chapters')}
          >
            <Menu className="w-5 h-5" />
            <span className="hidden lg:inline font-sans font-medium">{t('chapters')}</span>
          </button>

          <button
            id="menu-search-btn"
            onClick={() => {
              setShowChapters(true);
              setShowSettings(false);
              setSidebarTab('search');
              setTimeout(() => {
                document.getElementById('sidebar-search-input')?.focus();
              }, 100);
            }}
            className={`hidden sm:flex p-2 rounded-xl transition duration-200 items-center gap-1 text-sm ${
              showChapters && sidebarTab === 'search' ? 'bg-[#5A5A40] text-[#F5F2ED] font-bold' : 'text-[#8A8178] hover:text-[#2D2A26] hover:bg-[#FAF8F5]'
            }`}
            title="Caută cuvinte cheie"
          >
            <Search className="w-5 h-5" />
            <span className="hidden lg:inline font-sans font-medium">Caută</span>
          </button>

          <button
            id="menu-settings-btn"
            onClick={() => { setShowSettings(true); setShowChapters(false); }}
            className={`p-2 rounded-xl transition duration-200 flex items-center gap-1 text-sm ${
              showSettings ? 'border border-[#5A5A40]/30 text-[#5A5A40] bg-[#5A5A40]/10' : 'text-[#8A8178] hover:text-[#2D2A26] hover:bg-[#FAF8F5]'
            }`}
            title={t('adjustSettings')}
          >
            <Settings className="w-5 h-5" />
            <span className="hidden lg:inline font-sans">{t('adjustSettings')}</span>
          </button>
        </div>
      </header>

      {/* Primary 3D Virtual Book Lounge Area */}
      <main
        id="reader-lounge"
        className="relative flex-grow min-h-0 flex items-center justify-center p-2 sm:p-4 md:p-8 overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Hotspots */}
        <button
          id="lounge-nav-prev"
          onClick={handlePrevPage}
          disabled={currentPageIndex === 0 && currentChapterIndex === 0}
          className="absolute left-4 z-20 p-3 bg-black/30 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-black/50 rounded-full opacity-40 hover:opacity-100 disabled:opacity-0 disabled:pointer-events-none transition-all duration-200 shadow-xl cursor-pointer"
          title="Pagina anterioară (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          id="lounge-nav-next"
          onClick={handleNextPage}
          disabled={currentPageIndex + (settings.twoPageSpread ? 2 : 1) >= paginatedPages.length && currentChapterIndex + 1 >= book.chapters.length}
          className="absolute right-4 z-20 p-3 bg-black/30 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-black/50 rounded-full opacity-40 hover:opacity-100 disabled:opacity-0 disabled:pointer-events-none transition-all duration-200 shadow-xl cursor-pointer"
          title="Pagina următoare (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* 3D Realistic Open Book Shell */}
        <div
          id="interactive-3d-book"
          className="relative rounded-2xl transition-all duration-500 book-cover-depth flex p-1 preserve-3d perspective-1500"
          style={settings.twoPageSpread ? {
            backgroundColor: book.coverColor,
            width: '100%',
            maxWidth: '1120px',
            aspectRatio: '1.45/1',
          } : isMobile ? {
            backgroundColor: book.coverColor,
            width: '100%',
            maxWidth: '520px',
            height: 'calc(100dvh - 130px)',
            maxHeight: '100%',
          } : {
            backgroundColor: book.coverColor,
            width: '100%',
            maxWidth: '520px',
            maxHeight: '100%',
            aspectRatio: '1/1.45',
          }}
        >
          {/* Subtle Outer Bound Cover Border Decor */}
          <div className="absolute inset-1 border border-white/5 rounded-xl pointer-events-none" />

          {/* Spine Crease Binder element (visible if twoPageSpread is true) */}
          {settings.twoPageSpread && (
            <div className="absolute left-1/2 top-1 bottom-1 w-8 -translate-x-1/2 z-20 book-spine-gradient pointer-events-none" />
          )}

          {/* Dynamic stack of underneath papers to give depth thickness */}
          <div className="absolute right-1 bottom-1 w-[99%] h-[99%] bg-white/20 -z-10 rounded-xl" />
          <div className="absolute right-2 bottom-2 w-[98%] h-[98%] bg-white/10 -z-20 rounded-xl" />

          {/* ==================== DOUBLE SPLIT TABLET SPREAD VIEW ==================== */}
          {settings.twoPageSpread ? (
            <div className="flex w-full h-full relative overflow-visible rounded-xl overflow-hidden pointer-events-auto">
              
              {/* ====== LEFT PAGE ====== */}
              <div 
                id="page-left"
                className="w-1/2 h-full p-8 md:p-12 pr-12 md:pr-14 relative flex flex-col justify-between overflow-hidden select-none cursor-pointer page-corner-peel-hover"
                style={{ backgroundColor: colors.bg, color: colors.text }}
                onClick={handlePrevPage}
              >
                {/* Visual Bookmark ribbon dropping from the top */}
                {isPageBookmarked && (
                  <div className="absolute top-0 right-10 w-4.5 h-20 bg-[#A13D2D] shadow-md z-20 rounded-b animate-roll-down origin-top pointer-events-none flex items-end">
                    <div className="w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[6px]" style={{ borderBottomColor: colors.bg }} />
                  </div>
                )}

                {/* Gold foil header decoration */}
                <div className="flex justify-between items-center text-[11px] uppercase tracking-wider opacity-45 border-b pb-2 relative z-10" style={{ borderColor: `${colors.border}80` }}>
                  <span>{book.title}</span>
                  <button
                    id="page-left-bookmark-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBookmark();
                    }}
                    className="p-1 -m-1 hover:bg-[#FAF8F5]/40 rounded-md transition duration-150 flex items-center justify-centerpx-1"
                    title={isPageBookmarked ? "Elimină marcaj" : "Adaugă marcaj"}
                  >
                    <Bookmark 
                      className={`w-3.5 h-3.5 transition-all ${isPageBookmarked ? 'fill-[#5A5A40] text-[#5A5A40] scale-110' : ''}`} 
                      style={{ color: isPageBookmarked ? undefined : colors.accent }} 
                    />
                  </button>
                </div>

                {/* Left Page content body — ref measures available height for DOM pagination */}
                <div
                  ref={pageContentRef}
                  className={`flex-grow mt-6 overflow-hidden select-none page-text-content ${getFontFamilyClass()}`}
                  style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight }}
                  dangerouslySetInnerHTML={{ __html: highlightHTML(paginatedPages[pageLeftIndex] || '', searchQuery) || '<div class="h-full flex items-center justify-center italic text-neutral-400">Sfârșitul cărții.</div>' }}
                />

                {/* Footer and page indexes */}
                <div className="flex justify-between items-center font-mono text-[10px] opacity-45 border-t pt-3" style={{ borderColor: `${colors.border}80` }}>
                  <span>{currentChapterTitle}</span>
                  <span>Pagina {pageLeftIndex + 1}</span>
                </div>

                {/* Inner binding layout shadow overlay */}
                <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-black/15 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-paper-texture mix-blend-overlay opacity-50 pointer-events-none" />
                <div className={`absolute inset-0 ${colors.pageShadow} pointer-events-none`} />

                {/* Interactive Bending Corner Peel cue on hover of left bottom edge */}
                <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none overflow-hidden z-10">
                  <div className="absolute bottom-[2px] left-[2px] w-7 h-7 bg-white/70 backdrop-blur-xs rounded-tr-lg border-t border-r border-black/10 transition-transform page-corner-peel-left origin-bottom-left" />
                </div>
              </div>

              {/* ====== RIGHT PAGE ====== */}
              <div 
                id="page-right"
                className="w-1/2 h-full p-8 md:p-12 pl-12 md:pl-14 relative flex flex-col justify-between overflow-hidden select-none cursor-pointer page-corner-peel-hover"
                style={{ backgroundColor: colors.bg, color: colors.text }}
                onClick={handleNextPage}
              >
                {/* Gold foil header decoration */}
                <div className="flex justify-between items-center text-[11px] uppercase tracking-wider opacity-45 border-b pb-2" style={{ borderColor: `${colors.border}80` }}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500/50" />
                  <span>{book.author}</span>
                </div>

                {/* Right Page content body */}
                <div 
                  className={`flex-grow mt-6 overflow-hidden select-none page-text-content ${getFontFamilyClass()}`}
                  style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight }}
                  dangerouslySetInnerHTML={{ __html: highlightHTML(paginatedPages[pageRightIndex] || '', searchQuery) || '<div class="h-full flex items-center justify-center italic text-neutral-400">Sfârșitul capitolului.</div>' }}
                />

                {/* Footer and page indexes */}
                <div className="flex justify-between items-center font-mono text-[10px] opacity-45 border-t pt-3" style={{ borderColor: `${colors.border}80` }}>
                  <span>Pagina {pageRightIndex + 1}</span>
                  <span>Cap. {currentChapterIndex + 1}</span>
                </div>

                {/* Inner binding layout shadow overlay */}
                <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-black/15 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-paper-texture mix-blend-overlay opacity-50 pointer-events-none" />
                <div className={`absolute inset-0 ${colors.pageShadow} pointer-events-none`} />

                {/* Interactive Bending Corner Peel cue on hover of right bottom edge */}
                <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none overflow-hidden z-10">
                  <div className="absolute bottom-[2px] right-[2px] w-7 h-7 bg-white/70 backdrop-blur-xs rounded-tl-lg border-t border-l border-black/10 transition-transform page-corner-peel origin-bottom-right" />
                </div>
              </div>

              {/* ====== 3D ROTATION FLIP OVERLAY ====== */}
              {isTurning && turnDirection === 'next' && (
                <div className="absolute inset-x-0 inset-y-0 flex z-30 pointer-events-none preserve-3d">
                  {/* Static Left page during turn */}
                  <div 
                    className="w-1/2 h-full opacity-60 p-8 md:p-12 pr-12 md:pr-14 relative flex flex-col justify-between overflow-hidden"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    <div className="flex-grow mt-6 min-h-0 overflow-hidden select-none page-text-content" style={{ fontSize: `${settings.fontSize}px` }} dangerouslySetInnerHTML={{ __html: oldPageLeftContent }} />
                    <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-black/25 to-transparent z-10" />
                    {/* Shadow Sweep as turning page lands */}
                    <div className="absolute inset-0 shadow-cast-next-left pointer-events-none z-20" />
                  </div>

                  {/* Static Right page displaying what we will see next */}
                  <div 
                    className="w-1/2 h-full p-8 md:p-12 pl-12 md:pl-14 relative flex flex-col justify-between overflow-hidden"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    <div className="flex-grow mt-6 min-h-0 overflow-hidden select-none page-text-content" style={{ fontSize: `${settings.fontSize}px` }} dangerouslySetInnerHTML={{ __html: paginatedPages[currentPageIndex + 3] || '<div class="italic text-neutral-400">Sfârșitul cărții.</div>' }} />
                    <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-black/25 to-transparent z-10" />
                    {/* Lift-off shadow getting smaller */}
                    <div className="absolute inset-0 shadow-cast-next-right pointer-events-none z-20" />
                  </div>

                  {/* FLIPPING BOARD (covers right side, rotates around center spine leftward) */}
                  <div 
                    className="absolute right-0 top-0 bottom-0 w-1/2 h-full origin-left preserve-3d animate-flip-next shadow-2xl"
                    style={{ 
                      animationDuration: '700ms',
                      animationTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
                      animationFillMode: 'forwards'
                    }}
                  >
                    {/* FRONT OF THE TURNING PAGE (Facing up on the right) */}
                    <div 
                      className="absolute inset-0 p-8 md:p-12 pl-12 md:pl-14 backface-hidden flex flex-col justify-between overflow-hidden"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      <div className="flex-grow mt-8 prose" style={{ fontSize: `${settings.fontSize}px` }} dangerouslySetInnerHTML={{ __html: turningPageFrontContent }} />
                      <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent z-10" />
                      <div className="absolute inset-0 bg-paper-texture mix-blend-overlay opacity-40 pointer-events-none z-20" />
                      
                      {/* Realistic Paper Crease Bend Overlay */}
                      <div className="absolute inset-0 crease-overlay-next pointer-events-none z-30" />
                    </div>

                    {/* BACK OF THE TURNING PAGE (Shows text that lands on left page, mirrored 3D) */}
                    <div 
                      className="absolute inset-0 p-8 md:p-12 pr-12 md:pr-14 backface-hidden flex flex-col justify-between overflow-hidden"
                      style={{ 
                        backgroundColor: colors.bg, 
                        color: colors.text,
                        transform: 'rotateY(180deg)' // turn face inside out
                      }}
                    >
                      <div className="flex-grow mt-8 prose" style={{ fontSize: `${settings.fontSize}px` }} dangerouslySetInnerHTML={{ __html: turningPageBackContent }} />
                      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent z-10" />
                      <div className="absolute inset-0 bg-paper-texture mix-blend-overlay opacity-40 pointer-events-none z-20" />
                      
                      {/* Reverse Crease Overlay as it folds over to the left page */}
                      <div className="absolute inset-0 crease-overlay-prev pointer-events-none z-30" />
                    </div>
                  </div>
                </div>
              )}

              {/* ====== 3D PREV FLIP OVERLAY ====== */}
              {isTurning && turnDirection === 'prev' && (
                <div className="absolute inset-x-0 inset-y-0 flex z-30 pointer-events-none preserve-3d">
                  {/* Static Left Page during turn */}
                  <div 
                    className="w-1/2 h-full p-8 md:p-12 pr-12 md:pr-14 relative flex flex-col justify-between overflow-hidden"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    <div className="flex-grow mt-6 min-h-0 overflow-hidden select-none page-text-content" style={{ fontSize: `${settings.fontSize}px` }} dangerouslySetInnerHTML={{ __html: paginatedPages[currentPageIndex - 2] || '<div class="italic text-neutral-400">Început de capitol.</div>' }} />
                    <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-black/25 to-transparent z-10" />
                    {/* Shadow Sweep as the page lifts off the left side */}
                    <div className="absolute inset-0 shadow-cast-prev-left pointer-events-none z-20" />
                  </div>

                  {/* Static Right Page during turn */}
                  <div 
                    className="w-1/2 h-full opacity-60 p-8 md:p-12 pl-12 md:pl-14 relative flex flex-col justify-between overflow-hidden"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    <div className="flex-grow mt-6 min-h-0 overflow-hidden select-none page-text-content" style={{ fontSize: `${settings.fontSize}px` }} dangerouslySetInnerHTML={{ __html: oldPageRightContent }} />
                    <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-black/25 to-transparent z-10" />
                    {/* Shadow Sweep as the turning page lands on the right side */}
                    <div className="absolute inset-0 shadow-cast-prev-right pointer-events-none z-20" />
                  </div>

                  {/* FLIPPING BOARD (covers left side, rotates around center spine rightward) */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1/2 h-full origin-right preserve-3d animate-flip-prev shadow-2xl"
                    style={{ 
                      animationDuration: '700ms',
                      animationTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
                      animationFillMode: 'forwards'
                    }}
                  >
                    {/* BACK OF THE TURNING PAGE (Facing up on the left) */}
                    <div 
                      className="absolute inset-0 p-8 md:p-12 pr-12 md:pr-14 backface-hidden flex flex-col justify-between overflow-hidden"
                      style={{ 
                        backgroundColor: colors.bg,
                        color: colors.text,
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      <div className="flex-grow mt-8 prose" style={{ fontSize: `${settings.fontSize}px` }} dangerouslySetInnerHTML={{ __html: turningPageBackContent }} />
                      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent z-10" />
                      <div className="absolute inset-0 bg-paper-texture mix-blend-overlay opacity-40 pointer-events-none z-20" />
                      
                      {/* Crease fold shadow sweeping across this page */}
                      <div className="absolute inset-0 crease-overlay-prev pointer-events-none z-30" />
                    </div>

                    {/* FRONT OF THE TURNING PAGE (Landed text on the right, mirrored 3D) */}
                    <div 
                      className="absolute inset-0 p-8 md:p-12 pl-12 md:pl-14 backface-hidden flex flex-col justify-between overflow-hidden"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      <div className="flex-grow mt-8 prose" style={{ fontSize: `${settings.fontSize}px` }} dangerouslySetInnerHTML={{ __html: turningPageFrontContent }} />
                      <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent z-10" />
                      <div className="absolute inset-0 bg-paper-texture mix-blend-overlay opacity-40 pointer-events-none z-20" />
                      
                      {/* Landing Crease Sweep overlay */}
                      <div className="absolute inset-0 crease-overlay-next pointer-events-none z-30" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* ==================== SINGLE PORTRAIT POCKET-BOOK MOBILE VIEW ==================== */
            <div className="w-full h-full relative overflow-hidden rounded-xl cursor-pointer" onClick={handleNextPage}>
              <div
                className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between"
                style={{ backgroundColor: colors.bg, color: colors.text }}
              >
                {/* Mobile visual ribbon */}
                {isPageBookmarked && (
                  <div className="absolute top-0 right-6 w-3.5 h-14 bg-[#A13D2D] shadow-sm z-20 rounded-b pointer-events-none flex items-end">
                    <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[5px]" style={{ borderBottomColor: colors.bg }} />
                  </div>
                )}

                {/* Header info */}
                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider opacity-45 border-b pb-2 relative z-10" style={{ borderColor: `${colors.border}80` }}>
                  <span>{book.title}</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <button
                      id="mobile-bookmark-toggle"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBookmark();
                      }}
                      className="p-1 -m-1 hover:bg-[#FAF8F5]/30 rounded transition"
                      title={isPageBookmarked ? "Elimină marcaj" : "Adaugă marcaj"}
                    >
                      <Bookmark 
                        className={`w-3.5 h-3.5 ${isPageBookmarked ? 'fill-[#5A5A40] text-[#5A5A40]' : ''}`} 
                        style={{ color: isPageBookmarked ? undefined : colors.accent }} 
                      />
                    </button>
                    <span>Cap. {currentChapterIndex + 1}</span>
                  </div>
                </div>

                {/* Single Page content body */}
                <div
                  ref={pageContentRef}
                  className={`flex-grow mt-6 min-h-0 overflow-hidden select-none page-text-content ${getFontFamilyClass()}`}
                  style={{ fontSize: `${Math.max(15, settings.fontSize - 1)}px`, lineHeight: settings.lineHeight }}
                  dangerouslySetInnerHTML={{ __html: highlightHTML(paginatedPages[currentPageIndex] || '', searchQuery) || '<div class="h-full flex items-center justify-center italic text-neutral-400">Sfârșitul capitolului.</div>' }}
                />

                {/* Footer metrics */}
                <div className="flex justify-between items-center font-mono text-[9px] opacity-45 border-t pt-2" style={{ borderColor: `${colors.border}80` }}>
                  <span>{currentChapterTitle}</span>
                  <span>Pagina {currentPageIndex + 1} din {paginatedPages.length}</span>
                </div>

                {/* Mobile shadow overlays and curves */}
                <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 bottom-0 w-2.5 bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-paper-texture mix-blend-overlay opacity-40 pointer-events-none" />
                <div className={`absolute inset-0 ${colors.pageShadow} pointer-events-none`} />
              </div>

              {/* Mobile Quick Tap Back Zone */}
              <div 
                id="mobile-nav-prev-tap"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevPage();
                }}
                className="absolute left-0 top-0 bottom-0 w-12 bg-transparent pointer-events-auto"
                title="Pagina precedentă"
              />
            </div>
          )}
        </div>
      </main>

      {/* Chapter navigation footer progress slider */}
      <footer
        id="reader-footer"
        className="relative z-10 h-14 bg-[#FBF9F6] border-t border-[#E3DDD3] flex items-center justify-between px-3 md:px-6 shadow-sm"
      >
        <button
          id="nav-btn-prev"
          onClick={handlePrevPage}
          disabled={currentPageIndex === 0 && currentChapterIndex === 0}
          className="flex items-center gap-1.5 text-xs text-[#8A8178] hover:text-[#2D2A26] disabled:text-[#8A8178]/30 disabled:pointer-events-none px-2 md:px-3 py-2 hover:bg-[#FAF8F5] rounded-xl transition duration-200 border border-transparent hover:border-[#E3DDD3] active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 text-[#5A5A40]" />
          <span className="hidden sm:inline">Anterioară</span>
        </button>

        {/* Progress bar — visible on all sizes */}
        <div className="flex-1 mx-3 flex items-center gap-2 max-w-xs md:max-w-sm">
          <input
            type="range"
            min={0}
            max={Math.max(1, paginatedPages.length - 1)}
            value={currentPageIndex}
            onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
            className="w-full h-1.5 bg-[#E3DDD3] rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
          />
          <span className="font-mono text-[10px] text-[#8A8178] select-none flex-shrink-0 hidden sm:inline">
            {currentPageIndex + 1}/{paginatedPages.length}
          </span>
        </div>

        <button
          id="nav-btn-next"
          onClick={handleNextPage}
          disabled={currentPageIndex + (settings.twoPageSpread ? 2 : 1) >= paginatedPages.length && currentChapterIndex + 1 >= book.chapters.length}
          className="flex items-center gap-1.5 text-xs text-[#8A8178] hover:text-[#2D2A26] disabled:text-[#8A8178]/30 disabled:pointer-events-none px-2 md:px-3 py-2 hover:bg-[#FAF8F5] rounded-xl transition duration-200 border border-transparent hover:border-[#E3DDD3] active:scale-95"
        >
          <span className="hidden sm:inline">Următoarea</span>
          <ChevronRight className="w-5 h-5 text-[#5A5A40]" />
        </button>
      </footer>

      {/* ==================== PANEL ADJUST DECOR STYLES ==================== */}
      {showSettings && (
        <div
          id="adjust-settings-flyout"
          className="fixed top-14 md:top-16 right-0 md:right-4 z-50 w-full md:w-80 max-h-[80vh] overflow-y-auto bg-white border-t md:border border-[#E3DDD3] md:rounded-2xl p-4 md:p-5 shadow-xl animate-scale-up text-[#4A443F]"
        >
          <div className="flex items-center justify-between border-b border-[#E3DDD3] pb-3 mb-4">
            <h4 className="font-serif italic font-bold text-[#2D2A26] flex items-center gap-1.5 text-sm">
              <Settings className="w-4 h-4 text-[#5A5A40]" />
              {t('settingsTitle')}
            </h4>
            <button 
              id="close-adjust-btn"
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-[#FAF8F5] rounded border border-transparent hover:border-[#E3DDD3]"
            >
              <X className="w-4 h-4 text-[#8A8178]" />
            </button>
          </div>

          <div className="space-y-4 text-xs font-sans">
            
            {/* Theme Page Custom Color Picker */}
            <div>
              <label className="block text-[11px] font-mono text-[#8A8178] mb-2 uppercase tracking-wider">{t('colorTheme')}</label>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <button
                  id="theme-btn-parchment"
                  onClick={() => setSettings(prev => ({ ...prev, theme: 'parchment' }))}
                  className={`p-2 rounded border flex flex-col gap-1.5 items-start justify-between transition-all ${
                    settings.theme === 'parchment' ? 'border-[#5A5A40] bg-[#FAF8F5] ring-2 ring-[#5A5A40]/10' : 'border-[#E3DDD3] hover:border-[#D8D2C6] bg-white'
                  }`}
                >
                  <div className="w-full h-3.5 rounded bg-[#F9F4E8] border border-[#E3DDD3]" />
                  <span className="text-[#2D2A26] font-medium">Ivory Paper</span>
                </button>
                <button
                  id="theme-btn-warm"
                  onClick={() => setSettings(prev => ({ ...prev, theme: 'warm-paper' }))}
                  className={`p-2 rounded border flex flex-col gap-1.5 items-start justify-between transition-all ${
                    settings.theme === 'warm-paper' ? 'border-[#5A5A40] bg-[#FAF8F5] ring-2 ring-[#5A5A40]/10' : 'border-[#E3DDD3] hover:border-[#D8D2C6] bg-white'
                  }`}
                >
                  <div className="w-full h-3.5 rounded bg-[#FAF0E6] border border-[#D8D2C6]" />
                  <span className="text-[#2D2A26] font-medium">Warm Sepia</span>
                </button>
                <button
                  id="theme-btn-dark"
                  onClick={() => setSettings(prev => ({ ...prev, theme: 'slate-dark' }))}
                  className={`p-2 rounded border flex flex-col gap-1.5 items-start justify-between transition-all ${
                    settings.theme === 'slate-dark' ? 'border-[#5A5A40] bg-[#FAF8F5] ring-2 ring-[#5A5A40]/10' : 'border-[#E3DDD3] hover:border-[#D8D2C6] bg-white'
                  }`}
                >
                  <div className="w-full h-3.5 rounded bg-[#2D2A26] border border-[#4A443F]" />
                  <span className="text-[#2D2A26] font-medium">Night Obsidian</span>
                </button>
                <button
                  id="theme-btn-midnight"
                  onClick={() => setSettings(prev => ({ ...prev, theme: 'midnight-velvet' }))}
                  className={`p-2 rounded border flex flex-col gap-1.5 items-start justify-between transition-all ${
                    settings.theme === 'midnight-velvet' ? 'border-[#5A5A40] bg-[#FAF8F5] ring-2 ring-[#5A5A40]/10' : 'border-[#E3DDD3] hover:border-[#D8D2C6] bg-white'
                  }`}
                >
                  <div className="w-full h-3.5 rounded bg-[#5A5A40] border border-[#484833]" />
                  <span className="text-[#2D2A26] font-medium">Forest Sage</span>
                </button>
              </div>
            </div>

            {/* AI Translation — optional, only useful with Gemini API key */}
            <div className="border border-[#E3DDD3] rounded-xl p-3 bg-[#FAF8F5]">
              <label className="block text-[11px] font-mono text-[#8A8178] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#5A5A40]" />
                {t('aiTranslationLabel')}
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={readingLanguage}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'original') {
                      setReadingLanguage('original');
                    } else {
                      const chapter = book.chapters?.[currentChapterIndex];
                      if (chapter && chapter.translations?.[val]) {
                        setReadingLanguage(val);
                      } else {
                        handleTranslateChapter(val);
                      }
                    }
                  }}
                  disabled={isTranslating}
                  className="flex-1 py-1.5 px-2 bg-white border border-[#E3DDD3] rounded text-xs font-mono text-[#4A443F] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
                >
                  <option value="original">Original</option>
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>
                {isTranslating && <span className="text-xs text-[#8A8178] animate-pulse">Se traduce...</span>}
                {translationErrorText && <span className="text-xs text-red-500">{translationErrorText}</span>}
              </div>
            </div>

            {/* Typography Selector */}
            <div>
              <label className="block text-[11px] font-mono text-[#8A8178] mb-2 uppercase tracking-wider">{t('fontFamilyLabel')}</label>
              <div className="space-y-1">
                {[
                  { value: 'serif-merriweather', label: 'Gentium Basic (Serif Clasic)' },
                  { value: 'serif-playfair', label: 'Playfair (Serif Elegant)' },
                  { value: 'sans-inter', label: 'Inter (Sans Modern)' },
                  { value: 'sans-grotesk', label: 'Space Grotesk (Progresist)' },
                  { value: 'mono-jetbrains', label: 'JetBrains (Monospaciat)' }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setSettings(prev => ({ ...prev, fontFamily: item.value as any }))}
                    className={`w-full py-2 px-3 rounded text-left flex justify-between items-center transition ${
                      settings.fontFamily === item.value 
                        ? 'bg-[#5A5A40]/10 border border-[#5A5A40]/30 text-[#5A5A40] font-bold' 
                        : 'border border-[#E3DDD3] hover:bg-[#FAF8F5] text-[#8A8178] bg-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {settings.fontFamily === item.value && <div className="w-1.5 h-1.5 rounded-full bg-[#5A5A40]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizing Layout */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-[#8A8178] mb-1.5 uppercase tracking-wider">{t('fontSizeLabel')}</label>
                <div className="flex items-center gap-1.5">
                  <button
                    id="decrease-size-btn"
                    onClick={() => setSettings(prev => ({ ...prev, fontSize: Math.max(14, prev.fontSize - 1) }))}
                    className="flex-1 py-1.5 px-2 bg-[#FAF8F5] hover:bg-[#E3DDD3] border border-[#E3DDD3] text-center text-[#2D2A26] rounded font-bold transition-all duration-150"
                  >
                    A-
                  </button>
                  <span className="font-mono text-xs text-[#2D2A26] w-8 text-center">{settings.fontSize}px</span>
                  <button
                    id="increase-size-btn"
                    onClick={() => setSettings(prev => ({ ...prev, fontSize: Math.min(26, prev.fontSize + 1) }))}
                    className="flex-1 py-1.5 px-2 bg-[#FAF8F5] hover:bg-[#E3DDD3] border border-[#E3DDD3] text-center text-[#2D2A26] rounded font-bold transition-all duration-150"
                  >
                    A+
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#8A8178] mb-1.5 uppercase tracking-wider">{t('lineSpacingLabel')}</label>
                <div className="flex items-center gap-1">
                  {[1.4, 1.6, 1.8].map(lh => (
                    <button
                      key={lh}
                      onClick={() => setSettings(prev => ({ ...prev, lineHeight: lh }))}
                      className={`flex-1 py-1.5 text-center font-mono rounded border transition-all ${
                        settings.lineHeight === lh ? 'bg-[#5A5A40] text-white border-[#5A5A40] font-bold' : 'bg-white border-[#E3DDD3] text-[#8A8178] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {lh}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pagination manual spread toggle (visible only on tablet) */}
            {!isMobile && (
              <div className="pt-2 border-t border-[#E3DDD3] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#8A8178] uppercase tracking-wider">{t('twoPageToggle')}:</span>
                <button
                  id="toggle-spread-btn"
                  onClick={() => setSettings(prev => ({ ...prev, twoPageSpread: !prev.twoPageSpread }))}
                  className={`px-3 py-1 rounded text-[10px] font-semibold flex items-center gap-1 transition ${
                    settings.twoPageSpread ? 'bg-[#5A5A40]/15 border border-[#5A5A40]/30 text-[#5A5A40]' : 'bg-[#FAF8F5] border border-[#E3DDD3] text-[#8A8178]'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>{settings.twoPageSpread ? t('statusOn') : t('statusOff')}</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ==================== SIDEBAR TABLE OF CONTENTS & BOOKMARKS ==================== */}
      {showChapters && (
        <div 
          id="chapters-modal-overlay"
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex justify-start animate-fade-in"
          onClick={() => setShowChapters(false)}
        >
          <div
            id="chapters-sidebar"
            className="w-full sm:max-w-sm bg-white h-full border-r border-[#E3DDD3] flex flex-col animate-slide-right shadow-2xl text-[#4A443F]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#E3DDD3] flex justify-between items-center bg-[#FBF9F6]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#5A5A40]" />
                <h4 className="font-serif italic font-bold text-[#2D2A26] text-base">{t('exploreBook')}</h4>
              </div>
              <button 
                id="close-chapters-btn"
                onClick={() => setShowChapters(false)}
                className="p-1 hover:bg-[#FAF8F5] text-[#8A8178] hover:text-[#2D2A26] rounded border border-transparent hover:border-[#E3DDD3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Book Meta badge */}
            <div className="p-4 mx-4 my-2 border border-[#E3DDD3] bg-[#FAF8F5] rounded-xl flex items-center gap-3 shadow-xs">
              <div className="w-10 h-13 rounded shadow-xs" style={{ backgroundColor: book.coverColor }} />
              <div>
                <h5 className="font-semibold text-xs text-[#2D2A26] line-clamp-1">{book.title}</h5>
                <p className="text-[10px] text-[#8A8178] mt-0.5 font-light">de {book.author}</p>
              </div>
            </div>

            {/* Tab navigation inside sidebar drawer */}
            <div className="flex border-b border-[#E3DDD3] px-4 text-xs font-mono bg-[#FAF9F6]">
              <button
                id="sidebar-tab-chapters"
                className={`flex-1 py-3 text-center border-b-2 font-bold transition-all ${
                  sidebarTab === 'chapters'
                    ? 'border-[#5A5A40] text-[#5A5A40]'
                    : 'border-transparent text-[#8A8178] hover:text-[#2D2A26]'
                }`}
                onClick={() => setSidebarTab('chapters')}
              >
                {t('chapters').toUpperCase()}
              </button>
              <button
                id="sidebar-tab-bookmarks"
                className={`flex-1 py-3 text-center border-b-2 font-bold transition-all relative ${
                  sidebarTab === 'bookmarks'
                    ? 'border-[#5A5A40] text-[#5A5A40]'
                    : 'border-transparent text-[#8A8178] hover:text-[#2D2A26]'
                }`}
                onClick={() => setSidebarTab('bookmarks')}
              >
                {`${t('bookmarks').toUpperCase()} (${(book.bookmarks || []).length})`}
              </button>
              <button
                id="sidebar-tab-search"
                className={`flex-1 py-3 text-center border-b-2 font-bold transition-all ${
                  sidebarTab === 'search'
                    ? 'border-[#5A5A40] text-[#5A5A40]'
                    : 'border-transparent text-[#8A8178] hover:text-[#2D2A26]'
                }`}
                onClick={() => {
                  setSidebarTab('search');
                  setTimeout(() => {
                    document.getElementById('sidebar-search-input')?.focus();
                  }, 100);
                }}
              >
                {t('search').toUpperCase()}
              </button>
            </div>

            {/* Scrollable list content */}
            <div className="flex-grow overflow-y-auto px-4 py-2 space-y-1.5 list-chapters-scroller bg-white">
              {sidebarTab === 'chapters' ? (
                book.chapters.map((chapter, idx) => {
                  const isActive = idx === currentChapterIndex;
                  return (
                    <button
                      key={chapter.id}
                      id={`chapter-link-${idx}`}
                      onClick={() => {
                        setCurrentChapterIndex(idx);
                        setCurrentPageIndex(0);
                        setShowChapters(false);
                        if (soundEnabled) playPageTurnSound();
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition flex gap-3 items-start ${
                        isActive 
                          ? 'border-[#5A5A40] bg-[#5A5A40]/10 text-[#2D2A26] font-bold ring-2 ring-[#5A5A40]/5' 
                          : 'border-[#E3DDD3] hover:border-[#D8D2C6] bg-[#FAF8F5]/30 text-[#8A8178] hover:text-[#2D2A26]'
                      }`}
                    >
                      <div className={`font-mono text-[10px] w-6 h-6 rounded flex items-center justify-center text-center mt-0.5 flex-shrink-0 font-bold ${
                        isActive ? 'bg-[#5A5A40] text-white' : 'bg-[#E3DDD3] text-[#2D2A26]'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs line-clamp-1 truncate">{chapter.title}</p>
                        <p className="text-[10px] text-[#8A8178]/80 mt-1 font-light flex items-center gap-1">
                          <Eye className="w-3 h-3 text-[#5A5A40]/60" />
                          <span>{t('jumpToChapter')}</span>
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : sidebarTab === 'bookmarks' ? (
                <BookmarksList
                  bookmarks={book.bookmarks || []}
                  currentChapterIndex={currentChapterIndex}
                  currentPageIndex={currentPageIndex}
                  onNavigate={(chapterIndex, pageIndex) => {
                    setCurrentChapterIndex(chapterIndex);
                    setCurrentPageIndex(pageIndex);
                    setShowChapters(false);
                    if (soundEnabled) playPageTurnSound();
                  }}
                  onDelete={handleDeleteBookmark}
                  noBookmarksTitle={t('noBookmarksTitle')}
                  noBookmarksTip={t('noBookmarksTip')}
                />
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="relative">
                    <input
                      id="sidebar-search-input"
                      type="text"
                      placeholder="Caută în această carte..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 bg-[#FAF8F5] border border-[#E3DDD3] rounded-xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30 text-[#2D2A26]"
                    />
                    <Search className="w-4 h-4 text-[#8A8178] absolute left-3 top-3.5" />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-2 p-1 text-[#8A8178] hover:text-[#2D2A26]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {!searchQuery.trim() ? (
                    <div className="text-center py-12 px-4 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E3DDD3] flex items-center justify-center text-[#8A8178] mx-auto">
                        <Search className="w-5 h-5 text-[#8A8178]" />
                      </div>
                      <p className="text-xs text-[#2D2A26] font-bold">Localizează expresii sau cuvinte</p>
                      <p className="text-[11px] text-[#8A8178] leading-relaxed font-light">
                        Scrie un cuvânt sau o propoziție în caseta de mai sus pentru a găsi toate fragmentele purtătoare și a le evidenția dinamic pe foile cărții.
                      </p>
                    </div>
                  ) : searchQuery.trim().length < 2 ? (
                    <p className="text-[11px] text-center text-[#8A8178] italic">Scrie minimum 2 caractere pentru a lansa căutarea...</p>
                  ) : (
                    (() => {
                      const results = getSearchResults();
                      if (results.length === 0) {
                        return (
                          <div className="text-center py-12 px-4 space-y-1">
                            <p className="text-xs text-[#2D2A26] font-bold">Niciun fragment găsit</p>
                            <p className="text-[11px] text-[#8A8178]">
                              Nicio trimitere pentru „<b>{searchQuery}</b>” în text.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          <p className="text-[10px] font-mono text-[#8A8178] border-b pb-1">
                            {results.length} REZULTATE ÎN TOATĂ CARTEA
                          </p>
                          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                            {results.map((res, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  handleSearchResultClick(res);
                                  setShowChapters(false);
                                }}
                                className="w-full text-left p-3 rounded-xl border border-[#E3DDD3] hover:border-[#5A5A40]/40 hover:bg-[#5A5A40]/10 transition flex flex-col gap-1 text-xs cursor-pointer"
                              >
                                <span className="text-[9px] font-mono text-[#5A5A40] font-bold uppercase truncate max-w-full">
                                  {res.chapterTitle} (Cap. {res.chapterIndex + 1})
                                </span>
                                <p className="text-[11px] text-[#4A443F] font-serif leading-relaxed line-clamp-2">
                                  {res.previewBefore}
                                  <mark className="bg-amber-100 font-bold px-0.5 rounded text-[#2D2A26]">
                                    {res.matchText}
                                  </mark>
                                  {res.previewAfter}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-[#FBF9F6] border-t border-[#E3DDD3] flex items-center justify-between text-[10px] text-[#8A8178] font-mono">
              <span>{t('allOptimized')}</span>
              <span className="text-[#5A5A40] font-bold">{t('appName')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS animations for high fidelity flipping */}
      <style>{`
        @keyframes flip-next {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(-180deg);
          }
        }
        @keyframes flip-prev {
          0% {
            transform: rotateY(-180deg);
          }
          100% {
            transform: rotateY(0deg);
          }
        }
        .animate-flip-next {
          transform-style: preserve-3d;
          animation-fill-mode: forwards;
          transform-origin: left;
          animation-name: flip-next;
        }
        .animate-flip-prev {
          transform-style: preserve-3d;
          animation-fill-mode: forwards;
          transform-origin: right;
          animation-name: flip-prev;
        }
        /* Page flip scaling hover cue */
        @keyframes scale-up {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 200ms ease-out forwards;
        }
        @keyframes slide-right {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        .animate-slide-right {
          animation: slide-right 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 250ms ease-out forwards;
        }
      `}</style>

      {/* Immersive AI Translation Loading Overlay */}
      {isTranslating && (
        <div id="translation-loader-overlay" className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in text-[#F5F2ED] pointer-events-auto">
          <div className="bg-[#FAF8F5] border border-[#D8D2C6] rounded-3xl p-8 max-w-sm w-full text-center space-y-5 text-[#4A443F] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40] mx-auto animate-bounce">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-serif italic font-bold text-lg text-[#2D2A26]">{t('translatingText')}</h4>
              <p className="text-xs text-[#8A8178] leading-relaxed">
                Gemini AI analizează caracterul operei literare pentru a genera o traducere care păstrează cu fidelitate stilul original, lexicul și marcajele HTML.
              </p>
            </div>

            <div className="flex justify-center items-center gap-1.5 font-mono text-[9.5px] text-[#A69E93] uppercase font-bold tracking-widest bg-white/60 py-1.5 px-3 rounded-full border">
              <span>POWERED BY GEMINI 3.5 FLASH</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
