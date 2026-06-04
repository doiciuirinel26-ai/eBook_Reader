import { Book, AuthorProfile, AuthorDraft, StoreBook } from '../types';
import { DEFAULT_BOOKS } from '../data/defaultBooks';

const DB_NAME = 'EbookReaderRealistDB';
const STORE_NAME = 'books';
const AUTHORS_STORE = 'authors';
const DRAFTS_STORE = 'drafts';
const STORE_BOOKS_STORE = 'storeBooks';
const DB_VERSION = 2;

/**
 * Initialize IndexedDB and return a promise for the connection
 */
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Nu s-a putut deschide baza de date locală.'));
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(AUTHORS_STORE)) {
        db.createObjectStore(AUTHORS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
        db.createObjectStore(DRAFTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_BOOKS_STORE)) {
        db.createObjectStore(STORE_BOOKS_STORE, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Get all books from IndexedDB. If empty, seed with preloaded classics.
 */
export async function getLibraryBooks(): Promise<Book[]> {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const books = request.result as Book[];
        if (books.length === 0) {
          // Seed default books
          saveDefaultBooks(db, DEFAULT_BOOKS);
          resolve(DEFAULT_BOOKS);
        } else {
          resolve(books);
        }
      };

      request.onerror = () => {
        resolve(DEFAULT_BOOKS);
      };
    });
  } catch (err) {
    console.error('IndexedDB error:', err);
    return DEFAULT_BOOKS;
  }
}

/**
 * Internal seed helper
 */
function saveDefaultBooks(db: IDBDatabase, books: Book[]) {
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  books.forEach(book => {
    store.put(book);
  });
}

/**
 * Save a single book to IndexedDB
 */
export async function saveBookToDB(book: Book): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(book);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Eroare la salvarea cărții în baza de date.'));
  });
}

/**
 * Remove a book from IndexedDB
 */
export async function deleteBookFromDB(bookId: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(bookId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Eroare la ștergerea cărții din baza de date.'));
  });
}

/**
 * Update the bookmark/reading progress of a book
 */
export async function updateBookProgress(
  bookId: string,
  chapterIndex: number,
  pageIndex: number
): Promise<void> {
  const db = await initDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(bookId);

    getRequest.onsuccess = () => {
      const book = getRequest.result as Book | undefined;
      if (book) {
        book.progress = { chapterIndex, pageIndex };
        store.put(book);
      }
      resolve();
    };

    getRequest.onerror = () => resolve();
  });
}

/**
 * Update the saved bookmarks list for a book
 */
export async function updateBookBookmarks(
  bookId: string,
  bookmarks: import('../types').Bookmark[]
): Promise<void> {
  const db = await initDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(bookId);

    getRequest.onsuccess = () => {
      const book = getRequest.result as Book | undefined;
      if (book) {
        book.bookmarks = bookmarks;
        store.put(book);
      }
      resolve();
    };

    getRequest.onerror = () => resolve();
  });
}

// ==================== AUTHOR PROFILE HELPERS ====================

export async function getAuthors(): Promise<AuthorProfile[]> {
  const db = await initDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(AUTHORS_STORE, 'readonly');
    const store = transaction.objectStore(AUTHORS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as AuthorProfile[] || []);
    request.onerror = () => resolve([]);
  });
}

export async function saveAuthor(author: AuthorProfile): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(AUTHORS_STORE, 'readwrite');
    const store = transaction.objectStore(AUTHORS_STORE);
    const request = store.put(author);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Eroare la salvarea contului de autor.'));
  });
}

// ==================== AUTHOR DRAFTS HELPERS ====================

export async function getDrafts(): Promise<AuthorDraft[]> {
  const db = await initDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(DRAFTS_STORE, 'readonly');
    const store = transaction.objectStore(DRAFTS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as AuthorDraft[] || []);
    request.onerror = () => resolve([]);
  });
}

export async function saveDraft(draft: AuthorDraft): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DRAFTS_STORE, 'readwrite');
    const store = transaction.objectStore(DRAFTS_STORE);
    const request = store.put(draft);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Eroare la salvarea proiectului (Draft).'));
  });
}

