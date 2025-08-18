import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  XCircle,
} from "lucide-react";

const EmailEditor = ({ initialHtmlContent, onHtmlContentChange, onFocus }) => {
  const [htmlContent, setHtmlContent] = useState(initialHtmlContent || "");
  const [currentTextColor, setCurrentTextColor] = useState("#000000");
  const [currentBackgroundColor, setCurrentBackgroundColor] =
    useState("#FFFFFF");
  const [activeBlock, setActiveBlock] = useState("P"); // Track active block format
  const editorRef = useRef(null);
  const editorContentId = "email-editor-content";

  const fontFamilies = [
    "Arial, sans-serif",
    "Helvetica, sans-serif",
    "Times New Roman, serif",
    "Georgia, serif",
    "Verdana, sans-serif",
    "Trebuchet MS, sans-serif",
    "Comic Sans MS, cursive",
    "Impact, sans-serif",
  ];

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
          !["H1", "H2", "H3", "H4", "P"].includes(parentBlock.nodeName)
        ) {
          parentBlock = parentBlock.parentNode;
        }
        if (parentBlock && parentBlock !== editorRef.current) {
          setActiveBlock(parentBlock.nodeName);
        } else {
          setActiveBlock("P"); // Default to paragraph if no specific block found
        }
      }
    }
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateHtmlContent();
  };

  const isCommandActive = (command) => {
    if (!editorRef.current) return false;
    return document.queryCommandState(command);
  };

  const handleFontFamily = (family) => {
    executeCommand("fontName", family);
    updateHtmlContent();
  };

  const handleTextColor = (color) => {
    executeCommand("foreColor", color);
    setCurrentTextColor(color);
    updateHtmlContent();
  };

  const handleBackgroundColor = (color) => {
    executeCommand("hiliteColor", color);
    setCurrentBackgroundColor(color);
    updateHtmlContent();
  };

  const clearTextColor = () => {
    executeCommand("foreColor", "#000000");
    setCurrentTextColor("#000000");
    updateHtmlContent();
  };

  const clearBackgroundColor = () => {
    executeCommand("hiliteColor", "#FFFFFF");
    setCurrentBackgroundColor("#FFFFFF");
    updateHtmlContent();
  };

  const handleFormatBlock = (blockTag) => {
    if (activeBlock === blockTag) {
      // If the clicked heading is already active, revert to paragraph
      executeCommand("formatBlock", "<P>");
      setActiveBlock("P");
    } else {
      executeCommand("formatBlock", `<${blockTag}>`);
      setActiveBlock(blockTag);
    }
    updateHtmlContent();
  };

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

  useEffect(() => {
    if (
      editorRef.current &&
      initialHtmlContent !== editorRef.current.innerHTML
    ) {
      editorRef.current.innerHTML =
        initialHtmlContent || "Type your email message here...";
      setHtmlContent(editorRef.current.innerHTML);
    }
  }, [initialHtmlContent]);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-300 overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex flex-wrap gap-1 items-center">
          {/* Basic Formatting */}
          <div className="flex gap-1 border-r border-gray-300 pr-4">
            <button
              onClick={() => executeCommand("bold")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                isCommandActive("bold") ? "bg-blue-500 text-white" : "bg-white"
              }`}
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => executeCommand("italic")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                isCommandActive("italic")
                  ? "bg-blue-500 text-white"
                  : "bg-white"
              }`}
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => executeCommand("underline")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                isCommandActive("underline")
                  ? "bg-blue-500 text-white"
                  : "bg-white"
              }`}
              title="Underline"
            >
              <Underline size={16} />
            </button>
          </div>

          {/* Heading Formatting */}
          <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
            {/* <Type size={16} className="text-gray-600" /> */}
            <button
              onClick={() => handleFormatBlock("H1")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors text-sm font-bold ${
                activeBlock === "H1" ? "bg-blue-500 text-white" : "bg-white"
              }`}
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => handleFormatBlock("H2")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors text-sm font-bold ${
                activeBlock === "H2" ? "bg-blue-500 text-white" : "bg-white"
              }`}
              title="Heading 2"
            >
              H2
            </button>
            <button
              onClick={() => handleFormatBlock("H3")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors text-sm font-bold ${
                activeBlock === "H3" ? "bg-blue-500 text-white" : "bg-white"
              }`}
              title="Heading 3"
            >
              H3
            </button>
            <button
              onClick={() => handleFormatBlock("H4")}
              className={`p-2 rounded hover:bg-gray-200 transition-colors text-sm font-bold ${
                activeBlock === "H4" ? "bg-blue-500 text-white" : "bg-white"
              }`}
              title="Heading 4"
            >
              H4
            </button>
          </div>

          {/* Font Family */}
          <div className="border-r border-gray-300 pr-4">
            <select
              onChange={(e) => handleFontFamily(e.target.value)}
              className="p-2 border border-gray-300 rounded bg-white text-sm min-w-[140px]"
              defaultValue="Arial, sans-serif"
            >
              {fontFamilies.map((family) => (
                <option key={family} value={family}>
                  {family.split(",")[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Colors */}
          <div className="flex gap-2 border-r border-gray-300 pr-4">
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
              title="Background Color"
            />
            {currentBackgroundColor !== "#FFFFFF" && (
              <button
                onClick={clearBackgroundColor}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                title="Clear Background Color"
              >
                <XCircle size={16} className="text-gray-500" />
              </button>
            )}
          </div>

          {/* Alignment */}
          <div className="flex gap-1 border-r border-gray-300 pr-4">
            <button
              onClick={() => executeCommand("justifyLeft")}
              className="p-2 rounded hover:bg-gray-200 transition-colors bg-white"
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => executeCommand("justifyCenter")}
              className="p-2 rounded hover:bg-gray-200 transition-colors bg-white"
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => executeCommand("justifyRight")}
              className="p-2 rounded hover:bg-gray-200 transition-colors bg-white"
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>
          </div>

          {/* Lists */}
          <div className="flex gap-1">
            <button
              onClick={() => executeCommand("insertUnorderedList")}
              className="p-2 rounded hover:bg-gray-200 transition-colors bg-white"
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => executeCommand("insertOrderedList")}
              className="p-2 rounded hover:bg-gray-200 transition-colors bg-white text-sm font-bold"
              title="Numbered List"
            >
              1.
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-2">
        <div
          id={editorContentId}
          ref={editorRef}
          contentEditable
          onInput={updateHtmlContent}
          onFocus={onFocus}
          className="min-h-[200px]  p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-black text-black bg-white"
          style={{ fontSize: "16px", lineHeight: "1.6" }}
        />
      </div>
    </div>
  );
};

export default EmailEditor;