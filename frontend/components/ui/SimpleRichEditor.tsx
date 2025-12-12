'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Link as LinkIcon,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    AlignLeft,
    AlignCenter,
    Quote,
    Undo,
    Redo,
    Type,
    Eraser
} from 'lucide-react';

interface SimpleRichEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SimpleRichEditor({ value, onChange, placeholder }: SimpleRichEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const lastExternalValueRef = useRef(value);
    const isUserTypingRef = useRef(false);

    // Handle external value changes (e.g., when template is applied)
    useEffect(() => {
        // Only update if value changed from outside (not from user typing)
        if (editorRef.current && value !== lastExternalValueRef.current && !isUserTypingRef.current) {
            editorRef.current.innerHTML = value;
            lastExternalValueRef.current = value;

            // Move cursor to end after content is set
            if (value) {
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(editorRef.current);
                range.collapse(false); // false = collapse to end
                sel?.removeAllRanges();
                sel?.addRange(range);
            }
        }
        isUserTypingRef.current = false;
    }, [value]);

    // Initialize content on mount
    useEffect(() => {
        if (editorRef.current && value && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, []);

    const execCommand = useCallback((command: string, cmdValue?: string) => {
        editorRef.current?.focus();
        document.execCommand(command, false, cmdValue);
        // Update the content
        if (editorRef.current) {
            const newValue = editorRef.current.innerHTML;
            lastExternalValueRef.current = newValue;
            onChange(newValue);
        }
    }, [onChange]);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            isUserTypingRef.current = true;
            const newValue = editorRef.current.innerHTML;
            lastExternalValueRef.current = newValue;
            onChange(newValue);
        }
    }, [onChange]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        handleInput();
    }, [handleInput]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        // Handle keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    execCommand('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    execCommand('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    execCommand('underline');
                    break;
            }
        }
    }, [execCommand]);

    const insertLink = () => {
        if (linkUrl) {
            execCommand('createLink', linkUrl);
            setLinkUrl('');
            setShowLinkInput(false);
        }
    };

    const clearFormatting = () => {
        execCommand('removeFormat');
    };

    const ToolButton = ({
        icon: Icon,
        onClick,
        title,
        active = false
    }: {
        icon: React.ElementType;
        onClick: () => void;
        title: string;
        active?: boolean;
    }) => (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            title={title}
            className={`p-2 rounded-lg transition-all hover:bg-purple-100 hover:text-purple-600 ${active ? 'bg-purple-100 text-purple-600' : 'text-slate-600'
                }`}
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 bg-slate-50 border-b border-slate-200">
                {/* Text Style */}
                <ToolButton icon={Bold} onClick={() => execCommand('bold')} title="Bold (Ctrl+B)" />
                <ToolButton icon={Italic} onClick={() => execCommand('italic')} title="Italic (Ctrl+I)" />
                <ToolButton icon={Underline} onClick={() => execCommand('underline')} title="Underline (Ctrl+U)" />

                <div className="w-px h-6 bg-slate-300 mx-1" />

                {/* Headings */}
                <ToolButton
                    icon={Heading1}
                    onClick={() => execCommand('formatBlock', '<h2>')}
                    title="Heading 1"
                />
                <ToolButton
                    icon={Heading2}
                    onClick={() => execCommand('formatBlock', '<h3>')}
                    title="Heading 2"
                />
                <ToolButton
                    icon={Type}
                    onClick={() => execCommand('formatBlock', '<p>')}
                    title="Paragraph"
                />

                <div className="w-px h-6 bg-slate-300 mx-1" />

                {/* Lists */}
                <ToolButton icon={List} onClick={() => execCommand('insertUnorderedList')} title="Bullet List" />
                <ToolButton icon={ListOrdered} onClick={() => execCommand('insertOrderedList')} title="Numbered List" />

                <div className="w-px h-6 bg-slate-300 mx-1" />

                {/* Alignment */}
                <ToolButton icon={AlignLeft} onClick={() => execCommand('justifyLeft')} title="Align Left" />
                <ToolButton icon={AlignCenter} onClick={() => execCommand('justifyCenter')} title="Align Center" />

                <div className="w-px h-6 bg-slate-300 mx-1" />

                {/* Other */}
                <ToolButton icon={Quote} onClick={() => execCommand('formatBlock', '<blockquote>')} title="Quote" />
                <ToolButton
                    icon={LinkIcon}
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    title="Insert Link"
                />
                <ToolButton icon={Eraser} onClick={clearFormatting} title="Clear Formatting" />

                <div className="w-px h-6 bg-slate-300 mx-1" />

                {/* Undo/Redo */}
                <ToolButton icon={Undo} onClick={() => execCommand('undo')} title="Undo" />
                <ToolButton icon={Redo} onClick={() => execCommand('redo')} title="Redo" />
            </div>

            {/* Link Input */}
            {showLinkInput && (
                <div className="flex items-center gap-2 p-2 bg-purple-50 border-b border-purple-100">
                    <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="Masukkan URL..."
                        className="flex-1 px-3 py-1.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        onKeyDown={(e) => e.key === 'Enter' && insertLink()}
                    />
                    <button
                        type="button"
                        onClick={insertLink}
                        className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                    >
                        Insert
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowLinkInput(false)}
                        className="px-3 py-1.5 text-slate-600 text-sm rounded-lg hover:bg-slate-100"
                    >
                        Batal
                    </button>
                </div>
            )}

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                dir="ltr"
                onInput={handleInput}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                className="min-h-[300px] p-4 focus:outline-none bg-white text-left
                    prose prose-sm max-w-none 
                    prose-headings:text-slate-900 prose-h2:text-xl prose-h3:text-lg
                    prose-p:text-slate-700 prose-p:my-2
                    prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline
                    prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600
                    prose-ul:list-disc prose-ul:pl-5 prose-ul:my-2
                    prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-2
                    prose-li:my-0.5
                    prose-strong:text-slate-900
                    [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-slate-400 [&:empty]:before:pointer-events-none"
                style={{
                    direction: 'ltr',
                    textAlign: 'left',
                    unicodeBidi: 'plaintext'
                }}
                data-placeholder={placeholder || 'Tulis konten newsletter di sini...'}
                suppressContentEditableWarning
            />

            {/* Tips */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                    💡 Tip: Gunakan toolbar di atas untuk memformat teks. Shortcut: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline).
                </p>
            </div>
        </div>
    );
}
