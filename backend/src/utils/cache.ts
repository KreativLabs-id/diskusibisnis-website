/**
 * Simple in-memory cache for API responses
 * Reduces database load for frequently accessed data
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class SimpleCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private defaultTTL: number = 30000; // 30 seconds default

    /**
     * Get cached data
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set cached data with optional custom TTL
     */
    set<T>(key: string, data: T, ttlMs?: number): void {
        const ttl = ttlMs || this.defaultTTL;
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl
        });
    }

    /**
     * Delete specific cache key
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Delete all keys matching a pattern
     */
    deletePattern(pattern: string): void {
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache stats
     */
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Export singleton instance
export const apiCache = new SimpleCache();

// Cache key generators
export const cacheKeys = {
    questions: (sort: string, tag: string, page: number) => `questions:${sort}:${tag}:${page}`,
    questionDetail: (id: string) => `question:${id}`,
    tags: () => 'tags:all',
    userProfile: (id: string) => `user:${id}`,
};

// Cache invalidation helpers
export const invalidateCache = {
    questions: () => apiCache.deletePattern('^questions:'),
    question: (id: string) => apiCache.delete(cacheKeys.questionDetail(id)),
    allQuestions: () => {
        apiCache.deletePattern('^questions:');
        apiCache.deletePattern('^question:');
    },
    tags: () => apiCache.delete(cacheKeys.tags()),
    user: (id: string) => apiCache.delete(cacheKeys.userProfile(id)),
};
