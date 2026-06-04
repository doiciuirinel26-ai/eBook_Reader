export interface Chapter {
  id: string;
  title: string;
  content: string; // HTML or raw text content of the chapter
  translations?: Record<string, { title: string; content: string }>; // Saved automatic translations by language code (e.g. 'en', 'es')
}

export interface Bookmark {
  id: string;
  chapterIndex: number;
  pageIndex: number;
  chapterTitle: string;
  previewText: string;
  dateAdded: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverColor: string; // hex or tailwind shade
  coverDesign: string; // 'minimalist' | 'classic' | 'geometric' | 'ornate'
  chapters: Chapter[];
  description?: string;
  isCustom?: boolean;
  dateAdded: string;
  progress?: {
    chapterIndex: number;
    pageIndex: number;
  };
  bookmarks?: Bookmark[];
}

export type ReaderTheme = 'parchment' | 'warm-paper' | 'slate-dark' | 'midnight-velvet' | 'classic-white';

export interface AuthorProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  penName: string; // Pseudonimul de autor
  password?: string;
  joinedDate: string;
}

export interface AuthorDraft {
  id: string;
  title: string;
  authorId: string;
  penName: string;
  coverColor: string;
  coverDesign: string; // 'minimalist' | 'classic' | 'geometric' | 'ornate'
  chapters: Chapter[];
  description: string;
  lastUpdated: string;
}

export interface StoreBook {
  id: string;
  title: string;
  author: string;
  authorId: string;
  description: string;
  coverColor: string;
  coverDesign: string; // 'minimalist' | 'classic' | 'geometric' | 'ornate'
  chapters: Chapter[];
  downloadsCount: number;
  likesCount: number;
  datePublished: string;
}

export interface StyleSettings {
  fontFamily: 'serif-merriweather' | 'serif-playfair' | 'sans-inter' | 'sans-grotesk' | 'mono-jetbrains';
  fontSize: number; // 14 to 26 px
  lineHeight: number; // 1.4 to 2.0
  theme: ReaderTheme;
  twoPageSpread: boolean; // True for side-by-side tablet layout, false for single mobile layout
}

export interface PageData {
  chapterIndex: number;
  chapterTitle: string;
  pages: string[]; // List of page texts for this chapter
}
