'use client';

import React from 'react';
import Link from 'next/link';

interface RichTextParserProps {
  content: string;
  className?: string;
}

// Parse text and convert mentions (@username or @"display name") and URLs to clickable elements
const RichTextParser: React.FC<RichTextParserProps> = ({ content, className = '' }) => {
  // Combined pattern to find mentions (with or without quotes) and URLs
  // @"name with spaces" or @username or http://url
  const combinedPattern = /(@"[^"]+"|@[\w\s]+?(?=\s|$|[^\w\s])|https?:\/\/[^\s]+)/g;

  const parseContent = () => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let keyIndex = 0;

    // Find all matches (mentions and URLs)
    const matches = [...content.matchAll(combinedPattern)];

    matches.forEach((match) => {
      const matchText = match[0];
      const matchIndex = match.index!;

      // Add text before the match
      if (matchIndex > lastIndex) {
        parts.push(
          <span key={`text-${keyIndex++}`}>
            {content.slice(lastIndex, matchIndex)}
          </span>
        );
      }

      // Check if it's a mention or URL
      if (matchText.startsWith('@')) {
        // Extract display name (remove @ and quotes if present)
        const displayName = matchText.startsWith('@"') 
          ? matchText.slice(2, -1) // Remove @" and "
          : matchText.slice(1).trim(); // Remove @ and trim
        
        // Convert display name to username format (lowercase, no spaces/special chars)
        const username = displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        parts.push(
          <Link
            key={`mention-${keyIndex++}`}
            href={`/profile/${username}`}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            {matchText}
          </Link>
        );
      } else if (matchText.startsWith('http')) {
        // URL
        parts.push(
          <a
            key={`url-${keyIndex++}`}
            href={matchText}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {matchText}
          </a>
        );
      }

      lastIndex = matchIndex + matchText.length;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${keyIndex++}`}>
          {content.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div className={`whitespace-pre-wrap break-words ${className}`}>
      {parseContent()}
    </div>
  );
};

export default RichTextParser;
