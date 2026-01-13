/**
 * Honeypot Anti-Spam Component
 * 
 * Usage:
 * <HoneypotFields />
 * 
 * Include this in any form to add hidden fields that detect bots.
 * The CSS hides these fields from real users, but bots will fill them.
 * 
 * On form submission, include these fields in the request body.
 * The backend will reject requests where honeypot fields are filled.
 */
'use client';

import { useEffect, useState } from 'react';

// Honeypot field names - must match backend configuration
const HONEYPOT_FIELDS = [
    'website',
    'url',
    'phone2',
    'email2',
    'fax',
];

// Timestamp field name for timing detection
const TIMESTAMP_FIELD = '_hp_ts';

export default function HoneypotFields() {
    const [timestamp, setTimestamp] = useState('');

    useEffect(() => {
        // Set timestamp when component mounts (page load time)
        setTimestamp(Date.now().toString());
    }, []);

    return (
        <>
            {/* 
        These fields are hidden via CSS, not type="hidden".
        Bots that auto-fill forms will fill these, triggering detection.
        
        Do NOT use:
        - display: none
        - visibility: hidden
        - type="hidden"
        
        Bots often skip fields with these attributes.
        Instead, we position them off-screen.
      */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden',
                    // Additional obfuscation
                    opacity: 0,
                    pointerEvents: 'none',
                }}
            >
                {/* Attractive field names for bots */}
                {HONEYPOT_FIELDS.map((field) => (
                    <input
                        key={field}
                        type="text"
                        name={field}
                        id={`hp_${field}`}
                        autoComplete="off"
                        tabIndex={-1}
                        defaultValue=""
                        aria-hidden="true"
                    />
                ))}

                {/* Timestamp for timing-based detection */}
                <input
                    type="text"
                    name={TIMESTAMP_FIELD}
                    id="hp_timestamp"
                    value={timestamp}
                    readOnly
                    autoComplete="off"
                    tabIndex={-1}
                    aria-hidden="true"
                />
            </div>
        </>
    );
}

/**
 * Hook to get honeypot data for form submission
 * 
 * Usage:
 * const { getHoneypotData } = useHoneypot();
 * 
 * On form submit:
 * const formData = {
 *   ...yourFormData,
 *   ...getHoneypotData()
 * };
 */
export function useHoneypot() {
    const [timestamp] = useState(() => Date.now().toString());

    const getHoneypotData = () => {
        return {
            // These should all be empty for legitimate users
            ...HONEYPOT_FIELDS.reduce((acc, field) => ({ ...acc, [field]: '' }), {}),
            [TIMESTAMP_FIELD]: timestamp,
        };
    };

    return { getHoneypotData, HONEYPOT_FIELDS, TIMESTAMP_FIELD };
}
