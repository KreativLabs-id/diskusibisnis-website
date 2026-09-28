import { redisClient, useRedis } from '../config/redis';

/**
 * Cache for API responses supporting Redis with in-memory fallback
 * Reduces database load for frequently accessed data
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

class ApiCache {
    private memoryCache: Map<string, CacheEntry<any>> = new Map();
    private defaultTTL: number = 30000; // 30 seconds default

    /**
     * Get cached data
     */
    async get<T>(key: string): Promise<T | null> {
        if (useRedis && redisClient) {
            try {
                const data = await redisClient.get(`api:${key}`);
                if (data) {
                    return JSON.parse(data) as T;
                }
                return null;
            } catch (error) {
                console.error(`Redis cache get error for key ${key}:`, error);
                // Fall through to memory cache if Redis fails
            }
        }

        // Memory cache fallback
        const entry = this.memoryCache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiresAt) {
            this.memoryCache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set cached data with optional custom TTL
     */
    async set<T>(key: string, data: T, ttlMs?: number): Promise<void> {
        const ttl = ttlMs || this.defaultTTL;
        const ttlSeconds = Math.ceil(ttl / 1000);

        if (useRedis && redisClient) {
            try {
                await redisClient.setex(`api:${key}`, ttlSeconds, JSON.stringify(data));
                return;
            } catch (error) {
                console.error(`Redis cache set error for key ${key}:`, error);
                // Fall through to memory cache if Redis fails
            }
        }

        // Memory cache fallback
        this.memoryCache.set(key, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl
        });
    }

    /**
     * Delete specific cache key
     */
    async delete(key: string): Promise<void> {
        if (useRedis && redisClient) {
            try {
                await redisClient.del(`api:${key}`);
            } catch (error) {
                console.error(`Redis cache delete error for key ${key}:`, error);
            }
        }
        this.memoryCache.delete(key);
    }

    /**
     * Delete all keys matching a pattern
     */
    async deletePattern(pattern: string): Promise<void> {
        if (useRedis && redisClient) {
            try {
                // In Redis, we need to use SCAN to find keys matching the pattern
                // We convert regex-like pattern to Redis glob pattern (simple approximation)
                const redisPattern = `api:${pattern.replace('^', '')}*`;
                let cursor = '0';
                do {
                    const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', redisPattern, 'COUNT', 100);
                    cursor = nextCursor;
                    if (keys.length > 0) {
                        await redisClient.del(...keys);
                    }
                } while (cursor !== '0');
            } catch (error) {
                console.error(`Redis cache deletePattern error for pattern ${pattern}:`, error);
            }
        }
        
        // Memory cache fallback
        const regex = new RegExp(pattern);
        for (const key of this.memoryCache.keys()) {
            if (regex.test(key)) {
                this.memoryCache.delete(key);
            }
        }
    }

    /**
     * Clear all cache
     */
    async clear(): Promise<void> {
        if (useRedis && redisClient) {
            try {
                // Delete all api: keys
                await this.deletePattern('^');
            } catch (error) {
                console.error('Redis cache clear error:', error);
            }
        }
        this.memoryCache.clear();
    }
}

// Export singleton instance
export const apiCache = new ApiCache();

// Cache key generators
export const cacheKeys = {
    // Questions
    questions: (sort: string, tag: string, page: number) => `questions:${sort}:${tag}:${page}`,
    questionDetail: (id: string) => `question:${id}`,
    // Tags
    tags: () => 'tags:all',
    tagsSearch: (search: string, limit: number) => `tags:${search}:${limit}`,
    // Popups/Announcements
    popupActive: (deviceScope: string) => `popup:active:${deviceScope}`,
    announcementActive: (showOn: string, deviceScope: string) => `announcement:active:${showOn}:${deviceScope}`,
    // Users
    userProfile: (id: string) => `user:${id}`,
    userActivities: (id: string, page: number) => `user:${id}:activities:${page}`,
    userQuestions: (id: string, page: number) => `user:${id}:questions:${page}`,
    userAnswers: (id: string, page: number) => `user:${id}:answers:${page}`,
    // Communities
    communities: (page: number, limit: number, search: string, category: string, memberOnly: boolean) => `communities:${page}:${limit}:${search}:${category}:${memberOnly}`,
    communityBySlug: (slug: string) => `community:${slug}`,
    communityQuestions: (slug: string, page: number) => `community:${slug}:questions:${page}`,
    communityMembers: (slug: string, page: number) => `community:${slug}:members:${page}`,
    // Answers
    answers: (questionId: string, page: number) => `answers:${questionId}:${page}`,
};

// Cache invalidation helpers
export const invalidateCache = {
    // Questions
    questions: async () => await apiCache.deletePattern('^questions:'),
    question: async (id: string) => {
        await apiCache.delete(cacheKeys.questionDetail(id));
        await apiCache.deletePattern('^questions:');
    },
    allQuestions: async () => {
        await apiCache.deletePattern('^questions:');
        await apiCache.deletePattern('^question:');
    },
    // Tags
    tags: async () => await apiCache.deletePattern('^tags:'),
    // Users
    user: async (id: string) => await apiCache.deletePattern(`^user:${id}`),
    // Popups/Announcements
    popups: async () => await apiCache.deletePattern('^popup:active:'),
    announcements: async () => await apiCache.deletePattern('^announcement:active:'),
    // Communities
    communities: async () => await apiCache.deletePattern('^communities:'),
    community: async (slug: string) => {
        await apiCache.deletePattern(`^community:${slug}`);
        await apiCache.deletePattern('^communities:');
    },
    // Answers
    answers: async (questionId: string) => await apiCache.deletePattern(`^answers:${questionId}`),
};
// Triggering backend restart
