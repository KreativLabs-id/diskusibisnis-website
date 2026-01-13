/**
 * Password Policy Validation
 * Enforces strong password requirements
 */

export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
    strength: 'weak' | 'fair' | 'good' | 'strong';
    score: number;
}

// Common weak passwords to block
const COMMON_PASSWORDS = [
    'password', 'password123', 'password1', '123456', '12345678', '123456789',
    'qwerty', 'qwerty123', 'abc123', 'letmein', 'welcome', 'admin', 'admin123',
    'login', 'passw0rd', 'master', 'hello', 'monkey', 'dragon', 'shadow',
    'sunshine', 'princess', 'football', 'baseball', 'iloveyou', 'trustno1',
    'batman', 'superman', 'password1234', 'qwertyuiop', 'google', 'facebook',
    '1234567890', '0987654321', '123123', '111111', '000000', 'zaq12wsx',
    'rahasia', 'bismillah', 'sayang', 'cintaku', 'matahari', 'indonesia',
];

// Sequential characters to detect
const SEQUENTIAL_PATTERNS = [
    'abcdefghij', 'jihgfedcba',
    '0123456789', '9876543210',
    'qwertyuiop', 'poiuytrewq',
    'asdfghjkl', 'lkjhgfdsa',
    'zxcvbnm', 'mnbvcxz',
];

// Keyboard patterns to detect
const KEYBOARD_PATTERNS = [
    'qwerty', 'asdfgh', 'zxcvbn', '1qaz2wsx', 'qazwsx', '!qaz@wsx',
    '1234qwer', 'qwer1234', 'asdf1234', 'zxcv1234',
];

/**
 * Validate password strength and policy compliance
 */
export function validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    if (!password || typeof password !== 'string') {
        return {
            isValid: false,
            errors: ['Password is required'],
            strength: 'weak',
            score: 0,
        };
    }

    // Length check
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    } else if (password.length >= 8) {
        score += 1;
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;
    }

    // Maximum length check (prevent DoS)
    if (password.length > 128) {
        errors.push('Password cannot exceed 128 characters');
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    } else {
        score += 1;
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    } else {
        score += 1;
    }

    // Number check
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    } else {
        score += 1;
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
        errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?`~)');
    } else {
        score += 2;
    }

    // Common password check
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.includes(lowerPassword)) {
        errors.push('This password is too common. Please choose a more unique password.');
        score = Math.max(0, score - 3);
    }

    // Check if password contains common words
    for (const common of COMMON_PASSWORDS) {
        if (lowerPassword.includes(common) && password.length <= common.length + 4) {
            errors.push('Password contains a common word. Please choose a more unique password.');
            score = Math.max(0, score - 2);
            break;
        }
    }

    // Sequential character check
    for (const seq of SEQUENTIAL_PATTERNS) {
        if (lowerPassword.includes(seq.substring(0, 4))) {
            errors.push('Password contains sequential characters. Please choose a more random password.');
            score = Math.max(0, score - 1);
            break;
        }
    }

    // Keyboard pattern check
    for (const pattern of KEYBOARD_PATTERNS) {
        if (lowerPassword.includes(pattern)) {
            errors.push('Password contains a keyboard pattern. Please choose a more random password.');
            score = Math.max(0, score - 1);
            break;
        }
    }

    // Repeated characters check
    if (/(.)\1{2,}/.test(password)) {
        errors.push('Password contains too many repeated characters');
        score = Math.max(0, score - 1);
    }

    // Calculate strength
    let strength: 'weak' | 'fair' | 'good' | 'strong';
    if (score <= 2) {
        strength = 'weak';
    } else if (score <= 4) {
        strength = 'fair';
    } else if (score <= 6) {
        strength = 'good';
    } else {
        strength = 'strong';
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength,
        score: Math.min(score, 10),
    };
}

/**
 * Check if password contains user information (email, name, etc.)
 */
export function containsUserInfo(password: string, userInfo: string[]): boolean {
    const lowerPassword = password.toLowerCase();

    for (const info of userInfo) {
        if (!info || info.length < 3) continue;

        const lowerInfo = info.toLowerCase();

        // Check if password contains the info
        if (lowerPassword.includes(lowerInfo)) {
            return true;
        }

        // Check if password contains parts of email (before @)
        if (info.includes('@')) {
            const emailPart = info.split('@')[0].toLowerCase();
            if (emailPart.length >= 3 && lowerPassword.includes(emailPart)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Generate password policy description for UI
 */
export function getPasswordPolicyDescription(): string[] {
    return [
        'At least 8 characters long',
        'Contains at least one uppercase letter (A-Z)',
        'Contains at least one lowercase letter (a-z)',
        'Contains at least one number (0-9)',
        'Contains at least one special character (!@#$%^&*)',
        'Not a commonly used password',
        'No sequential characters (abc, 123)',
        'No keyboard patterns (qwerty, asdf)',
    ];
}

/**
 * Calculate password entropy (bits of randomness)
 */
export function calculatePasswordEntropy(password: string): number {
    if (!password) return 0;

    let charsetSize = 0;

    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;

    // Entropy = log2(charsetSize^length) = length * log2(charsetSize)
    const entropy = password.length * Math.log2(charsetSize || 1);

    return Math.round(entropy * 100) / 100;
}

export default {
    validatePassword,
    containsUserInfo,
    getPasswordPolicyDescription,
    calculatePasswordEntropy,
};
