import React from 'react';
import { Book } from '../types';
import { BookOpen, Calendar, Trash2, Milestone } from 'lucide-react';
import { useTranslation } from '../utils/localization';

interface LibraryBookCardProps {
  book: Book;
  onRead: (book: Book) => void;
  onDelete?: (bookId: string) => void;
}

export const LibraryBookCard: React.FC<LibraryBookCardProps> = ({ book, onRead, onDelete }) => {
  const { t } = useTranslation();
  // Generate a procedural texture pattern based on the coverDesign property
  const getPatternOverlay = () => {
    switch (book.coverDesign) {
      case 'ornate':
        return (
          <div className="absolute inset-4 border border-amber-400/30 rounded-sm pointer-events-none flex items-center justify-center">
            <div className="absolute inset-1 border-2 border-amber-400/40 rounded-sm" />
            <div className="w-16 h-16 border border-amber-400/30 rotate-45 flex items-center justify-center">
              <div className="w-10 h-10 border border-amber-400/40 -rotate-45" />
            </div>
            {/* Corners */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400/40" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400/40" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400/40" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400/40" />
          </div>
        );
      case 'geometric':
        return (
          <div className="absolute inset-0 opacity-15 bg-[linear-gradient(45deg,#fff_25%,transparent_25%),linear-gradient(-45deg,#fff_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#fff_75%),linear-gradient(-45deg,transparent_75%,#fff_75%)] bg-[size:20px_20px] pointer-events-none" />
        );
      case 'classic':
        return (
          <div className="absolute inset-x-0 top-[20%] bottom-[20%] border-y-2 border-dashed border-amber-400/20 pointer-events-none flex flex-col justify-between p-4">
            <div className="w-full h-1 bg-amber-400/20" />
            <div className="w-full h-1 bg-amber-400/20" />
          </div>
        );
      case 'minimalist':
      default:
        return (
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-black/10 shadow-sm pointer-events-none" />
        );
    }
  };

  // Get lightened shade for highlights or page edges
  const getLightenedCoverColor = (color: string) => {
    // Basic fallback or helper
    if (color.startsWith('#')) return color + 'dd';
    return color;
  };

  return (
    <div 
      id={`book-card-${book.id}`}
      className="group relative flex flex-col w-full max-w-[180px] sm:max-w-[210px] bg-white border border-[#E3DDD3] rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
    >
      {/* 3D Realistic Cardboard Book Cover Container */}
      <div 
        className="relative aspect-[3/4.2] w-full rounded-lg overflow-hidden shadow-lg cursor-pointer preserve-3d group-hover:scale-[1.03] duration-300 select-none"
        style={{ backgroundColor: book.coverColor }}
        onClick={() => onRead(book)}
      >
        {/* Procedural Pattern */}
        {getPatternOverlay()}

        {/* Realistic spine fold shading */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/40 via-black/10 to-transparent pointer-events-none" />
        <div className="absolute left-3 top-0 bottom-0 w-1 bg-white/10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-black/20 pointer-events-none" />

        {/* Paper texture overlay */}
        <div className="absolute inset-0 bg-paper-texture mix-blend-overlay opacity-60 pointer-events-none" />

        {/* Content layout on the cover */}
        <div className="absolute inset-0 flex flex-col justify-between p-5 text-center text-amber-100">
          <div className="flex flex-col items-center mt-2">
            <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-amber-300/80 font-medium px-2 py-0.5 border border-amber-300/30 rounded-full mb-3">
              MOLDOVA / COMPLET
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 my-auto px-1">
            <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight leading-tight select-none uppercase drop-shadow-md line-clamp-3">
              {book.title}
            </h3>
            <div className="w-10 h-0.5 bg-amber-400/60 my-1 group-hover:w-16 transition-all duration-300" />
            <p className="font-sans text-xs italic opacity-85 uppercase tracking-wider font-light line-clamp-1">
              {book.author}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-wider opacity-75 mt-auto">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('readBook')}</span>
          </div>
        </div>

        {/* Gloss paper shine overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Book description & metrics */}
      <div className="flex flex-col flex-grow mt-3 text-left">
        <div className="flex items-start justify-between min-h-[44px]">
          <div>
            <h4 className="font-sans text-sm font-semibold text-[#2D2A26] line-clamp-1">
              {book.title}
            </h4>
            <p className="text-xs text-[#8A8178] font-light italic">
              {t('authorPrefix')} {book.author}
            </p>
          </div>
          
          {book.isCustom && onDelete && (
            <button
              id={`delete-btn-${book.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(book.id);
              }}
              className="p-1.5 text-[#8A8178] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
              title="Șterge cartea"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-[11px] text-[#8A8178] line-clamp-2 mt-1 leading-relaxed min-h-[32px] hidden sm:block">
          {book.description || 'Fără descriere disponibilă.'}
        </p>

        {/* Bottom progress metric bar */}
        <div className="mt-4 pt-3 border-t border-[#E3DDD3] flex items-center justify-between text-[10px] text-[#8A8178] font-mono">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#8A8178]" />
            <span>{book.dateAdded}</span>
          </div>

          {book.progress ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] rounded font-bold">
              <Milestone className="w-3 h-3" />
              <span>
                Cap. {book.progress.chapterIndex + 1}, Pag. {book.progress.pageIndex + 1}
              </span>
            </div>
          ) : (
            <span className="text-[#A69E93]">{t('unread')}</span>
          )}
        </div>
      </div>
    </div>
  );
};
