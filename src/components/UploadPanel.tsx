import React, { useState, useRef } from 'react';
import { Upload, BookOpen, AlertCircle, FileText, CheckCircle2, ChevronRight, FileCode, Keyboard } from 'lucide-react';
import { parseEpubFile, parseTxtFile } from '../utils/epubParser';
import { parsePdfFile } from '../utils/pdfParser';
import { Book } from '../types';
import { useTranslation } from '../utils/localization';

interface UploadPanelProps {
  onImportSuccess: (book: Book) => void;
  onClose: () => void;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({ onImportSuccess, onClose }) => {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'file' | 'paste'>('file');

  const [pasteTitle, setPasteTitle] = useState<string>('');
  const [pasteAuthor, setPasteAuthor] = useState<string>('');
  const [pasteContent, setPasteContent] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processSelectedFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processSelectedFile(file);
    }
  };

  const clickInput = () => {
    fileInputRef.current?.click();
  };

  const processSelectedFile = async (file: File) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let book: Book;
      if (file.name.toLowerCase().endsWith('.epub')) {
        book = await parseEpubFile(file);
      } else if (file.name.toLowerCase().endsWith('.pdf')) {
        book = await parsePdfFile(file);
      } else if (file.name.toLowerCase().endsWith('.txt')) {
        const text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string || '');
          reader.onerror = () => reject(new Error(t('errorReadTextFile')));
          reader.readAsText(file);
        });
        book = parseTxtFile(text, file.name);
      } else {
        throw new Error(t('errorUnsupportedFormat'));
      }

      onImportSuccess(book);
      setSuccessMsg(`„${book.title}" ${t('bookImportedSuccess')}`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || t('errorImportUnexpected'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const title = pasteTitle.trim();
    const author = pasteAuthor.trim() || t('unknownAuthor');
    const content = pasteContent.trim();

    if (!title || !content) {
      setErrorMsg(t('errorFillTitleContent'));
      return;
    }

    setLoading(true);
    try {
      const book = parseTxtFile(content, `${title}.txt`);
      book.author = author;
      
      onImportSuccess(book);
      setSuccessMsg(`„${book.title}" ${t('bookCreatedSuccess')}`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(t('errorProcessPastedText'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="upload-panel-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        id="upload-panel-container"
        className="relative w-full max-w-2xl bg-white border border-[#E3DDD3] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-[#4A443F]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#5A5A40] via-[#8A8178] to-[#5A5A40]" />

        <div className="px-6 pt-6 pb-4 border-b border-[#E3DDD3] flex items-center justify-between bg-[#FBF9F6]">
          <div>
            <h3 className="text-xl font-serif italic font-bold text-[#2D2A26] flex items-center gap-2">
              <Upload className="w-5.5 h-5.5 text-[#5A5A40]" />
              {t('uploadPanelTitle')}
            </h3>
            <p className="text-xs text-[#8A8178] mt-1">
              {t('uploadPanelSubtitle')}
            </p>
          </div>
          <button 
            id="close-upload-btn"
            onClick={onClose}
            className="p-1 px-3 text-sm text-[#8A8178] hover:text-[#2D2A26] hover:bg-[#FAF8F5] rounded-lg transition-all duration-200 border border-transparent hover:border-[#E3DDD3]"
          >
            {t('closeReader')}
          </button>
        </div>

        <div className="flex border-b border-[#E3DDD3] font-mono text-xs text-[#8A8178] bg-[#FBF9F6]">
          <button
            id="tab-import-file"
            className={`flex-1 py-3 text-center flex items-center justify-center gap-2 border-b-2 hover:bg-[#FAF8F5]/80 transition-all ${
              importMode === 'file' ? 'border-[#5A5A40] text-[#5A5A40] bg-[#FAF8F5]' : 'border-transparent'
            }`}
            onClick={() => { setImportMode('file'); setErrorMsg(null); }}
          >
            <FileCode className="w-4 h-4" />
            {t('tabImportFile')}
          </button>
          
          <button
            id="tab-import-paste"
            className={`flex-1 py-3 text-center flex items-center justify-center gap-2 border-b-2 hover:bg-[#FAF8F5]/80 transition-all ${
              importMode === 'paste' ? 'border-[#5A5A40] text-[#5A5A40] bg-[#FAF8F5]' : 'border-transparent'
            }`}
            onClick={() => { setImportMode('paste'); setErrorMsg(null); }}
          >
            <Keyboard className="w-4 h-4" />
            {t('tabImportPaste')}
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow bg-white">
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5 animate-pulse">
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-[#5A5A40]/10 border border-[#5A5A40]/30 text-[#2D2A26] rounded-xl text-xs flex items-center gap-2.5 animate-bounce">
              <CheckCircle2 className="w-4.5 h-4.5 text-[#5A5A40]" />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 border-4 border-[#5A5A40] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-mono text-[#2D2A26]">
                {t('parsingChapters')}
              </p>
              <span className="text-[10px] text-[#8A8178] font-serif">{t('waitStructuring3D')}</span>
            </div>
          ) : importMode === 'file' ? (
            <div 
              id="file-dropzone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={clickInput}
              className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-[#5A5A40] bg-[#FAF8F5] shadow-inner' 
                  : 'border-[#D8D2C6] hover:border-[#5A5A40] bg-[#FBF9F6]/50 hover:bg-[#FAF8F5]'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".epub,.txt,.pdf"
                onChange={handleFileChange}
              />

              <div className="w-16 h-16 bg-white border border-[#E3DDD3] rounded-2xl flex items-center justify-center text-[#5A5A40] group-hover:scale-110 duration-200 mb-4 shadow-sm">
                <Upload className="w-8 h-8" />
              </div>

              <h4 className="font-serif italic text-lg font-bold text-[#2D2A26]">
                {t('dragOrClickFile')}
              </h4>
              
              <div className="flex items-center gap-2 mt-2 text-[#8A8178] text-xs font-light">
                <FileText className="w-4 h-4 text-[#5A5A40]" />
                <span>{t('supportedFormatsNote')}</span>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full p-4 bg-[#FAF8F5] border border-[#E3DDD3] rounded-xl text-left shadow-xs">
                <div>
                  <h5 className="font-semibold text-[#2D2A26] text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#5A5A40] rounded-full" />
                    {t('formatEpub')}
                  </h5>
                  <p className="text-[10px] text-[#8A8178] mt-1 leading-normal">
                    {t('formatEpubDesc')}
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold text-[#2D2A26] text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#5A5A40]/75 rounded-full" />
                    {t('formatPdf')}
                  </h5>
                  <p className="text-[10px] text-[#8A8178] mt-1 leading-normal">
                    {t('formatPdfDesc')}
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold text-[#2D2A26] text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#8A8178] rounded-full" />
                    {t('formatTxt')}
                  </h5>
                  <p className="text-[10px] text-[#8A8178] mt-1 leading-normal">
                    {t('formatTxtDesc')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form id="paste-text-form" onSubmit={handlePasteSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#8A8178] mb-1.5">{t('bookTitleLabel')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('bookTitlePlaceholder')}
                    value={pasteTitle}
                    onChange={(e) => setPasteTitle(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E3DDD3] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40]/20 text-[#2D2A26] rounded-xl px-4 py-2.5 text-sm transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8A8178] mb-1.5">{t('authorName').toUpperCase()}</label>
                  <input
                    type="text"
                    placeholder={t('authorOptionalPlaceholder')}
                    value={pasteAuthor}
                    onChange={(e) => setPasteAuthor(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E3DDD3] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40]/20 text-[#2D2A26] rounded-xl px-4 py-2.5 text-sm transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8A8178] mb-1.5">{t('contentLabel')}</label>
                <textarea
                  required
                  rows={8}
                  placeholder={t('pasteContentPlaceholder')}
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E3DDD3] focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40]/20 text-[#2D2A26] rounded-xl px-4 py-3 text-sm font-sans transition-all outline-none resize-none font-light leading-relaxed"
                />
                <p className="text-[10px] text-[#8A8178] mt-1 italic">
                  {t('pasteChapterTip')}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E3DDD3] flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5A5A40] hover:bg-[#484833] active:scale-95 text-[#F5F2ED] font-serif italic text-sm rounded-full transition-all duration-200 flex items-center gap-1.5 shadow-sm"
                >
                  {t('createBookBtn')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="p-4 bg-[#FBF9F6] border-t border-[#E3DDD3] text-center text-[10px] text-[#8A8178] font-mono flex items-center justify-center gap-1">
          <BookOpen className="w-3.5 h-3.5 text-[#5A5A40]" />
          <span>{t('localStorageNote')}</span>
        </div>
      </div>
    </div>
  );
};
