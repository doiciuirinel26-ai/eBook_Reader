import React, { useState, useEffect } from 'react';
import { Book, Bookmark } from './types';
import { getLibraryBooks, saveBookToDB, deleteBookFromDB, updateBookBookmarks, updateBookProgress } from './utils/db';
import { UploadPanel } from './components/UploadPanel';
import { BookReader } from './components/BookReader';
import { AuthorStoreSuite } from './components/AuthorStoreSuite';
import { AccountPage } from './components/AccountPage';
import { useTranslation, LanguageCode } from './utils/localization';
import { 
  Upload, 
  Sparkles, 
  Library, 
  Compass, 
  HelpCircle,
  Feather,
  PenTool,
  Globe,
  User
} from 'lucide-react';

export default function App() {
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const [showLangDropdown, setShowLangDropdown] = useState<boolean>(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'library' | 'account' | 'author' | 'store'>('library');

  // Fetch all books from persistent DB on load
  const loadBooksFromStore = async () => {
    try {
      const data = await getLibraryBooks();
      setBooks(data);
    } catch (err) {
      console.error('Error loading library: ', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooksFromStore();
  }, []);

  // Keep selectedBook in sync when books collection updates
  useEffect(() => {
    if (selectedBook) {
      const updated = books.find(b => b.id === selectedBook.id);
      if (updated) {
        setSelectedBook(updated);
      }
    }
  }, [books]);

  // Handle jump to a specific bookmark of a book from the dashboard
  const handleBookmarkClick = async (bookId: string, chapterIndex: number, pageIndex: number) => {
    const targetBook = books.find(b => b.id === bookId);
    if (!targetBook) return;

    try {
      await updateBookProgress(bookId, chapterIndex, pageIndex);
      await loadBooksFromStore();
      
      const freshBook = books.find(b => b.id === bookId) || targetBook;
      // Force selectedBook update to make it open straight on the bookmarked page coordinates
      setSelectedBook({
        ...freshBook,
        progress: { chapterIndex, pageIndex }
      });
    } catch (err) {
      console.error('Failed opening bookmarked pages: ', err);
    }
  };

  // Handle deleting a bookmark from the dashboard catalog
  const handleBookmarkDelete = async (e: React.MouseEvent, bookId: string, bookmarkId: string) => {
    e.stopPropagation(); // prevent opening reader Workspace
    if (confirm(t('deleteBookmarkConfirm'))) {
      const targetBook = books.find(b => b.id === bookId);
      if (!targetBook) return;

      const updated = (targetBook.bookmarks || []).filter(bm => bm.id !== bookmarkId);
      try {
        await updateBookBookmarks(bookId, updated);
        await loadBooksFromStore();
      } catch (err) {
        console.error('Failed to shred chosen bookmark: ', err);
      }
    }
  };

  // Handle importing manual ePUB file or TXT or pasted text
  const handleImportBook = async (newBook: Book) => {
    try {
      await saveBookToDB(newBook);
      await loadBooksFromStore();
      setActiveTab('account');
    } catch (err) {
      console.error('Failed storing book: ', err);
    }
  };

  // Handle book deletion
  const handleDeleteBook = async (bookId: string) => {
    if (confirm(t('deleteBookConfirm'))) {
      try {
        await deleteBookFromDB(bookId);
        await loadBooksFromStore();
        if (selectedBook?.id === bookId) {
          setSelectedBook(null);
        }
      } catch (err) {
        console.error('Failed deleting book: ', err);
      }
    }
  };

  // Fast statistics for homepage teaser only
  const inProgressBooks = books.filter(b => b.progress).length;
  const totalBookmarks = books.reduce((sum, b) => sum + (b.bookmarks?.length || 0), 0);

  return (
    <div id="application-container" className="min-h-screen bg-[#F5F2ED] text-[#4A443F] flex flex-col font-sans selection:bg-[#5A5A40] selection:text-[#F5F2ED] overflow-x-hidden">
      
      {/* Immersive Outer background glow accents */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#5A5A40]/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#8A8178]/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Main navigation header header block */}
      <header id="main-navigation-header" className="relative z-50 border-b border-[#E3DDD3] bg-[#FBF9F6] px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center shadow-md">
            <Feather className="w-5.5 h-5.5 text-[#F5F2ED] stroke-[2]" />
          </div>
          <div className="cursor-pointer" onClick={() => { setActiveTab('library'); setSelectedBook(null); }}>
            <h1 className="font-serif italic font-bold text-base sm:text-lg md:text-xl tracking-tight leading-tight text-[#2D2A26]">
              {t('appBrandName')}
            </h1>
            <p className="hidden sm:block text-[10px] text-[#8A8178] uppercase tracking-widest font-mono">
              {t('appTagline')}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-[#FAF8F5] border border-[#E3DDD3] p-1 rounded-full text-xs font-mono">
          <button
            id="nav-tab-library"
            onClick={() => { setActiveTab('library'); setSelectedBook(null); }}
            className={`px-4 py-2 rounded-full cursor-pointer transition-all duration-200 ${
              activeTab === 'library' 
                ? 'bg-[#5A5A40] text-[#F5F2ED] font-bold shadow-xs' 
                : 'text-[#8A8178] hover:text-[#2D2A26] hover:bg-[#E3DDD3]/40'
            }`}
          >
            {t('library')}
          </button>
          
          <button
            id="nav-tab-account"
            onClick={() => { setActiveTab('account'); setSelectedBook(null); }}
            className={`px-4 py-2 rounded-full cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'account' 
                ? 'bg-[#5A5A40] text-[#F5F2ED] font-bold shadow-xs' 
                : 'text-[#8A8178] hover:text-[#2D2A26] hover:bg-[#E3DDD3]/40'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            {t('account')}
          </button>

          <button
            id="nav-tab-author"
            onClick={() => { setActiveTab('author'); setSelectedBook(null); }}
            className={`px-4 py-2 rounded-full cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'author' 
                ? 'bg-[#5A5A40] text-[#F5F2ED] font-bold shadow-xs' 
                : 'text-[#8A8178] hover:text-[#2D2A26] hover:bg-[#E3DDD3]/40'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            {t('authorAtelier')}
          </button>

          <button
            id="nav-tab-store"
            onClick={() => { setActiveTab('store'); setSelectedBook(null); }}
            className={`px-4 py-2 rounded-full cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'store' 
                ? 'bg-[#5A5A40] text-[#F5F2ED] font-bold shadow-xs' 
                : 'text-[#8A8178] hover:text-[#2D2A26] hover:bg-[#E3DDD3]/40'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            {t('store')}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E3DDD3] hover:border-[#5A5A40] rounded-full text-xs font-mono font-medium flex items-center gap-1.5 hover:bg-[#E3DDD3]/20 active:scale-95 transition-all duration-150 cursor-pointer"
              title={t('selectLanguage')}
            >
              <span>{languages.find(l => l.code === currentLanguage)?.flag}</span>
              <span className="hidden sm:inline text-xs text-[#4A443F]">{languages.find(l => l.code === currentLanguage)?.label}</span>
              <span className="text-[8px] text-[#8A8178]">▼</span>
            </button>
            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-36 bg-[#FBF9F6] border border-[#E3DDD3] rounded-2xl shadow-xl py-1.5 z-40 overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-xs font-mono flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentLanguage === lang.code 
                        ? 'bg-[#5A5A40]/10 text-[#5A5A40] font-bold' 
                        : 'text-[#4A443F] hover:bg-[#E3DDD3]/30'
                    }`}
                  >
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            id="help-toggle-btn"
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-[#8A8178] hover:text-[#2D2A26] hover:bg-[#FAF8F5] border border-transparent hover:border-[#E3DDD3] rounded-xl transition duration-200 cursor-pointer"
            title={t('howItWorks')}
          >
            <HelpCircle className="w-5 h-5 text-[#5A5A40]" />
          </button>
          
          <button
            id="header-import-trigger"
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] active:scale-95 text-[#F5F2ED] font-serif italic text-xs rounded-full transition-all duration-200 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">{t('importBook')}</span>
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation Tabs Bar */}
      {!selectedBook && (
        <div id="mobile-navigation-bar" className="flex md:hidden items-center justify-around bg-[#FBF9F6] border-b border-[#E3DDD3] py-2.5 px-4 text-xs font-mono">
          <button
            onClick={() => { setActiveTab('library'); setSelectedBook(null); }}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'library' ? 'text-[#5A5A40] font-bold bg-[#5A5A40]/10' : 'text-[#8A8178]'
            }`}
          >
            <Library className="w-4 h-4" />
            <span className="text-[10px]">{t('library')}</span>
          </button>
          <button
            onClick={() => { setActiveTab('account'); setSelectedBook(null); }}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'account' ? 'text-[#5A5A40] font-bold bg-[#5A5A40]/10' : 'text-[#8A8178]'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="text-[10px]">{t('account')}</span>
          </button>

          <button
            onClick={() => { setActiveTab('author'); setSelectedBook(null); }}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'author' ? 'text-[#5A5A40] font-bold bg-[#5A5A40]/10' : 'text-[#8A8178]'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span className="text-[10px]">{t('authorAtelier')}</span>
          </button>

          <button
            onClick={() => { setActiveTab('store'); setSelectedBook(null); }}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'store' ? 'text-[#5A5A40] font-bold bg-[#5A5A40]/10' : 'text-[#8A8178]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span className="text-[10px]">{t('store')}</span>
          </button>
        </div>
      )}

      {/* Primary views panel switcher */}
      {selectedBook ? (
        /* Immersive 3D Reader Workspace opens full-screen */
        <BookReader
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onProgressUpdate={loadBooksFromStore}
        />
      ) : activeTab === 'account' ? (
        <AccountPage
          books={books}
          loading={loading}
          onReadBook={setSelectedBook}
          onDeleteBook={handleDeleteBook}
          onBookmarkClick={handleBookmarkClick}
          onBookmarkDelete={handleBookmarkDelete}
          onImportClick={() => setShowUpload(true)}
        />
      ) : activeTab === 'author' || activeTab === 'store' ? (
        <div key={activeTab} className="animate-fade-in-up">
          <AuthorStoreSuite
            currentTab={activeTab}
            onBookImported={async () => {
              await loadBooksFromStore();
              setActiveTab('account');
            }}
            onNavigateToLibrary={async () => {
              setActiveTab('store');
            }}
          />
        </div>
      ) : (
        /* Standard Library Shelf and Statistics view */
        <main key="library" id="library-dashboard" className="relative z-10 flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 md:py-12 space-y-8 md:space-y-12 animate-fade-in-up">
          
          {/* Dashboard Intro Hero Banner block */}
          <section id="hero-welcome-banner" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-[#FBF9F6] border border-[#E3DDD3] p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#5A5A40]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5A5A40]/10 text-[#5A5A40] font-mono text-[10px] uppercase font-bold rounded-full tracking-wider border border-[#5A5A40]/20">
                <Sparkles className="w-3.5 h-3.5" />
                {t('pureUIBadge')}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold tracking-tight text-[#2D2A26] leading-tight">
                {t('welcomeTitle')} <span className="underline decoration-[#C2BCAE]">{t('welcomeTitleAccent')}</span>
              </h2>
              <p className="text-sm text-[#8A8178] font-light leading-relaxed max-w-2xl">
                {t('welcomeSubtitle')}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  id="hero-upload-shortcut"
                  onClick={() => setShowUpload(true)}
                  className="px-5 py-3 bg-[#5A5A40] hover:bg-[#484833] active:scale-95 text-[#F5F2ED] text-xs font-mono font-medium rounded-full transition duration-200 shadow flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#FBF9F6]" />
                  {t('importFirst')}
                </button>
                <div className="text-xs text-[#8A8178] flex items-center gap-1">
                  <Compass className="w-4 h-4 text-[#5A5A40]" />
                  <span>{t('supportNote')}</span>
                </div>
              </div>
            </div>

            {/* Account teaser */}
            <div className="lg:col-span-4 grid grid-cols-1 gap-4">
              <div className="bg-white border border-[#E3DDD3] rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#5A5A40]" />
                  <p className="text-sm font-serif italic font-bold text-[#2D2A26]">{t('accountPageTitle')}</p>
                </div>
                <p className="text-[11px] text-[#8A8178] font-light leading-relaxed">{t('homeLibraryMoved')}</p>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-[#FAF8F5] rounded-xl p-2">
                    <p className="text-base font-serif font-bold text-[#2D2A26]">{books.length}</p>
                    <p className="text-[8px] text-[#8A8178] font-mono uppercase">{t('ownBooks')}</p>
                  </div>
                  <div className="bg-[#FAF8F5] rounded-xl p-2">
                    <p className="text-base font-serif font-bold text-[#2D2A26]">{inProgressBooks}</p>
                    <p className="text-[8px] text-[#8A8178] font-mono uppercase">{t('readingProgress')}</p>
                  </div>
                  <div className="bg-[#FAF8F5] rounded-xl p-2">
                    <p className="text-base font-serif font-bold text-[#2D2A26]">{totalBookmarks}</p>
                    <p className="text-[8px] text-[#8A8178] font-mono uppercase">{t('bookmarks')}</p>
                  </div>
                </div>
                <button
                  id="hero-go-to-account"
                  onClick={() => setActiveTab('account')}
                  className="w-full px-4 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-[#F5F2ED] text-xs font-mono font-bold rounded-full transition cursor-pointer"
                >
                  {t('homeGoToAccount')}
                </button>
              </div>
            </div>
          </section>

          {/* Quick Help Guide Drawer accordion component */}
          {showHelp && (
            <section id="guide-info-banner" className="bg-[#FBF9F6] border border-[#E3DDD3] rounded-3xl p-6 space-y-4 animate-scale-up shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E3DDD3] pb-3">
                <h3 className="font-serif italic font-bold text-[#2D2A26] text-sm flex items-center gap-1.5 uppercase tracking-wide">
                  <HelpCircle className="w-4.5 h-4.5 text-[#5A5A40]" />
                  {t('instructionsTitle')}
                </h3>
                <button
                  id="close-guide-btn"
                  onClick={() => setShowHelp(false)}
                  className="text-xs text-[#8A8178] hover:text-[#2D2A26] px-2 py-0.5 bg-[#FAF8F5] rounded border border-[#E3DDD3] font-mono cursor-pointer"
                >
                  {t('back')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#8A8178] leading-relaxed font-light">
                <div className="space-y-2">
                  <p>{t('instructionsText1')}</p>
                </div>
                <div className="space-y-2">
                  <p>{t('instructionsText2')}</p>
                </div>
                <div className="space-y-2">
                  <p>{t('instructionsText3')}</p>
                </div>
              </div>
            </section>
          )}

        </main>
      )}

      {/* Floating Upload Modal Portal */}
      {showUpload && (
        <UploadPanel 
          onImportSuccess={handleImportBook} 
          onClose={() => setShowUpload(false)} 
        />
      )}

      {/* Global application core footer */}
      {!selectedBook && (
        <footer id="global-system-footer" className="relative z-10 py-8 text-center text-[10.5px] text-[#8A8178] font-mono border-t border-[#E3DDD3] mt-auto bg-[#FBF9F6]">
          <p>© 2026 r-eBook Realist Reader • {t('ownBooks')} IndexedDB</p>
          <div className="flex items-center justify-center gap-1.5 mt-2 opacity-80">
            <Sparkles className="w-3 h-3 text-[#5A5A40]" />
            <span>{t('supportNote')}</span>
          </div>
        </footer>
      )}

    </div>
  );
}