export async function deleteDraftFromDB(draftId: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DRAFTS_STORE, 'readwrite');
    const store = transaction.objectStore(DRAFTS_STORE);
    const request = store.delete(draftId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Eroare la ștergerea proiectului.'));
  });
}

// ==================== PUBLISHED STORE BOOKS HELPERS ====================

export async function getStoreBooks(): Promise<StoreBook[]> {
  const db = await initDB();
  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_BOOKS_STORE, 'readonly');
    const store = transaction.objectStore(STORE_BOOKS_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const results = request.result as StoreBook[] || [];
      if (results.length === 0) {
        // Seed default store books if empty
        const seeded = seedInitialStoreBooks();
        const writeTx = db.transaction(STORE_BOOKS_STORE, 'readwrite');
        const writeStore = writeTx.objectStore(STORE_BOOKS_STORE);
        seeded.forEach(b => writeStore.put(b));
        resolve(seeded);
      } else {
        resolve(results);
      }
    };
    request.onerror = () => resolve([]);
  });
}

export async function saveStoreBook(book: StoreBook): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_BOOKS_STORE, 'readwrite');
    const store = transaction.objectStore(STORE_BOOKS_STORE);
    const request = store.put(book);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Eroare la publicarea/actualizarea cărții pe Store.'));
  });
}

export async function deleteStoreBookFromDB(bookId: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_BOOKS_STORE, 'readwrite');
    const store = transaction.objectStore(STORE_BOOKS_STORE);
    const request = store.delete(bookId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Eroare la retragerea cărții din Store.'));
  });
}

function seedInitialStoreBooks(): StoreBook[] {
  return [
    {
      id: 'store-1',
      title: 'Zori de Zi peste Carpați',
      author: 'George Coșbuc (Simulat)',
      authorId: 'system-1',
      description: 'O antologie de poezie și proză scurtă care capturează spiritul mistic al munților românești și frumusețea satului patriarhal.',
      coverColor: '#2A4325',
      coverDesign: 'ornate',
      downloadsCount: 142,
      likesCount: 56,
      datePublished: '12.05.2026',
      chapters: [
        {
          id: 'store-1-ch-1',
          title: 'I. Chemarea codrului',
          content: '<p class="my-3 text-justify leading-relaxed indent-4">Codrule, mărite domn, de ce te legeni fără vânt? Sus pe crestele cu brazi falnici se așterne o liniște divină, străpunsă doar de apele repezi care curg la vale spre câmpii.</p><p class="my-3 text-justify leading-relaxed indent-4">Sub mușchiul cald și umed se ascund tainele pământului dacic, pe care strămoșii noștri le-au păzit cu prețul sângelui lor și pe care poeții le cântă în strune de aramă.</p>'
        },
        {
          id: 'store-1-ch-2',
          title: 'II. Legenda muntelui vechi',
          content: '<p class="my-3 text-justify leading-relaxed indent-4">Se spune că în nopțile cu lună plină, pe vârful Omu, bătrânii munților se adună să vorbească cu stelele. Ei poartă căciuli mari de blană și cojoace grele, șoptind descântece vechi pentru rodul pământului.</p>'
        }
      ]
    },
    {
      id: 'store-2',
      title: 'Tainele Nopții de Argint',
      author: 'Eminescu Junior',
      authorId: 'system-2',
      description: 'O feerie romantică în proză de inspirație romantică târzie, plină de metafore nocturne, visare și plimbări solitare pe lacul cu nuferi.',
      coverColor: '#1F3443',
      coverDesign: 'classic',
      downloadsCount: 289,
      likesCount: 112,
      datePublished: '28.05.2026',
      chapters: [
        {
          id: 'store-2-ch-1',
          title: 'Capitolul I - Luna și Lacul',
          content: '<p class="my-3 text-justify leading-relaxed indent-4">O lumină argintie se așternea peste întinderea tremurătoare a apei. Nuferii galbeni și albi păreau mici stele plutitoare căzute din bolta nemărginită direct în somnul adânc al lacului albastru.</p><p class="my-3 text-justify leading-relaxed indent-4">Pasul rătăcitorului se opri pe podul de scânduri vechi. Nicio adiere nu tulbura liniștea acestei nopți mistice în care timpul părea să se fi oprit în loc pentru totdeauna.</p>'
        }
      ]
    }
  ];
}

