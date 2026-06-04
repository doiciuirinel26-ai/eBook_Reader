import React, { useState, useEffect } from 'react';
import { Book, Bookmark } from './types';
import { getLibraryBooks, saveBookToDB, deleteBookFromDB, updateBookBookmarks, updateBookProgress } from './utils/db';
import { LibraryBookCard } from './components/LibraryBookCard';
import { UploadPanel } from './components/UploadPanel';
import { BookReader } from './components/BookReader';
import { AuthorStoreSuite } from './components/AuthorStoreSuite';
import { useTranslation, LanguageCode } from './utils/localization';
import { 
  BookOpen, 
  Upload, 
  Sparkles, 
  BookMarked, 
  Library, 
  Compass, 
  HelpCircle,
  TrendingUp,
  Award,
  BookCheck,
  Feather,
  Bookmark as BookmarkIcon,
  Trash2,
  PenTool,
  Globe
} from 'lucide-react';

export default function App() {
  const { t, currentLanguage, setLanguage, languages } = useTranslation();
  const [showLangDropdown, setShowLangDropdown] = useState<boolean>(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'library' | 'author' | 'store'>('library');

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
      // Reload from DB to keep IndexedDB as single source of truth
      await loadBooksFromStore();
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

  // Fast statistics computation
  const customBooksCount = books.filter(b => b.isCustom).length;
  const inProgressBooks = books.filter(b => b.progress).length;
  const totalChaptersAvailable = books.reduce((sum, b) => sum + (b.chapters?.length || 0), 0);

  // Flat map and reverse all bookmarks from all library books
  const allBookmarks = books.flatMap(book => 
    (book.bookmarks || []).map(bm => ({
      ...bm,
      bookId: book.id,
      bookTitle: book.title,
      coverColor: book.coverColor,
      author: book.author
    }))
  ).reverse();

  return (
    <div id="application-container" className="min-h-screen bg-[#F5F2ED] text-[#4A443F] flex flex-col font-sans selection:bg-[#5A5A40] selection:text-[#F5F2ED] overflow-x-hidden">
      
      {/* Immersive Outer background glow accents */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[#5A5A40]/3 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#8A8178]/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Main navigation header header block */}
      <header id="main-navigation-header" className="relative z-10 border-b border-[#E3DDD3] bg-[#FBF9F6] px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center shadow-md">
            <Feather className="w-5.5 h-5.5 text-[#F5F2ED] stroke-[2]" />
          </div>
          <div className="cursor-pointer" onClick={() => { setActiveTab('library'); setSelectedBook(null); }}>
            <h1 className="font-serif italic font-bold text-lg md:text-xl tracking-tight leading-tight text-[#2D2A26]">
              Lectura Realistă
            </h1>
            <p className="text-[10px] text-[#8A8178] uppercase tracking-widest font-mono">
              {t('library')} 3D & ePUB
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
              title="Alege limba / Select language"
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
            <span className="text-[10px]">Bibliotecă</span>
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
      ) : activeTab === 'author' || activeTab === 'store' ? (
        <div key={activeTab} className="animate-fade-in-up">
          <AuthorStoreSuite
            currentTab={activeTab}
            onBookImported={async (newB) => {
              await loadBooksFromStore();
              setActiveTab('library');
            }}
            onNavigateToLibrary={async () => {
              setActiveTab('store');
            }}
          />
        </div>
      ) : (
        /* Standard Library Shelf and Statistics view */
        <main key="library" id="library-dashboard" className="relative z-10 flex-grow max-w-7xl mx-auto w-full px-6 py-8 md:py-12 space-y-12 animate-fade-in-up">
          
          {/* Dashboard Intro Hero Banner block */}
          <section id="hero-welcome-banner" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FBF9F6] border border-[#E3DDD3] p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#5A5A40]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5A5A40]/10 text-[#5A5A40] font-mono text-[10px] uppercase font-bold rounded-full tracking-wider border border-[#5A5A40]/20">
                <Sparkles className="w-3.5 h-3.5" />
                Interfață pură • Pure UI
              </span>
              <h2 className="text-3xl md:text-4xl font-serif italic font-bold tracking-tight text-[#2D2A26] leading-tight">
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

            {/* Side premium status metrics highlights */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
              <div className="bg-white border border-[#E3DDD3] rounded-2xl p-4 text-center space-y-1 shadow-xs">
                <Library className="w-5 h-5 text-[#5A5A40] mx-auto" />
                <p className="text-xl font-serif font-bold text-[#2D2A26]">{books.length}</p>
                <p className="text-[9px] text-[#8A8178] font-mono uppercase">{t('ownBooks')}</p>
              </div>

              <div className="bg-white border border-[#E3DDD3] rounded-2xl p-4 text-center space-y-1 shadow-xs">
                <BookMarked className="w-5 h-5 text-[#5A5A40] mx-auto" />
                <p className="text-xl font-serif font-bold text-[#2D2A26]">{inProgressBooks}</p>
                <p className="text-[9px] text-[#8A8178] font-mono uppercase">{t('readingProgress')}</p>
              </div>

              <div className="bg-white border border-[#E3DDD3] rounded-2xl p-4 text-center space-y-1 shadow-xs">
                <BookCheck className="w-5 h-5 text-[#5A5A40] mx-auto" />
                <p className="text-xl font-serif font-bold text-[#2D2A26]">{customBooksCount}</p>
                <p className="text-[9px] text-[#8A8178] font-mono uppercase">CUSTOM EPUB</p>
              </div>

              <div className="bg-white border border-[#E3DDD3] rounded-2xl p-4 text-center space-y-1 shadow-xs">
                <Award className="w-5 h-5 text-[#5A5A40] mx-auto" />
                <p className="text-xl font-serif font-bold text-[#2D2A26]">{totalChaptersAvailable}</p>
                <p className="text-[9px] text-[#8A8178] font-mono uppercase">{t('totalChapters')}</p>
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

          {/* Dedicated Bookmarks Shelf Section representing saved items */}
          {allBookmarks.length > 0 && (
            <section id="dashboard-bookmarks-shelf" className="space-y-6 animate-scale-up">
              <div className="flex items-center justify-between border-b border-[#E3DDD3] pb-3">
                <div className="flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-[#5A5A40]" />
                  <h3 className="font-serif italic text-2xl font-bold tracking-tight text-[#2D2A26]">
                    {t('activeBookmarks')}
                  </h3>
                </div>
                <span className="font-mono text-[10.5px] text-[#8A8178] uppercase tracking-widest">
                  {allBookmarks.length} {t('bookmarks')}
                </span>
              </div>

              <div 
                id="bookmarks-dashboard-grid"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {allBookmarks.map(bm => (
                  <div
                    key={bm.id}
                    id={`bookmark-card-${bm.id}`}
                    onClick={() => handleBookmarkClick(bm.bookId, bm.chapterIndex, bm.pageIndex)}
                    className="p-4 bg-[#FBF9F6] border border-[#E3DDD3] rounded-2xl hover:border-[#D8D2C6] hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-between group h-[160px] relative overflow-hidden"
                  >
                    {/* Tiny Ribbon Deco in Card Margin */}
                    <div className="absolute top-0 right-4 w-2.5 h-6 bg-[#A13D2D] rounded-b-xs shadow-xs opacity-85" />

                    <div>
                      {/* Book header */}
                      <div className="flex justify-between items-start gap-4 mb-2 pr-4">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-xs text-[#2D2A26] line-clamp-1 group-hover:text-[#5A5A40] transition duration-150">
                            {bm.bookTitle}
                          </h4>
                          <p className="text-[10px] text-[#8A8178] truncate">de {bm.author}</p>
                        </div>
                      </div>

                      {/* Small preview block sentence */}
                      <p className="text-[11px] text-[#4A443F] font-serif italic line-clamp-2 bg-white/60 border-l-2 border-[#5A5A40]/40 p-2 rounded-r leading-relaxed">
                        „{bm.previewText}”
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#E3DDD3]/50 pt-2 mt-2">
                      <span className="text-[9px] font-mono font-bold text-[#5A5A40] bg-[#5A5A40]/10 px-2 py-0.5 rounded border border-[#5A5A40]/15">
                        CAP. {bm.chapterIndex + 1} • PAG. {bm.pageIndex + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-mono text-[#8A8178]/70">
                          {bm.dateAdded}
                        </span>
                        <button
                          id={`dash-bookmark-delete-${bm.id}`}
                          onClick={(e) => handleBookmarkDelete(e, bm.bookId, bm.id)}
                          className="p-1 rounded-md text-[#8A8178] hover:text-red-600 hover:bg-red-50/70 border border-transparent hover:border-red-100 transition duration-150 flex items-center justify-center cursor-pointer"
                          title="Șterge marcaj"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Primary Book Shelf list layout section */}
          <section id="library-shelf-catalog" className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#E3DDD3] pb-3">
              <div className="flex items-center gap-2">
                <Library className="w-5 h-5 text-[#5A5A40]" />
                <h3 className="font-serif italic text-2xl font-bold tracking-tight text-[#2D2A26]">
                  {t('ownBooks')}
                </h3>
              </div>
              
              <span className="font-mono text-[10.5px] text-[#8A8178] uppercase tracking-widest">
                {books.length} {t('library')}
              </span>
            </div>

            {loading ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-10 h-10 border-2 border-[#5A5A40] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#8A8178] font-mono">Se încarcă rafturile bibliotecii locale...</p>
              </div>
            ) : books.length === 0 ? (
              <div className="border border-dashed border-[#D8D2C6] bg-[#FAF8F5] rounded-3xl p-16 text-center space-y-4 max-w-lg mx-auto shadow-xs">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#D8D2C6] flex items-center justify-center text-[#5A5A40] mx-auto shadow-inner">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-serif italic font-bold text-[#2D2A26] text-lg">{t('noBooks')}</h4>
                <p className="text-xs text-[#8A8178] leading-relaxed font-light">
                  Vă rugăm să importați prima voastră carte în format digital EPUB/TXT sau apăsați butonul de mai jos pentru a genera colecția demonstrativă de literatură clasică.
                </p>
                <button
                  id="empty-shelf-upload-btn"
                  onClick={() => setShowUpload(true)}
                  className="px-5 py-2 bg-[#5A5A40] hover:bg-[#484833] text-[#F5F2ED] rounded-full text-xs font-mono font-bold transition-all shadow-sm cursor-pointer"
                >
                  {t('importBook')}
                </button>
              </div>
            ) : (
              /* Shelf Items grid layout showing premium 3D covers */
              <div 
                id="bookshelf-grid"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8 justify-items-center"
              >
                {books.map(book => (
                  <LibraryBookCard 
                    key={book.id} 
                    book={book} 
                    onRead={setSelectedBook} 
                    onDelete={handleDeleteBook}
                  />
                ))}
              </div>
            )}
          </section>

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
