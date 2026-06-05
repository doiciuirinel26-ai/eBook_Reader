import React, { useState, useEffect } from 'react';
import { 
  getAuthors, 
  saveAuthor, 
  getDrafts, 
  saveDraft, 
  deleteDraftFromDB, 
  getStoreBooks, 
  saveStoreBook, 
  saveBookToDB 
} from '../utils/db';
import { 
  AuthorProfile, 
  AuthorDraft, 
  StoreBook, 
  Chapter, 
  Book 
} from '../types';
import { parsePdfFile } from '../utils/pdfParser';
import { parseTxtFile } from '../utils/epubParser';
import { useTranslation } from '../utils/localization';
import { 
  User, 
  PenTool, 
  Plus, 
  Trash2, 
  Save, 
  Globe, 
  ArrowLeft, 
  Heart, 
  Download, 
  FileText, 
  LogOut, 
  Palette, 
  Sparkles, 
  BookOpen, 
  Check, 
  Upload, 
  Lock, 
  FileUp, 
  Info,
  Layers,
  Search
} from 'lucide-react';

interface AuthorStoreSuiteProps {
  currentTab: 'author' | 'store';
  onBookImported: (book: Book) => void;
  onNavigateToLibrary: () => void;
}

export function AuthorStoreSuite({ currentTab, onBookImported, onNavigateToLibrary }: AuthorStoreSuiteProps) {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState<AuthorProfile | null>(null);
  
  // Db lists
  const [drafts, setDrafts] = useState<AuthorDraft[]>([]);
  const [storeBooks, setStoreBooks] = useState<StoreBook[]>([]);
  const [userProfile, setUserProfile] = useState<AuthorProfile | null>(null);

  // Authentication and Sign up inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPenName, setAuthPenName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authBio, setAuthBio] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Creator Editor State
  const [editingDraft, setEditingDraft] = useState<AuthorDraft | null>(null);
  const [newDraftTitle, setNewDraftTitle] = useState('');
  const [newDraftDesc, setNewDraftDesc] = useState('');
  const [newDraftCoverColor, setNewDraftCoverColor] = useState('#5C2522');
  const [newDraftCoverDesign, setNewDraftCoverDesign] = useState('classic');

  // Chapter editing inside creator
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);
  const [chapterTitleInput, setChapterTitleInput] = useState('');
  const [chapterContentInput, setChapterContentInput] = useState('');

  // Search and general state
  const [storeSearch, setStoreSearch] = useState('');
  const [creatorMessage, setCreatorMessage] = useState<string | null>(null);
  const [isImportingToChapter, setIsImportingToChapter] = useState(false);
  const [importChapterError, setImportChapterError] = useState<string | null>(null);

  // Load essential items
  useEffect(() => {
    loadStoreAndSession();
  }, []);

  const loadStoreAndSession = async () => {
    // Session is persisted in localStorage for rapid loading
    const cached = localStorage.getItem('lectura_realista_author');
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
      } catch (err) {
        console.error(err);
      }
    }

    try {
      const activeDrafts = await getDrafts();
      setDrafts(activeDrafts);

      const activeStore = await getStoreBooks();
      setStoreBooks(activeStore);
    } catch (err) {
      console.error(err);
    }
  };

  // Reload drafts
  const reloadDraftsList = async () => {
    const list = await getDrafts();
    setDrafts(list);
  };

  // Reload store books
  const reloadStoreList = async () => {
    const list = await getStoreBooks();
    setStoreBooks(list);
  };

  // Handle simple login
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail || !authPassword) {
      setAuthError(t('errorEmailPassword'));
      return;
    }

    try {
      const registeredList = await getAuthors();
      
      if (isRegistering) {
        if (!authName || !authPenName) {
          setAuthError(t('errorNamePenName'));
          return;
        }

        const emailExists = registeredList.some(u => u.email.toLowerCase() === authEmail.toLowerCase());
        if (emailExists) {
          setAuthError(t('errorEmailExists'));
          return;
        }

        const newProfile: AuthorProfile = {
          id: `author-${Date.now()}`,
          name: authName,
          email: authEmail,
          penName: authPenName,
          bio: authBio || t('defaultBio'),
          password: authPassword,
          joinedDate: new Date().toLocaleDateString('ro-RO')
        };

        await saveAuthor(newProfile);
        localStorage.setItem('lectura_realista_author', JSON.stringify(newProfile));
        setCurrentUser(newProfile);
        setCreatorMessage(t('accountCreatedWelcome'));
        loadStoreAndSession();
      } else {
        // Simple authentication check
        const match = registeredList.find(
          u => u.email.toLowerCase() === authEmail.toLowerCase() && u.password === authPassword
        );

        if (match) {
          localStorage.setItem('lectura_realista_author', JSON.stringify(match));
          setCurrentUser(match);
          setCreatorMessage(`${t('welcomeBackPrefix')}${match.penName}!`);
          loadStoreAndSession();
        } else {
          // If empty table, allow to create instantly or say invalid credentials
          if (registeredList.length === 0) {
            setAuthError(t('errorNoAccount'));
          } else {
            setAuthError(t('errorWrongCredentials'));
          }
        }
      }
    } catch (err) {
      setAuthError(t('errorDbQuery'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lectura_realista_author');
    setCurrentUser(null);
    setEditingDraft(null);
  };

  // Draft Creator CRUD
  const handleAddNewDraft = async () => {
    if (!currentUser) return;

    const title = newDraftTitle.trim() || t('untitledDraft');
    const desc = newDraftDesc.trim() || t('defaultDraftDesc');
    
    const newDraft: AuthorDraft = {
      id: `draft-${Date.now()}`,
      title,
      authorId: currentUser.id,
      penName: currentUser.penName,
      description: desc,
      coverColor: newDraftCoverColor,
      coverDesign: newDraftCoverDesign,
      lastUpdated: new Date().toLocaleDateString('ro-RO', {hour: '2-digit', minute: '2-digit'}),
      chapters: [
        {
          id: `draft-ch-${Date.now()}-1`,
          title: t('defaultChapterTitle'),
          content: `<p class="my-3 text-justify leading-relaxed indent-4">${t('defaultChapterContent')}</p>`
        }
      ]
    };

    await saveDraft(newDraft);
    setNewDraftTitle('');
    setNewDraftDesc('');
    await reloadDraftsList();
    setCreatorMessage(t('draftCreatedMsg'));
    // Start editing instantly
    handleStartEditDraft(newDraft);
  };

  const handleStartEditDraft = (draft: AuthorDraft) => {
    setEditingDraft(draft);
    setSelectedChapterIndex(0);
    if (draft.chapters && draft.chapters[0]) {
      setChapterTitleInput(draft.chapters[0].title);
      setChapterContentInput(draft.chapters[0].content);
    } else {
      setChapterTitleInput('');
      setChapterContentInput('');
    }
  };

  const handleSaveCurrentChapterAndDraft = async () => {
    if (!editingDraft) return;

    // Update current chapter state first
    const updatedChapters = [...editingDraft.chapters];
    
    if (updatedChapters[selectedChapterIndex]) {
      updatedChapters[selectedChapterIndex] = {
        ...updatedChapters[selectedChapterIndex],
        title: chapterTitleInput,
        content: chapterContentInput
      };
    } else if (chapterTitleInput.trim()) {
      // safe fallback if adding index
      updatedChapters.push({
        id: `draft-ch-${Date.now()}`,
        title: chapterTitleInput,
        content: chapterContentInput
      });
    }

    const updated: AuthorDraft = {
      ...editingDraft,
      chapters: updatedChapters,
      lastUpdated: new Date().toLocaleDateString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    };

    try {
      await saveDraft(updated);
      setEditingDraft(updated);
      await reloadDraftsList();
      setCreatorMessage(t('chapterSavedMsg'));
      setTimeout(() => setCreatorMessage(null), 3000);
    } catch (err) {
      alert(t('errorSaveDraft'));
    }
  };

  const handleAddNewChapterToDraft = () => {
    if (!editingDraft) return;

    // Auto-save existing first
    const prevChapters = [...editingDraft.chapters];
    if (prevChapters[selectedChapterIndex]) {
      prevChapters[selectedChapterIndex] = {
        ...prevChapters[selectedChapterIndex],
        title: chapterTitleInput,
        content: chapterContentInput
      };
    }

    const nextIndex = prevChapters.length;
    const newCh: Chapter = {
      id: `draft-ch-${Date.now()}-${nextIndex + 1}`,
      title: `${t('chapterN')} ${nextIndex + 1}`,
      content: `<p class="my-3 text-justify leading-relaxed indent-4">${t('writeChapterHere')}</p>`
    };

    const updated: AuthorDraft = {
      ...editingDraft,
      chapters: [...prevChapters, newCh]
    };

    setEditingDraft(updated);
    setSelectedChapterIndex(nextIndex);
    setChapterTitleInput(newCh.title);
    setChapterContentInput(newCh.content);
  };

  const handleDeleteChapter = (indexToDelete: number) => {
    if (!editingDraft || editingDraft.chapters.length <= 1) {
      alert(t('minOneChapter'));
      return;
    }

    if (confirm(t('confirmDeleteChapter'))) {
      const updatedChapters = editingDraft.chapters.filter((_, idx) => idx !== indexToDelete);
      
      const updated: AuthorDraft = {
        ...editingDraft,
        chapters: updatedChapters
      };

      setEditingDraft(updated);
      const newIndex = Math.max(0, indexToDelete - 1);
      setSelectedChapterIndex(newIndex);
      setChapterTitleInput(updatedChapters[newIndex].title);
      setChapterContentInput(updatedChapters[newIndex].content);
    }
  };

  const handleDeleteDraft = async (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('confirmDeleteDraft'))) {
      await deleteDraftFromDB(draftId);
      if (editingDraft?.id === draftId) {
        setEditingDraft(null);
      }
      await reloadDraftsList();
      setCreatorMessage(t('draftDeletedMsg'));
    }
  };

  // Handle direct file import into the chapter text area
  const handleChapterFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportChapterError(null);
    const file = e.target.files?.[0];
    if (!file || !editingDraft) return;

    setIsImportingToChapter(true);
    try {
      let importedText = '';

      if (file.name.toLowerCase().endsWith('.pdf')) {
        const parsedBook = await parsePdfFile(file);
        // Combine parsed chapters into single formatted text block
        importedText = parsedBook.chapters.map(ch => {
          return `<h3 class="font-serif italic font-semibold text-lg text-[#2D2A26] mt-6 mb-2">${ch.title}</h3>\n${ch.content}`;
        }).join('\n\n');
      } else if (file.name.toLowerCase().endsWith('.txt')) {
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string || '');
          reader.onerror = () => reject(new Error(t('errorReadText')));
          reader.readAsText(file);
        });
        const parsedBook = parseTxtFile(text, file.name);
        importedText = parsedBook.chapters.map(ch => {
          return `<h3 class="font-serif italic font-semibold text-lg text-[#2D2A26] mt-6 mb-2">${ch.title}</h3>\n${ch.content}`;
        }).join('\n\n');
      } else {
        throw new Error(t('pdfTxtOnlyImport'));
      }

      setChapterContentInput(prev => prev + '\n\n' + importedText);
      setCreatorMessage(`"${file.name}" ${t('fileImportedEditor')}`);
    } catch (err: any) {
      setImportChapterError(err.message || t('errorImportText'));
    } finally {
      setIsImportingToChapter(false);
      // Reset input element
      e.target.value = '';
    }
  };

  // Publish to Store
  const handlePublishBook = async () => {
    if (!editingDraft) return;

    // Force save first
    const updatedChapters = [...editingDraft.chapters];
    if (updatedChapters[selectedChapterIndex]) {
      updatedChapters[selectedChapterIndex] = {
        ...updatedChapters[selectedChapterIndex],
        title: chapterTitleInput,
        content: chapterContentInput
      };
    }

    const compiledChapters = updatedChapters.map(ch => ({
      ...ch,
      content: ch.content.includes('<p') ? ch.content : ch.content.split('\n\n').map(p => `<p class="my-3 text-justify leading-relaxed indent-4">${p}</p>`).join('')
    }));

    if (compiledChapters.some(ch => !ch.title.trim() || !ch.content.trim())) {
      alert(t('confirmPublishChapters'));
      return;
    }

    const storeId = `store-${editingDraft.id}`;
    const publishedBook: StoreBook = {
      id: storeId,
      title: editingDraft.title,
      author: editingDraft.penName,
      authorId: editingDraft.authorId,
      description: editingDraft.description,
      coverColor: editingDraft.coverColor,
      coverDesign: editingDraft.coverDesign,
      chapters: compiledChapters,
      downloadsCount: 0,
      likesCount: 0,
      datePublished: new Date().toLocaleDateString('ro-RO')
    };

    try {
      await saveStoreBook(publishedBook);
      await reloadStoreList();
      alert(`${t('publishSuccessPrefix')}${editingDraft.title}${t('publishSuccessSuffix')}`);
      setEditingDraft(null);
      onNavigateToLibrary(); // Go back to Library views where they can browse
    } catch (err) {
      alert(t('errorPublish'));
    }
  };

  // Interactive Store Utilities
  const handleLikeStoreBook = async (book: StoreBook, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if user already liked it in session to prevent abuse
    const likedKey = `liked_${book.id}`;
    if (sessionStorage.getItem(likedKey)) {
      alert(t('alreadyLiked'));
      return;
    }

    const updated = {
      ...book,
      likesCount: book.likesCount + 1
    };

    await saveStoreBook(updated);
    sessionStorage.setItem(likedKey, 'true');
    await reloadStoreList();
  };

  const handleDownloadStoreBookToShelf = async (book: StoreBook, e: React.MouseEvent) => {
    e.stopPropagation();

    // Map store book to standard reading book schema
    const newBook: Book = {
      id: `shelf-${book.id}-${Date.now()}`,
      title: book.title,
      author: book.author,
      description: book.description,
      coverColor: book.coverColor,
      coverDesign: book.coverDesign,
      chapters: book.chapters,
      dateAdded: new Date().toLocaleDateString('ro-RO'),
      isCustom: true
    };

    try {
      // Register in library books IndexedDB
      await saveBookToDB(newBook);
      
      // Increment downloads count in Store database too
      const updatedStoreBook = {
        ...book,
        downloadsCount: book.downloadsCount + 1
      };
      await saveStoreBook(updatedStoreBook);
      await reloadStoreList();

      onBookImported(newBook);
      
      alert(`${t('downloadSuccessPrefix')}${book.title}${t('downloadSuccessMid')}${book.author}${t('downloadSuccessSuffix')}`);
    } catch (err) {
      alert(t('errorAddToLibrary'));
    }
  };

  // Filtering store books based on query search
  const filteredStoreBooks = storeBooks.filter(book => 
    book.title.toLowerCase().includes(storeSearch.toLowerCase()) ||
    book.author.toLowerCase().includes(storeSearch.toLowerCase()) ||
    (book.description && book.description.toLowerCase().includes(storeSearch.toLowerCase()))
  );

  // Decorative cover picker colors
  const COVER_COLORS_PALETTE = [
    { rgb: '#5C2522', name: 'Roșu Burgund' },
    { rgb: '#2A4325', name: 'Verde Codru' },
    { rgb: '#1F3443', name: 'Albastru Midnight' },
    { rgb: '#5E3E1A', name: 'Maro Piele' },
    { rgb: '#4A154B', name: 'Violet Regal' },
    { rgb: '#2D2A26', name: 'Negru Carbune' }
  ];

  return (
    <div id="author-store-suite-container" className="max-w-7xl mx-auto w-full px-6 py-8 md:py-12 space-y-10 animate-fade-in">
      
      {/* Upper Status Notifications */}
      {creatorMessage && (
        <div id="creator-toast-info" className="p-4 bg-[#5A5A40]/15 border border-[#5A5A40]/30 rounded-2xl flex items-center justify-between text-[#2D2A26] text-xs font-serif italic animate-scale-up">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#5A5A40]" />
            <span>{creatorMessage}</span>
          </div>
          <button 
            onClick={() => setCreatorMessage(null)}
            className="text-[10px] text-[#8A8178] hover:text-[#2D2A26] uppercase font-mono font-bold"
          >
            {t('closeReader')}
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* ================ AUTHENTICATION PROTECTED ================ */}
      {/* ========================================================= */}
      {currentTab === 'author' && !currentUser && (
        <div id="author-registration-hub" className="max-w-md mx-auto bg-[#FBF9F6] border border-[#E3DDD3] rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#5A5A40]/5 rounded-bl-full pointer-events-none" />
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#5A5A40]/10 rounded-2xl flex items-center justify-center text-[#5A5A40] mx-auto">
              <PenTool className="w-6 h-6" />
            </div>
            <h3 className="font-serif italic font-bold text-xl text-[#2D2A26]">
              {isRegistering ? t('registerAuthorTitle') : t('authorCabinetTitle')}
            </h3>
            <p className="text-xs text-[#8A8178] leading-relaxed font-light">
              {isRegistering ? t('registerAuthorDesc') : t('loginAuthorDesc')}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] text-red-600 flex items-start gap-1.5 font-light">
                <Info className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {isRegistering && (
              <>
                <div>
                  <label className="block text-[10px] font-mono text-[#8A8178] uppercase mb-1">{t('realNameLabel')}</label>
                  <input 
                    type="text" 
                    placeholder="Ion Creangă"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full text-xs p-3 border border-[#E3DDD3] bg-white rounded-xl focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#8A8178] uppercase mb-1">{t('penNamePublicLabel')}</label>
                  <input 
                    type="text" 
                    placeholder="CreaNove"
                    value={authPenName}
                    onChange={(e) => setAuthPenName(e.target.value)}
                    className="w-full text-xs p-3 border border-[#E3DDD3] bg-white rounded-xl focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none transition"
                  />
                  <span className="text-[9px] text-[#8A8178]/80 mt-1 block">{t('penNameHint')}</span>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-[#8A8178] uppercase mb-1">{t('miniBioLabel')}</label>
                  <textarea 
                    placeholder="Scriu basme pentru copii transpuse în epoci realiste."
                    value={authBio}
                    onChange={(e) => setAuthBio(e.target.value)}
                    className="w-full text-xs p-3 h-20 border border-[#E3DDD3] bg-white rounded-xl focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none transition resize-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-mono text-[#8A8178] uppercase mb-1">{t('emailAddressLabel')}</label>
              <input 
                type="email" 
                placeholder="nume@autor.ro"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full text-xs p-3 border border-[#E3DDD3] bg-white rounded-xl focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#8A8178] uppercase mb-1">{t('passwordPinLabel')}</label>
              <input 
                type="password" 
                placeholder="••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full text-xs p-3 border border-[#E3DDD3] bg-white rounded-xl focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="w-full p-3.5 bg-[#5A5A40] hover:bg-[#484833] text-[#F5F2ED] text-xs font-mono font-bold rounded-xl shadow-sm transition"
            >
              {isRegistering ? t('createAccountBtn') : t('enterCabinetBtn')}
            </button>
          </form>

          <div className="border-t border-[#E3DDD3] pt-4 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setAuthError(null);
              }}
              className="text-xs text-[#5A5A40] hover:underline font-mono"
            >
              {isRegistering ? t('alreadyHaveAccount') : t('newAuthorSignup')}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ================ CABINETUL AUTORULUI LOGAT ================ */}
      {/* ========================================================= */}
      {currentTab === 'author' && currentUser && !editingDraft && (
        <div id="author-dashboard-view" className="space-y-10 animate-scale-up">
          
          {/* User Profile Stats Card */}
          <div className="p-6 bg-[#FBF9F6] border border-[#E3DDD3] rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider">{t('authorRegisteredLocal')}</span>
              </div>
              <h3 className="font-serif italic font-bold text-3xl text-[#2D2A26]">{currentUser.penName}</h3>
              <p className="text-[11px] font-mono text-[#8A8178]">{t('profileLinkedTo')}: {currentUser.name} | {t('enrolledOn')}: {currentUser.joinedDate}</p>
              <p className="text-xs text-[#8A8178] leading-relaxed font-light font-serif italic max-w-xl">
                „{currentUser.bio}”
              </p>
            </div>

            <div className="md:col-span-4 flex justify-end items-center gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-[#FAF8F5] hover:bg-red-50 text-[#8A8178] hover:text-red-700 border border-[#E3DDD3] hover:border-red-100 rounded-xl text-xs font-mono transition flex items-center gap-2"
                title={t('logoutTitle')}
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left box: Create Book draft form */}
            <div className="lg:col-span-5 bg-white border border-[#E3DDD3] rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-2 justify-between border-b border-[#E3DDD3]/80 pb-3">
                <h4 className="font-serif italic font-bold text-lg text-[#2D2A26]">{t('createNewWork')}</h4>
                <Sparkles className="w-4 h-4 text-[#5A5A40]" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-[#8A8178] uppercase mb-1">{t('volumeTitleLabel')}</label>
                  <input 
                    type="text" 
                    placeholder={t('volumeTitlePlaceholder')}
                    value={newDraftTitle}
                    onChange={(e) => setNewDraftTitle(e.target.value)}
                    className="w-full text-xs p-3 border border-[#E3DDD3] bg-white rounded-xl focus:border-[#5A5A40] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#8A8178] uppercase mb-1">{t('synopsisLabel')}</label>
                  <textarea 
                    placeholder={t('synopsisPlaceholder')}
                    value={newDraftDesc}
                    onChange={(e) => setNewDraftDesc(e.target.value)}
                    className="w-full text-xs p-3 h-20 border border-[#E3DDD3] bg-white rounded-xl focus:border-[#5A5A40] outline-none transition resize-none"
                  />
                </div>

                {/* Cover Colors Customization */}
                <div>
                  <label className="block text-[10px] font-mono text-[#8A8178] uppercase mb-2">{t('coverColorLabel')}</label>
                  <div className="grid grid-cols-6 gap-2">
                    {COVER_COLORS_PALETTE.map((palette) => (
                      <button
                        key={palette.rgb}
                        onClick={() => setNewDraftCoverColor(palette.rgb)}
                        className={`w-full aspect-square rounded-lg border-2 transition ${
                          newDraftCoverColor === palette.rgb ? 'border-amber-600 scale-105' : 'border-transparent hover:scale-102'
                        }`}
                        style={{ backgroundColor: palette.rgb }}
                        title={palette.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Cover Design select style */}
                <div>
                  <label className="block text-[10px] font-mono text-[#8A8178] uppercase mb-1">{t('coverStyleLabel')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['classic', 'minimalist', 'geometric', 'ornate'].map((design) => (
                      <button
                        key={design}
                        onClick={() => setNewDraftCoverDesign(design)}
                        className={`py-2 px-3 text-[11px] font-mono uppercase rounded-xl border text-center transition ${
                          newDraftCoverDesign === design 
                            ? 'bg-[#5A5A40]/10 border-[#5A5A40] text-[#5A5A40] font-bold' 
                            : 'border-[#E3DDD3] text-[#8A8178] hover:text-[#2D2A26] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        {design}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleAddNewDraft}
                  disabled={!newDraftTitle.trim()}
                  className={`w-full p-3 bg-[#5A5A40] hover:bg-[#484833] text-[#F5F2ED] text-xs font-mono font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 ${
                    !newDraftTitle.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {t('createDraftBtn')}
                </button>
              </div>
            </div>

            {/* Right box: Active drafts list */}
            <div className="lg:col-span-7 bg-white border border-[#E3DDD3] rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-2 justify-between border-b border-[#E3DDD3]/80 pb-3">
                <h4 className="font-serif italic font-bold text-lg text-[#2D2A26]">{t('yourSavedDrafts')}</h4>
                <span className="text-[10px] text-[#8A8178] font-mono uppercase font-bold bg-[#8A8178]/10 px-2.5 py-1 rounded-full border border-[#8A8178]/15">
                  Drafts: {drafts.filter(d => d.authorId === currentUser.id).length}
                </span>
              </div>

              {drafts.filter(d => d.authorId === currentUser.id).length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border border-dashed border-[#D8D2C6] flex items-center justify-center text-[#8A8178] mx-auto">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-[#8A8178] font-mono">{t('noActiveDrafts')}</p>
                  <p className="text-[11px] text-[#8A8178]/80 leading-relaxed font-light">{t('noDraftsHint')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {drafts.filter(d => d.authorId === currentUser.id).map(draft => (
                    <div
                      key={draft.id}
                      onClick={() => handleStartEditDraft(draft)}
                      className="p-4 bg-[#FAF8F5]/50 border border-[#E3DDD3] hover:border-[#5A5A40] rounded-2xl flex items-center justify-between cursor-pointer group transition duration-300 shadow-2xs"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Fake leather icon display to view cover aesthetic style */}
                        <div 
                          className="w-12 h-16 rounded-md shadow-sm border border-black/10 flex-shrink-0 flex items-center justify-center text-white relative overflow-hidden"
                          style={{ backgroundColor: draft.coverColor }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-black/15 to-transparent pointer-events-none" />
                          <span className="text-[6px] font-mono text-center px-1 font-bold truncate select-none leading-none opacity-80 uppercase">
                            {draft.coverDesign}
                          </span>
                        </div>
                        
                        <div className="min-w-0">
                          <h5 className="font-serif font-bold text-sm text-[#2D2A26] line-clamp-1 group-hover:text-[#5A5A40] transition">
                            {draft.title}
                          </h5>
                          <p className="text-[10px] text-[#8A8178] truncate">{t('levelLabel')}: {draft.chapters?.length || 0} {t('chaptersWritten')}</p>
                          <p className="text-[9px] text-[#8A8178]/70 mt-1 font-mono">{t('lastSaved')}: {draft.lastUpdated}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#5A5A40] opacity-0 group-hover:opacity-100 transition duration-200">{t('writeNow')}</span>
                        <button
                          onClick={(e) => handleDeleteDraft(draft.id, e)}
                          className="p-2 border border-transparent hover:border-red-100 hover:bg-red-50 text-[#8A8178] hover:text-red-600 rounded-xl transition flexItems"
                          title={t('deleteDraftTitle')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ================== ACTIVE DRAFT EDITOR =================== */}
      {/* ========================================================= */}
      {currentTab === 'author' && currentUser && editingDraft && (
        <div id="editing-draft-workspace" className="space-y-6 animate-scale-up">
          
          {/* Header Editor Block */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E3DDD3] pb-5">
            <div className="flex items-center gap-3">
              <button
                id="back-to-cabinet-btn"
                onClick={() => setEditingDraft(null)}
                className="p-2 bg-white border border-[#E3DDD3] hover:border-[#8A8178] hover:bg-[#FAF8F5] text-[#5A5A40] rounded-xl transition flex items-center justify-center"
                title={t('backToCabinetTitle')}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[10px] font-mono text-[#8A8178] uppercase">{t('editingDraftLabel')}</span>
                <h3 className="font-serif italic font-bold text-2xl text-[#2D2A26] flex items-center gap-2">
                  {editingDraft.title}
                  <span className="text-xs font-mono font-medium not-italic bg-[#5A5A40]/10 text-[#5A5A40] px-2 py-0.5 rounded border border-[#5A5A40]/15">
                    {t('authorPrefix')} {editingDraft.penName}
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleSaveCurrentChapterAndDraft}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-[#FAF8F6] hover:bg-[#E3DDD3] text-[#2D2A26] border border-[#E3DDD3] font-mono text-xs rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {t('saveDraftBtn')}
              </button>

              <button
                onClick={handlePublishBook}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white font-serif italic text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Globe className="w-4 h-4" />
                {t('publishToStore')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Chapters scroller column */}
            <div className="lg:col-span-3 bg-white border border-[#E3DDD3] rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E3DDD3]/70 pb-3">
                <span className="text-[10px] font-mono text-[#2D2A26] uppercase font-bold">{t('chapterMapLabel')}</span>
                <button
                  onClick={handleAddNewChapterToDraft}
                  className="p-1 hover:bg-[#FAF8F5] text-[#5A5A40] border border-[#E3DDD3] rounded-md transition flex items-center justify-center gap-0.5 text-[10px] font-mono font-bold"
                  title={t('addChapterBtn')}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t('addChapterBtn')}
                </button>
              </div>

              <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                {editingDraft.chapters.map((ch, idx) => {
                  const isActive = idx === selectedChapterIndex;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => {
                        // Auto-save previous
                        const chapters = [...editingDraft.chapters];
                        if (chapters[selectedChapterIndex]) {
                          chapters[selectedChapterIndex] = {
                            ...chapters[selectedChapterIndex],
                            title: chapterTitleInput,
                            content: chapterContentInput
                          };
                          setEditingDraft({
                            ...editingDraft,
                            chapters
                          });
                        }

                        setSelectedChapterIndex(idx);
                        setChapterTitleInput(ch.title);
                        setChapterContentInput(ch.content);
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between group ${
                        isActive
                          ? 'border-[#5A5A40] bg-[#5A5A40]/10 text-[#2D2A26] font-bold'
                          : 'border-transparent text-[#8A8178] hover:text-[#2D2A26] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-[9px] font-mono uppercase text-[#8A8178] group-hover:text-black">{t('sectionN')} {idx + 1}</p>
                        <p className="text-xs truncate font-serif italic">{ch.title || t('untitledChapter')}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChapter(idx);
                        }}
                        className="p-1 rounded text-[#8A8178]/50 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
                        title={t('deleteSectionTitle')}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Writer Prose editor Column */}
            <div className="lg:col-span-9 space-y-4">
              
              <div className="bg-white border border-[#E3DDD3] rounded-2xl p-5 md:p-6 space-y-4 shadow-2xs">
                
                {/* Chapter metadata title edit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-[#8A8178] uppercase mb-1">{t('currentChapterTitleLabel')}</label>
                    <input
                      type="text"
                      value={chapterTitleInput}
                      onChange={(e) => setChapterTitleInput(e.target.value)}
                      placeholder={t('chapterTitlePlaceholder')}
                      className="w-full text-xs font-bold font-serif italic p-3 border border-[#E3DDD3] bg-white rounded-xl focus:border-[#5A5A40] outline-none transition"
                    />
                  </div>

                  {/* Direct File TXT/PDF Injector section */}
                  <div>
                    <label className="block text-[10px] font-mono text-[#8A8178] uppercase mb-1">
                      {t('orUploadChapter')}
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".txt,.pdf"
                        onChange={handleChapterFileImport}
                        id="chapter-file-picker"
                        className="hidden"
                        disabled={isImportingToChapter}
                      />
                      <label
                        htmlFor="chapter-file-picker"
                        className={`w-full text-xs p-3 border border-[#E3DDD3] hover:border-[#5A5A40] bg-[#FAF8F5]/50 hover:bg-white rounded-xl transition cursor-pointer flex items-center justify-center gap-2 text-[#8A8178] hover:text-[#5A5A40] ${
                          isImportingToChapter ? 'opacity-50 cursor-wait' : ''
                        }`}
                      >
                        {isImportingToChapter ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-[#5A5A40] border-t-transparent rounded-full animate-spin" />
                            {t('analyzingText')}
                          </>
                        ) : (
                          <>
                            <FileUp className="w-4 h-4" />
                            {t('chooseFilePdfTxt')}
                          </>
                        )}
                      </label>
                    </div>
                    {importChapterError && (
                      <p className="text-[10px] text-red-600 mt-1">{importChapterError}</p>
                    )}
                  </div>
                </div>

                {/* Prose Textarea editor */}
                <div>
                  <div className="flex justify-between items-center mb-1 bg-[#FAF8F5] p-2 border border-[#E3DDD3] rounded-t-xl text-[10px] text-[#8A8178] font-mono">
                    <span>{t('proseContentLabel')}</span>
                    <span className="flex items-center gap-1">
                      <Info className="w-3 h-3 text-[#5A5A40]" />
                      {t('useSimpleParagraphs')}
                    </span>
                  </div>
                  <textarea
                    value={chapterContentInput}
                    onChange={(e) => setChapterContentInput(e.target.value)}
                    placeholder={t('writeNovelHere')}
                    className="w-full text-sm font-serif p-5 h-[320px] border-x border-b border-[#E3DDD3] bg-[#FAF8F5]/30 rounded-b-xl focus:bg-white focus:border-[#5A5A40] outline-none transition font-light leading-relaxed resize-none"
                  />
                </div>

                <div className="flex justify-between items-center text-[10.5px] font-mono text-[#8A8178] pt-2">
                  <p>{t('charCount')}: {chapterContentInput.length} | {t('estimatedWords')}: {chapterContentInput.split(/\s+/).filter(Boolean).length}</p>
                  <p className="flex items-center gap-1 select-none">
                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                    {t('autoSaveLocal')}
                  </p>
                </div>

              </div>

              {/* Informative advice for Romanian Authors */}
              <div className="p-4 bg-[#FAF8F5] border border-[#E3DDD3] rounded-2xl flex gap-3 text-xs text-[#8A8178] leading-relaxed font-light">
                <Info className="w-5 h-5 text-[#5A5A40] flex-shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-1">
                  <p className="font-semibold text-[#2D2A26]">{t('editorTipTitle')}</p>
                  <p>{t('editorTipText')}</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* =================== THE PUBLIC STORE ==================== */}
      {/* ========================================================= */}
      {currentTab === 'store' && (
        <div id="literary-marketplace-view" className="space-y-8 animate-scale-up">
          
          {/* Marketplace Banner Intro */}
          <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-xs">
            <div className="md:col-span-8 space-y-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600/10 text-amber-800 font-mono text-[9px] uppercase font-bold rounded-full border border-amber-600/15">
                <Globe className="w-3.5 h-3.5 text-amber-700" />
                {t('communityStoreBadge')}
              </span>
              <h3 className="font-serif italic font-bold text-2xl md:text-3xl text--[#2D2A26] leading-tight">
                {t('storeDiscoverTitle')}
              </h3>
              <p className="text-xs text-[#8A8178] font-light leading-relaxed max-w-2xl">
                {t('storeDiscoverDesc')}
              </p>
            </div>

            <div className="md:col-span-4 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8A8178] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder={t('storeSearchPlaceholder')}
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-3 bg-white border border-[#E3DDD3] rounded-full focus:border-[#5A5A40] outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Store Catalog Books grid */}
          {filteredStoreBooks.length === 0 ? (
            <div className="py-24 border border-dashed border-[#D8D2C6] rounded-3xl text-center space-y-4 max-w-lg mx-auto bg-white/50">
              <div className="w-10 h-10 rounded-full border border-[#D8D2C6] flex items-center justify-center text-[#8A8178] mx-auto bg-white">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-xs text-[#2D2A26] font-bold">{t('noSearchResults')}</p>
              <p className="text-[11px] text-[#8A8178] font-light leading-relaxed">{t('noSearchResultsHint')}</p>
            </div>
          ) : (
            <div id="store-bookshelf-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStoreBooks.map((book) => {
                const alreadyLiked = sessionStorage.getItem(`liked_${book.id}`);
                return (
                  <div
                    key={book.id}
                    id={`store-card-${book.id}`}
                    className="bg-white border border-[#E3DDD3] hover:border-[#D8D2C6] hover:shadow-lg rounded-2xl p-5 flex flex-col justify-between transition duration-300 relative overflow-hidden group"
                  >
                    {/* Decorative elegant top cover accent */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 opacity-85" style={{ backgroundColor: book.coverColor }} />

                    <div className="space-y-4">
                      {/* Interactive 3D cover layout presentation represent */}
                      <div 
                        className="w-24 h-32 rounded-lg py-3 px-2 text-white flex flex-col justify-between shadow-md relative overflow-hidden mx-auto transition-transform duration-300 group-hover:scale-105 border border-black/10 select-none cursor-pointer"
                        style={{ backgroundColor: book.coverColor }}
                        onClick={(e) => handleDownloadStoreBookToShelf(book, e)}
                        title={t('downloadThisBook')}
                      >
                        {/* Dynamic decorative layouts */}
                        {book.coverDesign === 'ornate' && (
                          <div className="absolute inset-1.5 border border-amber-400/30 rounded flex flex-col justify-between p-1.5" />
                        )}
                        {book.coverDesign === 'geometric' && (
                          <div className="absolute -right-6 -bottom-6 w-16 h-16 border-2 border-white/15 rounded-full" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-white/5 pointer-events-none" />

                        <div>
                          <p className="text-[9px] font-mono opacity-80 uppercase tracking-widest truncate">{book.author}</p>
                          <h5 className="font-serif italic text-xs font-bold leading-snug line-clamp-3 mt-1 text-amber-50">{book.title}</h5>
                        </div>

                        <div className="flex justify-between items-center border-t border-white/20 pt-1 text-[8px] font-mono opacity-80">
                          <span>{book.coverDesign}</span>
                          <span className="bg-white/10 px-1 rounded">STORE</span>
                        </div>
                      </div>

                      <div className="text-center space-y-1">
                        <h4 className="font-serif font-bold text-sm text-[#2D2A26] line-clamp-1">{book.title}</h4>
                        <p className="text-[10px] text-[#8A8178] font-mono uppercase">{t('authorPrefix')} {book.author}</p>
                      </div>

                      <p className="text-[11px] text-[#8A8178] leading-relaxed font-light text-center line-clamp-3 min-h-[50px] bg-[#FAF8F5]/40 p-2.5 rounded-xl border border-[#FAF8F5]">
                        {book.description || t('noDescriptionByAuthor')}
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-[#E3DDD3]/50 mt-4">
                      
                      {/* Social counts metrics block stats */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#8A8178]">
                        <span className="flex items-center gap-1">
                          <Download className="w-3.5 h-3.5 text-[#5A5A40]" />
                          <b>{book.downloadsCount || 0}</b> {t('downloadsLabel')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                          <b>{book.likesCount || 0}</b> {t('likesLabel')}
                        </span>
                      </div>

                      {/* Downloads and love app buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleLikeStoreBook(book, e)}
                          className={`p-2 border rounded-xl transition ${
                            alreadyLiked 
                              ? 'bg-red-50 border-red-200 text-red-600' 
                              : 'bg-white border-[#E3DDD3] hover:border-red-200 text-[#8A8178] hover:text-red-600 hover:bg-red-50/20'
                          }`}
                          title={t('likeBookTitle')}
                        >
                          <Heart className={`w-4 h-4 ${alreadyLiked ? 'fill-red-600' : ''}`} />
                        </button>

                        <button
                          onClick={(e) => handleDownloadStoreBookToShelf(book, e)}
                          className="flex-1 py-2 bg-[#5A5A40] hover:bg-[#484833] active:scale-98 text-white text-[11px] font-mono font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {t('downloadToShelf')}
                        </button>
                      </div>

                      <div className="text-center">
                        <span className="text-[8px] font-mono text-[#8A8178]/60 uppercase tracking-widest">
                          {t('publishedOn')}: {book.datePublished}
                        </span>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
