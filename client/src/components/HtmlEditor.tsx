import React from 'react';

interface HtmlEditorProps {
  initialHtmlContent: string;
  onHtmlContentChange: (html: string) => void;
  onFocus?: () => void;
}

const HtmlEditor: React.FC<HtmlEditorProps> = ({ initialHtmlContent, onHtmlContentChange, onFocus }) => {
  return (
    <textarea
      className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
      value={initialHtmlContent}
      onChange={(e) => onHtmlContentChange(e.target.value)}
      onFocus={onFocus}
      placeholder="Enter HTML content for email body..."
      spellCheck="false"
    ></textarea>
  );
};

export default HtmlEditor;