import React, { useEffect, useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  XCircle,
  Trash2,
  Download,
  Folder,
} from "lucide-react";

// In a real app, you would import Poppins via CSS or a CDN link
// e.g., in public/index.html or a main CSS file
// @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

// Enhanced EmailEditor Component
const EmailEditor = ({ initialHtmlContent, onHtmlContentChange, onFocus }) => {
  const [htmlContent, setHtmlContent] = useState(initialHtmlContent || "");
  const [currentTextColor, setCurrentTextColor] = useState("#000000");
  const [currentBackgroundColor, setCurrentBackgroundColor] = useState("#FFFFFF");
  const [activeBlock, setActiveBlock] = useState("P");
  const editorRef = useRef(null);
  const editorContentId = "email-editor-content";
  const isEditorEmpty = (() => {
    const textOnly = (htmlContent || '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
    return textOnly.length === 0;
  })();

  const fontFamilies = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Trebuchet MS",
    "Comic Sans MS",
    "Impact",
    "Poppins", // Change this to Poppins
  ];

  // Function to update the HTML content state and trigger parent callback
  const updateHtmlContent = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtmlContent(newHtml);
      if (onHtmlContentChange) {
        onHtmlContentChange(newHtml);
      }
      // Update activeBlock based on current selection's parent node
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        let parentBlock = selection.getRangeAt(0).startContainer.parentNode;
        while (
          parentBlock &&
          parentBlock !== editorRef.current &&
          !["H1", "H2", "H3", "H4", "P", "UL", "OL"].includes(parentBlock.nodeName)
        ) {
          parentBlock = parentBlock.parentNode;
        }
        if (parentBlock && parentBlock !== editorRef.current) {
          setActiveBlock(parentBlock.nodeName);
        } else {
          setActiveBlock("P");
        }
      }
    }
  };

  // Execute a document.execCommand
  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateHtmlContent(); // Update content after command execution
  };

  // Check if a command is active (for styling toolbar buttons)
  const isCommandActive = (command) => {
    if (!editorRef.current) return false;
    return document.queryCommandState(command);
  };

  // Handle font family change
  const handleFontFamily = (family) => {
    executeCommand("fontName", family);
  };

  // Handle text color change
  const handleTextColor = (color) => {
    executeCommand("foreColor", color);
    setCurrentTextColor(color);
  };

  // Handle background color change (highlight)
  const handleBackgroundColor = (color) => {
    executeCommand("hiliteColor", color);
    setCurrentBackgroundColor(color);
  };

  // Clear text color
  const clearTextColor = () => {
    executeCommand("foreColor", "#000000"); // Reset to black
    setCurrentTextColor("#000000");
  };

  // Clear background color
  const clearBackgroundColor = () => {
    executeCommand("hiliteColor", "#FFFFFF"); // Reset to white
    setCurrentBackgroundColor("#FFFFFF");
  };

  // Handle block format change (H1, H2, P, etc.)
  const handleFormatBlock = (blockTag) => {
    if (activeBlock === blockTag) {
      // If the clicked heading is already active, revert to paragraph
      executeCommand("formatBlock", "<P>");
      setActiveBlock("P");
    } else {
      executeCommand("formatBlock", `<${blockTag}>`);
      setActiveBlock(blockTag);
    }
  };

  // Apply default styles for contentEditable elements (lists, headings)
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.innerHTML = `
            #${editorContentId} ul {
                list-style-type: disc;
                list-style-position: inside;
                padding-left: 20px;
            }
            #${editorContentId} ol {
                list-style-type: decimal;
                list-style-position: inside;
                padding-left: 20px;
            }
            #${editorContentId} li {
                margin-bottom: 4px;
            }
            /* Default heading styles for contentEditable */
            #${editorContentId} h1 { font-size: 2em; margin-top: 0.67em; margin-bottom: 0.67em; font-weight: bold; }
            #${editorContentId} h2 { font-size: 1.5em; margin-top: 0.83em; margin-bottom: 0.83em; font-weight: bold; }
            #${editorContentId} h3 { font-size: 1.17em; margin-top: 1em; margin-bottom: 1em; font-weight: bold; }
            #${editorContentId} h4 { font-size: 1em; margin-top: 1.33em; margin-bottom: 1.33em; font-weight: bold; }
            #${editorContentId} p { margin-top: 1em; margin-bottom: 1em; }
        `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [editorContentId]);

  // Initialize editor content when initialHtmlContent prop changes
  useEffect(() => {
    if (editorRef.current && initialHtmlContent !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = initialHtmlContent;
      setHtmlContent(editorRef.current.innerHTML);
    }
  }, [initialHtmlContent]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
      {/* Toolbar */}
      <div className="bg-gray-100 border-b border-gray-200 p-4">
        <div className="flex flex-wrap gap-1 items-center">
          {/* Basic Formatting */}
          <div className="flex gap-1 border-r border-gray-200 pr-4">
            <button
              onClick={() => executeCommand("bold")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${isCommandActive("bold") ? "bg-gray-800 text-white" : "bg-white text-gray-700"
                }`}
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => executeCommand("italic")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${isCommandActive("italic")
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-700"
                }`}
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => executeCommand("underline")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${isCommandActive("underline")
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-700"
                }`}
              title="Underline"
            >
              <Underline size={16} />
            </button>
          </div>

          {/* Heading Formatting */}
          <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
            <button
              onClick={() => handleFormatBlock("H1")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors text-sm font-bold ${activeBlock === "H1" ? "bg-gray-800 text-white" : "bg-white text-gray-700"
                }`}
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => handleFormatBlock("H2")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors text-sm font-bold ${activeBlock === "H2" ? "bg-gray-800 text-white" : "bg-white text-gray-700"
                }`}
              title="Heading 2"
            >
              H2
            </button>
            <button
              onClick={() => handleFormatBlock("H3")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors text-sm font-bold ${activeBlock === "H3" ? "bg-gray-800 text-white" : "bg-white text-gray-700"
                }`}
              title="Heading 3"
            >
              H3
            </button>
            <button
              onClick={() => handleFormatBlock("H4")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors text-sm font-bold ${activeBlock === "H4" ? "bg-gray-800 text-white" : "bg-white text-gray-700"
                }`}
              title="Heading 4"
            >
              H4
            </button>
          </div>

          {/* Font Family */}
          <div className="border-r border-gray-200 pr-4">
            <select
              onChange={(e) => handleFontFamily(e.target.value)}
              className="p-2 border border-gray-300 rounded bg-white text-sm min-w-[140px] text-gray-700 focus:ring-2 focus:ring-gray-300 focus:border-transparent"
              defaultValue="Poppins, sans-serif"
            >
              {fontFamilies.map((family) => (
                <option key={family} value={`${family}, sans-serif`}>
                  {family}
                </option>
              ))}
            </select>
          </div>

          {/* Colors */}
          <div className="flex gap-2 border-r border-gray-200 pr-4 items-center">
            <div className="flex items-center gap-1">
              <Palette size={16} className="text-gray-600" />
              <input
                type="color"
                value={currentTextColor}
                onChange={(e) => handleTextColor(e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                title="Text Color"
              />
              {currentTextColor !== "#000000" && (
                <button
                  onClick={clearTextColor}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                  title="Clear Text Color"
                >
                  <XCircle size={16} className="text-gray-500" />
                </button>
              )}
            </div>
            <input
              type="color"
              value={currentBackgroundColor}
              onChange={(e) => handleBackgroundColor(e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              title="Highlight Color"
            />
            {currentBackgroundColor !== "#FFFFFF" && (
              <button
                onClick={clearBackgroundColor}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                title="Clear Highlight Color"
              >
                <XCircle size={16} className="text-gray-500" />
              </button>
            )}
          </div>

          {/* Alignment */}
          <div className="flex gap-1 border-r border-gray-200 pr-4">
            <button
              onClick={() => executeCommand("justifyLeft")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${isCommandActive("justifyLeft") ? "bg-gray-800 text-white" : "bg-white text-gray-700"
                }`}
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => executeCommand("justifyCenter")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${isCommandActive("justifyCenter") ? "bg-gray-800 text-white" : "bg-white text-gray-700"
                }`}
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => executeCommand("justifyRight")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${isCommandActive("justifyRight") ? "bg-gray-800 text-white" : "bg-white text-gray-700"
                }`}
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>
          </div>

          {/* Lists */}
          <div className="flex gap-1">
            <button
              onClick={() => executeCommand("insertUnorderedList")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${isCommandActive("insertUnorderedList") ? "bg-gray-800 text-white" : "bg-white text-gray-700"
                }`}
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => executeCommand("insertOrderedList")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${isCommandActive("insertOrderedList") ? "bg-gray-800 text-white" : "bg-white text-gray-700"
                }`}
              title="Numbered List"
            >
              <span className="text-sm font-bold">1.</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-2">
        <div className="relative">
          <div
            id={editorContentId}
            ref={editorRef}
            contentEditable
            onInput={updateHtmlContent}
            onFocus={onFocus}
            className="min-h-[400px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-black text-black bg-white"
            style={{ fontSize: "16px", lineHeight: "1.6", fontFamily: "'Poppins', sans-serif" }}
          />
          {isEditorEmpty && (
            <span className="pointer-events-none absolute left-5 top-4 text-gray-400 select-none">
              Enter message here...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// A simple HTML code editor component
function HtmlEditor({ initialHtmlContent, onHtmlContentChange }) {
  const handleChange = (event) => {
    onHtmlContentChange(event.target.value);
  };

  return (
    <textarea
      className="w-full h-full min-h-0 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-900 text-gray-100 resize-none"
      value={initialHtmlContent}
      onChange={handleChange}
      spellCheck="false"
      aria-label="HTML Code Editor"
    />
  );
}

const DRAFTS_STORAGE_KEY = 'cbx-editor-drafts-list';
const MAX_DRAFTS = 5; // Maximum number of drafts to store

function DraftsModal({ drafts, onSelectDraft, onDeleteDraft, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden transform transition-all scale-100 opacity-100">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">My Saved Drafts ({drafts.length}/{MAX_DRAFTS})</h3>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 shadow-sm"
            aria-label="Close drafts modal"
          >
            Close
          </button>
        </div>
        <div className="p-4 overflow-auto flex-grow bg-gray-50">
          {drafts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">You have no saved drafts.</p>
          ) : (
            <ul className="space-y-3">
              {drafts.map((draft) => (
                <li key={draft.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <span className="text-gray-800 font-medium truncate pr-2" title={draft.name}>{draft.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectDraft(draft.id)}
                      className="px-3 py-1.5 rounded-lg bg-gray-700 text-white text-sm hover:bg-gray-800 transition-colors duration-200 shadow-sm"
                      title={`Load draft: ${draft.name}`}
                    >
                      Load
                    </button>
                    <button
                      onClick={() => onDeleteDraft(draft.id)}
                      className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 shadow-sm"
                      title={`Delete draft: ${draft.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [html, setHtml] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [drafts, setDrafts] = useState([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState(null);

  // Load initial HTML and drafts from localStorage
  useEffect(() => {
    try {
      const storedHtml = localStorage.getItem('cbx-editor-last-html');
      if (storedHtml !== null) setHtml(storedHtml);
    } catch (e) {
      console.error("Failed to load last HTML from localStorage", e);
    }

    try {
      const storedDrafts = JSON.parse(localStorage.getItem(DRAFTS_STORAGE_KEY));
      if (storedDrafts) {
        setDrafts(storedDrafts);
      }
    } catch (e) {
      console.error("Failed to load drafts from localStorage", e);
    }
  }, []);

  // Autosave functionality
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        if (activeDraftId) {
          // If a draft is active, update its content
          const updatedDrafts = drafts.map(draft =>
            draft.id === activeDraftId ? { ...draft, content: html, timestamp: Date.now() } : draft
          );
          localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updatedDrafts));
          setDrafts(updatedDrafts);
          console.log(`Autosaved changes to draft ID: ${activeDraftId}`);
        } else {
          // Otherwise, autosave to the general 'last edited' key
          localStorage.setItem('cbx-editor-last-html', html);
        }
        setLastSavedAt(Date.now());
      } catch (e) {
        console.error("Failed to autosave HTML to localStorage", e);
      }
    }, 500);
    return () => clearTimeout(id);
  }, [html, activeDraftId]);

  // Update preview version when html changes
  useEffect(() => {
    setPreviewVersion((v) => v + 1);
  }, [html]);

  // Handle saving a new draft
  const handleSaveDraft = (name) => {
    if (!html || html.trim() === '') {
      console.log('Editor is empty. Cannot save an empty draft.');
      setIsSavingDraft(false);
      setDraftName('');
      return;
    }
    try {
      const newDraft = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        content: html,
        name: name || `Draft ${new Date().toLocaleString()}`,
      };

      const updatedDrafts = [newDraft, ...drafts]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_DRAFTS);

      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);
      setActiveDraftId(newDraft.id);
      console.log(`Draft "${newDraft.name}" saved successfully!`);
    } catch (e) {
      console.error("Failed to save draft", e);
    } finally {
      setIsSavingDraft(false);
      setDraftName('');
    }
  };

  const promptSaveDraft = () => {
    setIsSavingDraft(true);
  };

  const handleLoadDraft = (id) => {
    const selectedDraft = drafts.find(draft => draft.id === id);
    if (selectedDraft) {
      setHtml(selectedDraft.content);
      setActiveDraftId(id);
      console.log(`Draft ${selectedDraft.name} loaded!`);
    }
    setIsDraftsModalOpen(false);
  };

  const handleDeleteDraft = (id) => {
    const updatedDrafts = drafts.filter(draft => draft.id !== id);
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
    if (activeDraftId === id) {
      setActiveDraftId(null);
    }
    console.log(`Draft with ID ${id} deleted.`);
  };

  const handleClear = () => {
    try {
      localStorage.removeItem('cbx-editor-last-html');
      setHtml('');
      setLastSavedAt(null);
      setActiveDraftId(null);
      console.log("Current editor content cleared!");
    } catch (e) {
      console.error("Failed to clear current editor content", e);
    }
  };

  const handleDownload = () => {
    if (!html || html.trim() === '') {
      console.log('The editor is empty. Nothing to download.');
      return;
    }

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email_draft.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // New function to start a fresh editor
  const clearAndStartNew = () => {
    handleClear();
  };

  return (
    <main className="min-h-screen bg-gray-50 font-poppins text-gray-900">
      <header className="w-full bg-gray-100 border-b border-gray-200 px-4 py-4 flex flex-wrap items-center justify-between shadow-sm sticky top-0 z-10">
        {/* Left side: Title & Subtitle */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">CBX Editor</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Compose, edit, and manage your HTML content
          </p>
        </div>

        {/* Right side: Autosave status */}

        <>
          <div className="flex flex-wrap items-center gap-2 mb">
            {lastSavedAt && (
              <span className="text-gray-400 text-sm mt-2 sm:mt-0">
                Last autosaved: {new Date(lastSavedAt).toLocaleTimeString()}
              </span>
            )}
            <div className="mr-auto flex items-center gap-2" />
            {/* Action Buttons */}
            <button onClick={() => setIsDraftsModalOpen(true)} className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 shadow-sm transition-colors duration-200 inline-flex items-center gap-1">
              <Folder size={16} /> My Drafts
            </button>
            <button onClick={promptSaveDraft} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 shadow-sm transition-colors duration-200">Save Draft</button>
            {activeDraftId && (
              <button onClick={clearAndStartNew} className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 shadow-sm transition-colors duration-200">New Editor</button>
            )}
            <button onClick={handleClear} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors duration-200">Clear Editor</button>
            <button onClick={handleDownload} className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 shadow-sm transition-colors duration-200 inline-flex items-center gap-1">
              <Download size={16} /> Download HTML
            </button>
            <button onClick={() => setIsPreviewOpen(true)} className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 shadow-sm transition-colors duration-200">Preview</button>
          </div>
        </>



      </header>

      <div className="w-full px-4 py-8">


        <section className="w-full grid grid-cols-2 gap-6">
          <div className="">
            <EmailEditor
              initialHtmlContent={html}
              onHtmlContentChange={setHtml}
              onFocus={() => { }}
            />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg flex flex-col h-full">
            <div className="border-b border-gray-200 px-4 py-3 bg-gray-100">
              <h2 className="text-base font-semibold text-gray-800">HTML Code</h2>
            </div>
            <div className="p-3 flex-1 min-h-0 flex">
              <HtmlEditor
                initialHtmlContent={html}
                onHtmlContentChange={setHtml}
              />
            </div>
          </div>
        </section>

        {/* Preview Modal */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPreviewOpen(false)} aria-hidden="true" />
            <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all scale-100 opacity-100">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 bg-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 shadow-sm"
                  aria-label="Close preview"
                >
                  Close
                </button>
              </div>
              <div className="p-4 overflow-auto flex-grow bg-gray-100">
                {html?.trim() ? (
                  <iframe
                    key={previewVersion}
                    title="Preview"
                    className="w-full h-[70vh] bg-white border border-gray-200 rounded-lg shadow-inner"
                    sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-scripts"
                    srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><script src="https://cdn.tailwindcss.com"></script></head><body style="margin:0; padding:20px; box-sizing:border-box;">${html}</body></html>`}
                  />
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 min-h-[200px] flex items-center justify-center text-center shadow-inner">
                    <p className="text-gray-500">Nothing to preview yet. Start typing in the editor!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save Draft Name Modal */}
        {isSavingDraft && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSavingDraft(false)} aria-hidden="true" />
            <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 opacity-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Name Your Draft</h3>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 mb-4"
                placeholder="e.g., My first email draft"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveDraft(draftName);
                  }
                }}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsSavingDraft(false);
                    setDraftName('');
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveDraft(draftName)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors duration-200"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Drafts Modal */}
        {isDraftsModalOpen && (
          <DraftsModal
            drafts={drafts}
            onSelectDraft={handleLoadDraft}
            onDeleteDraft={handleDeleteDraft}
            onClose={() => setIsDraftsModalOpen(false)}
          />
        )}
      </div>
    </main>
  );
}

export default App;