import React, { useState, useEffect } from 'react';
import { Book, ReaderAccount } from '../types';
import { LibraryBookCard } from './LibraryBookCard';
import { useTranslation } from '../utils/localization';
import {
  getReaderSession,
  loginReaderAccount,
  registerReaderAccount,
  logoutReaderAccount,
} from '../utils/accountAuth';
import {
  User,
  LogOut,
  BookOpen,
  Library,
  BookMarked,
  Trash2,
  Info,
  TrendingUp,
  Upload,
} from 'lucide-react';

interface AccountPageProps {
  books: Book[];
  loading: boolean;
  onReadBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onBookmarkClick: (bookId: string, chapterIndex: number, pageIndex: number) => void;
  onBookmarkDelete: (e: React.MouseEvent, bookId: string, bookmarkId: string) => void;
  onImportClick: () => void;
}

export function AccountPage({
  books,
  loading,
  onReadBook,
  onDeleteBook,
  onBookmarkClick,
  onBookmarkDelete,
  onImportClick,
}: AccountPageProps) {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<ReaderAccount | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  useEffect(() => {
    setCurrentUser(getReaderSession());
  }, []);

  const mapAuthError = (code: string) => {
    switch (code) {
      case 'missing_fields': return t('accountErrorMissing');
      case 'email_exists': return t('accountErrorEmailExists');
      case 'wrong_credentials': return t('accountErrorWrongCredentials');
      case 'no_accounts': return t('accountErrorNoAccounts');
      default: return code;
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const result = isRegistering
      ? registerReaderAccount(authName, authEmail, authPassword)
      : loginReaderAccount(authEmail, authPassword);

    if (result.ok === false) {
      setAuthError(mapAuthError(result.error));
      return;
    }
    setCurrentUser(result.account);
    setAuthPassword('');
  };

  const handleLogout = () => {
    logoutReaderAccount();
    setCurrentUser(null);
  };

  const inProgressBooks = books.filter(b => b.progress);
  const allBookmarks = books.flatMap(book =>
    (book.bookmarks || []).map(bm => ({
      ...bm,
      bookId: book.id,
      bookTitle: book.title,
      coverColor: book.coverColor,
      author: book.author,
    }))
  ).reverse();

  if (!currentUser) {
    return (
      <main id="account-auth-page" className="relative z-10 flex-grow max-w-lg mx-auto w-full px-4 sm:px-6 py-8 md:py-16 animate-fade-in-up">
        <div className="bg-[#FBF9F6] border border-[#E3DDD3] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#5A5A40]/10 rounded-2xl flex items-center justify-center text-[#5A5A40] mx-auto">
              <User className="w-6 h-6" />
            </div>
            <h2 className="font-serif italic font-bold text-2xl text-[#2D2A26]">
              {isRegistering ? t('accountRegisterTitle') : t('accountLoginTitle')}
            </h2>
            <p className="text-xs text-[#8A8178] font-light leading-relaxed">
              {isRegistering ? t('accountRegisterDesc') : t('accountLoginDesc')}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] text-red-600 flex items-start gap-1.5">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {isRegistering && (
              <div>
                <label className="block text-[10px] font-mono text-[#8A8178] uppercase mb-1">{t('accountNameLabel')}</label>
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full text-xs p-3 border border-[#E3DDD3] bg-white rounded-xl focus:border-[#5A5A40] outline-none transition"
                  placeholder="Ion Popescu"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono text-[#8A8178] uppercase mb-1">{t('accountEmailLabel')}</label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full text-xs p-3 border border-[#E3DDD3] bg-white rounded-xl focus:border-[#5A5A40] outline-none transition"
                placeholder="nume@email.ro"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#8A8178] uppercase mb-1">{t('accountPasswordLabel')}</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full text-xs p-3 border border-[#E3DDD3] bg-white rounded-xl focus:border-[#5A5A40] outline-none transition"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full p-3.5 bg-[#5A5A40] hover:bg-[#484833] text-[#F5F2ED] text-xs font-mono font-bold rounded-xl shadow-sm transition"
            >
              {isRegistering ? t('accountRegisterBtn') : t('accountLoginBtn')}
            </button>
          </form>

          <div className="border-t border-[#E3DDD3] pt-4 text-center">
            <button
              onClick={() => { setIsRegistering(!isRegistering); setAuthError(null); }}
              className="text-xs text-[#5A5A40] hover:underline font-mono"
            >
              {isRegistering ? t('accountAlreadyHave') : t('accountNewUser')}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="account-dashboard" className="relative z-10 flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 md:py-12 space-y-8 md:space-y-10 animate-fade-in-up">

      {/* Profile header */}
      <section className="bg-[#FBF9F6] border border-[#E3DDD3] rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600/10 text-emerald-700 font-mono text-[9px] uppercase font-bold rounded-full border border-emerald-600/15">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            {t('accountWelcome')}, {currentUser.name}
          </span>
          <h2 className="font-serif italic font-bold text-2xl md:text-3xl text-[#2D2A26]">{t('accountPageTitle')}</h2>
          <p className="text-xs text-[#8A8178] font-light">{t('accountPageSubtitle')}</p>
          <p className="text-[10px] font-mono text-[#8A8178]">{currentUser.email} • {t('accountJoined')} {currentUser.joinedDate}</p>
        </div>

        <div className="md:col-span-4 grid grid-cols-3 gap-3">
          <div className="bg-white border border-[#E3DDD3] rounded-2xl p-3 text-center">
            <p className="text-lg font-serif font-bold text-[#2D2A26]">{books.length}</p>
            <p className="text-[8px] text-[#8A8178] font-mono uppercase">{t('accountStatsBooks')}</p>
          </div>
          <div className="bg-white border border-[#E3DDD3] rounded-2xl p-3 text-center">
            <p className="text-lg font-serif font-bold text-[#2D2A26]">{inProgressBooks.length}</p>
            <p className="text-[8px] text-[#8A8178] font-mono uppercase">{t('accountStatsProgress')}</p>
          </div>
          <div className="bg-white border border-[#E3DDD3] rounded-2xl p-3 text-center">
            <p className="text-lg font-serif font-bold text-[#2D2A26]">{allBookmarks.length}</p>
            <p className="text-[8px] text-[#8A8178] font-mono uppercase">{t('accountStatsBookmarks')}</p>
          </div>
        </div>

        <div className="md:col-span-12 flex flex-wrap justify-end items-center gap-2">
          <button
            id="account-import-trigger"
            onClick={onImportClick}
            className="px-4 py-2 bg-[#5A5A40] hover:bg-[#484833] text-[#F5F2ED] font-serif italic text-xs rounded-full transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            {t('importBook')}
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-[#FAF8F5] hover:bg-red-50 text-[#8A8178] hover:text-red-700 border border-[#E3DDD3] hover:border-red-100 rounded-xl text-xs font-mono transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {t('accountLogout')}
          </button>
        </div>
      </section>

      {/* In progress */}
      <section id="account-in-progress" className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E3DDD3] pb-3">
          <TrendingUp className="w-5 h-5 text-[#5A5A40]" />
          <h3 className="font-serif italic text-xl font-bold text-[#2D2A26]">{t('accountInProgressSection')}</h3>
        </div>

        {inProgressBooks.length === 0 ? (
          <p className="text-xs text-[#8A8178] font-mono py-6 text-center border border-dashed border-[#D8D2C6] rounded-2xl">
            {t('accountNoInProgress')}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressBooks.map(book => (
              <button
                key={book.id}
                onClick={() => onReadBook(book)}
                className="p-4 bg-white border border-[#E3DDD3] hover:border-[#5A5A40] rounded-2xl text-left transition flex items-center gap-4 group"
              >
                <div
                  className="w-10 h-14 rounded-md flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: book.coverColor }}
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif font-bold text-sm text-[#2D2A26] line-clamp-1 group-hover:text-[#5A5A40]">{book.title}</h4>
                  <p className="text-[10px] text-[#8A8178]">{t('authorPrefix')} {book.author}</p>
                  {book.progress && (
                    <p className="text-[9px] font-mono text-[#5A5A40] mt-1">
                      {t('chShort')} {book.progress.chapterIndex + 1} • {t('pageShort')} {book.progress.pageIndex + 1}
                    </p>
                  )}
                </div>
                <span className="text-[10px] font-mono text-[#5A5A40] opacity-0 group-hover:opacity-100 transition">
                  {t('accountContinueReading')} →
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Bookmarks */}
      {allBookmarks.length > 0 && (
        <section id="account-bookmarks" className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3DDD3] pb-3">
            <div className="flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-[#5A5A40]" />
              <h3 className="font-serif italic text-xl font-bold text-[#2D2A26]">{t('activeBookmarks')}</h3>
            </div>
            <span className="font-mono text-[10px] text-[#8A8178] uppercase">{allBookmarks.length} {t('bookmarks')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allBookmarks.map(bm => (
              <div
                key={bm.id}
                onClick={() => onBookmarkClick(bm.bookId, bm.chapterIndex, bm.pageIndex)}
                className="p-4 bg-[#FBF9F6] border border-[#E3DDD3] rounded-2xl hover:border-[#D8D2C6] hover:shadow-md cursor-pointer transition flex flex-col justify-between group h-[160px] relative overflow-hidden"
              >
                <div className="absolute top-0 right-4 w-2.5 h-6 bg-[#A13D2D] rounded-b-xs shadow-xs opacity-85" />
                <div>
                  <h4 className="font-semibold text-xs text-[#2D2A26] line-clamp-1 pr-4">{bm.bookTitle}</h4>
                  <p className="text-[10px] text-[#8A8178] truncate">{t('authorPrefix')} {bm.author}</p>
                  <p className="text-[11px] text-[#4A443F] font-serif italic line-clamp-2 bg-white/60 border-l-2 border-[#5A5A40]/40 p-2 rounded-r leading-relaxed mt-2">
                    „{bm.previewText}"
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-[#E3DDD3]/50 pt-2 mt-2">
                  <span className="text-[9px] font-mono font-bold text-[#5A5A40] bg-[#5A5A40]/10 px-2 py-0.5 rounded">
                    {t('chShort')} {bm.chapterIndex + 1} • {t('pageShort')} {bm.pageIndex + 1}
                  </span>
                  <button
                    onClick={(e) => onBookmarkDelete(e, bm.bookId, bm.id)}
                    className="p-1 rounded-md text-[#8A8178] hover:text-red-600 hover:bg-red-50/70 transition"
                    title={t('deleteBookmark')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Full library */}
      <section id="account-library" className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#E3DDD3] pb-3">
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 text-[#5A5A40]" />
            <h3 className="font-serif italic text-2xl font-bold text-[#2D2A26]">{t('ownBooks')}</h3>
          </div>
          <span className="font-mono text-[10px] text-[#8A8178] uppercase">{books.length} {t('library')}</span>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-2 border-[#5A5A40] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#8A8178] font-mono mt-3">{t('loadingLibrary')}</p>
          </div>
        ) : books.length === 0 ? (
          <div className="border border-dashed border-[#D8D2C6] bg-[#FAF8F5] rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
            <BookOpen className="w-8 h-8 text-[#5A5A40] mx-auto" />
            <h4 className="font-serif italic font-bold text-[#2D2A26]">{t('noBooks')}</h4>
            <p className="text-xs text-[#8A8178] font-light">{t('emptyShelfHint')}</p>
            <button
              onClick={onImportClick}
              className="px-5 py-2 bg-[#5A5A40] hover:bg-[#484833] text-[#F5F2ED] rounded-full text-xs font-mono font-bold transition cursor-pointer"
            >
              {t('importBook')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 justify-items-center">
            {books.map(book => (
              <LibraryBookCard
                key={book.id}
                book={book}
                onRead={onReadBook}
                onDelete={onDeleteBook}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
