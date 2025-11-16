'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';

interface MentionUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
  maxRows?: number;
  disabled?: boolean;
}

const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type @ to mention someone...',
  className = '',
  minRows = 3,
  maxRows = 10,
  disabled = false,
}) => {
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearchTerm, setMentionSearchTerm] = useState('');
  const [mentionResults, setMentionResults] = useState<MentionUser[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [mentionStartPos, setMentionStartPos] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search users for mention
  useEffect(() => {
    const searchUsers = async () => {
      if (mentionSearchTerm.length === 0) {
        setMentionResults([]);
        return;
      }

      setIsSearching(true);
      try {
        console.log('[MentionInput] Searching for:', mentionSearchTerm);
        const response: any = await apiRequest(`/mentions/search?q=${encodeURIComponent(mentionSearchTerm)}`);
        console.log('[MentionInput] Search response:', response);
        if (response.success) {
          setMentionResults(response.users);
        }
      } catch (error) {
        console.error('[MentionInput] Error searching users:', error);
        setMentionResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 200);
    return () => clearTimeout(debounce);
  }, [mentionSearchTerm]);

  // Handle textarea change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;

    onChange(newValue);

    // Check for @ mention trigger
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      
      // Check if there's a space after @ (means mention completed)
      if (!textAfterAt.includes(' ') && textAfterAt.length >= 0) {
        setMentionStartPos(lastAtIndex);
        setMentionSearchTerm(textAfterAt);
        setShowMentionDropdown(true);
        setSelectedMentionIndex(0);
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 24; // Approximate line height
      const maxHeight = lineHeight * maxRows;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  // Handle mention selection
  const selectMention = (user: MentionUser) => {
    if (!textareaRef.current) return;

    const cursorPos = textareaRef.current.selectionStart;
    const textBefore = value.slice(0, mentionStartPos);
    const textAfter = value.slice(cursorPos);
    
    // Use display_name for mention (with quotes if has space)
    const mentionText = user.display_name.includes(' ') 
      ? `@"${user.display_name}"` 
      : `@${user.display_name}`;
    
    const newValue = `${textBefore}${mentionText} ${textAfter}`;
    onChange(newValue);
    
    setShowMentionDropdown(false);
    setMentionSearchTerm('');
    
    // Set cursor after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStartPos + mentionText.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentionDropdown) {
      // Ctrl+Enter to submit
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedMentionIndex((prev) => 
          prev < mentionResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
      case 'Tab':
        if (mentionResults.length > 0) {
          e.preventDefault();
          selectMention(mentionResults[selectedMentionIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowMentionDropdown(false);
        break;
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowMentionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${className}`}
        style={{
          minHeight: `${minRows * 24}px`,
          maxHeight: `${maxRows * 24}px`,
        }}
      />

      {/* Mention Autocomplete Dropdown */}
      {showMentionDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          style={{
            top: textareaRef.current ? textareaRef.current.offsetHeight : 0,
          }}
        >
          {isSearching ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">Searching...</span>
            </div>
          ) : mentionResults.length === 0 ? (
            <div className="py-4 px-4 text-sm text-gray-500 text-center">
              {mentionSearchTerm.length === 0
                ? 'Type to search users...'
                : 'No users found'}
            </div>
          ) : (
            mentionResults.map((user, index) => (
              <button
                key={user.id}
                type="button"
                className={`w-full flex items-center px-4 py-2 hover:bg-gray-50 transition-colors ${
                  index === selectedMentionIndex ? 'bg-blue-50' : ''
                }`}
                onClick={() => selectMention(user)}
                onMouseEnter={() => setSelectedMentionIndex(index)}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 text-left">
                  <div className="font-medium text-sm text-gray-900">
                    {user.display_name}
                  </div>
                  <div className="text-xs text-gray-500">@{user.username}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Helper text */}
      <div className="mt-1 text-xs text-gray-500">
        Type <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">@</kbd> to mention · 
        <kbd className="ml-1 px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+Enter</kbd> to submit
      </div>
    </div>
  );
};

export default MentionInput;
