import Redis from 'ioredis';

// OTP Storage interface
interface OTPData {
    otp: string;
    data: any;
    expiresAt: Date;
}

// Rate limit data interface
interface RateLimitData {
    count: number;
    firstAttempt: number;
    lockedUntil?: number;
}

// In-memory fallback storage
const memoryOTPStore = new Map<string, OTPData>();
const memoryRateLimitStore = new Map<string, RateLimitData>();

// Check if Redis URL is configured
const REDIS_URL = process.env.REDIS_URL;

let redisClient: Redis | null = null;
let useRedis = false;

// Initialize Redis connection if URL is provided
if (REDIS_URL) {
    try {
        redisClient = new Redis(REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times: number) => {
                if (times > 3) return null;
                return Math.min(times * 100, 3000);
            },
            lazyConnect: true,
        });

        redisClient.on('connect', () => {
            console.log('✅ Connected to Redis');
            useRedis = true;
        });

        redisClient.on('error', (err: Error) => {
            console.error('❌ Redis connection error:', err.message);
            console.log('⚠️ Falling back to in-memory storage');
            useRedis = false;
        });

        // Try to connect
        redisClient.connect().catch(() => {
            console.log('⚠️ Redis not available, using in-memory storage');
            useRedis = false;
        });
    } catch (error) {
        console.log('⚠️ Redis initialization failed, using in-memory storage');
        useRedis = false;
    }
} else {
    console.log('ℹ️ REDIS_URL not configured, using in-memory OTP storage');
    console.log('⚠️ For production, please configure Redis for better security');
}

// Clean expired entries from memory store periodically
setInterval(() => {
    const now = new Date();
    for (const [key, value] of memoryOTPStore.entries()) {
        if (value.expiresAt < now) {
            memoryOTPStore.delete(key);
        }
    }

    // Clean expired rate limits
    const nowMs = Date.now();
    for (const [key, value] of memoryRateLimitStore.entries()) {
        // Remove entries older than 1 hour with no lock
        if (!value.lockedUntil && (nowMs - value.firstAttempt) > 3600000) {
            memoryRateLimitStore.delete(key);
        }
        // Remove entries with expired locks
        if (value.lockedUntil && value.lockedUntil < nowMs) {
            memoryRateLimitStore.delete(key);
        }
    }
}, 60000); // Clean every minute

/**
 * OTP Store operations with Redis fallback
 */
export const otpStore = {
    /**
     * Store OTP data
     */
    async set(key: string, data: OTPData, ttlSeconds: number = 600): Promise<void> {
        if (useRedis && redisClient) {
            try {
                await redisClient.setex(
                    `otp:${key}`,
                    ttlSeconds,
                    JSON.stringify({
                        otp: data.otp,
                        data: data.data,
                        expiresAt: data.expiresAt.toISOString(),
                    })
                );
                return;
            } catch (error) {
                console.error('Redis OTP set error, falling back to memory:', error);
            }
        }
        // Fallback to memory
        memoryOTPStore.set(key, data);
    },

    /**
     * Get OTP data
     */
    async get(key: string): Promise<OTPData | null> {
        if (useRedis && redisClient) {
            try {
                const data = await redisClient.get(`otp:${key}`);
                if (data) {
                    const parsed = JSON.parse(data);
                    return {
                        otp: parsed.otp,
                        data: parsed.data,
                        expiresAt: new Date(parsed.expiresAt),
                    };
                }
                return null;
            } catch (error) {
                console.error('Redis OTP get error, falling back to memory:', error);
            }
        }
        // Fallback to memory
        return memoryOTPStore.get(key) || null;
    },

    /**
     * Delete OTP data
     */
    async delete(key: string): Promise<void> {
        if (useRedis && redisClient) {
            try {
                await redisClient.del(`otp:${key}`);
                return;
            } catch (error) {
                console.error('Redis OTP delete error, falling back to memory:', error);
            }
        }
        // Fallback to memory
        memoryOTPStore.delete(key);
    },
};

/**
 * Rate limit store operations with Redis fallback
 */
export const rateLimitStore = {
    /**
     * Get rate limit data for a key
     */
    async get(key: string): Promise<RateLimitData | null> {
        if (useRedis && redisClient) {
            try {
                const data = await redisClient.get(`ratelimit:${key}`);
                if (data) {
                    return JSON.parse(data);
                }
                return null;
            } catch (error) {
                console.error('Redis rate limit get error, falling back to memory:', error);
            }
        }
        // Fallback to memory
        return memoryRateLimitStore.get(key) || null;
    },

    /**
     * Set rate limit data for a key
     */
    async set(key: string, data: RateLimitData, ttlSeconds: number = 3600): Promise<void> {
        if (useRedis && redisClient) {
            try {
                await redisClient.setex(`ratelimit:${key}`, ttlSeconds, JSON.stringify(data));
                return;
            } catch (error) {
                console.error('Redis rate limit set error, falling back to memory:', error);
            }
        }
        // Fallback to memory
        memoryRateLimitStore.set(key, data);
    },

    /**
     * Delete rate limit data for a key
     */
    async delete(key: string): Promise<void> {
        if (useRedis && redisClient) {
            try {
                await redisClient.del(`ratelimit:${key}`);
                return;
            } catch (error) {
                console.error('Redis rate limit delete error, falling back to memory:', error);
            }
        }
        // Fallback to memory
        memoryRateLimitStore.delete(key);
    },

    /**
     * Increment attempt count and check if should be locked
     */
    async incrementAndCheck(key: string, maxAttempts: number = 5, lockDurationMs: number = 900000): Promise<{
        isLocked: boolean;
        attemptsRemaining: number;
        lockedUntil?: Date;
    }> {
        const now = Date.now();
        let data = await this.get(key);

        // Check if currently locked
        if (data?.lockedUntil && data.lockedUntil > now) {
            return {
                isLocked: true,
                attemptsRemaining: 0,
                lockedUntil: new Date(data.lockedUntil),
            };
        }

        // If lock expired or no data, reset
        if (!data || (data.lockedUntil && data.lockedUntil <= now)) {
            data = {
                count: 0,
                firstAttempt: now,
            };
        }

        // Reset if window expired (1 hour)
        if (now - data.firstAttempt > 3600000) {
            data = {
                count: 0,
                firstAttempt: now,
            };
        }

        // Increment count
        data.count++;

        // Check if should lock
        if (data.count >= maxAttempts) {
            data.lockedUntil = now + lockDurationMs;
            await this.set(key, data, Math.ceil(lockDurationMs / 1000) + 60);
            return {
                isLocked: true,
                attemptsRemaining: 0,
                lockedUntil: new Date(data.lockedUntil),
            };
        }

        await this.set(key, data);
        return {
            isLocked: false,
            attemptsRemaining: maxAttempts - data.count,
        };
    },

    /**
     * Reset attempts for a key (call on successful login)
     */
    async reset(key: string): Promise<void> {
        await this.delete(key);
    },
};

export { redisClient, useRedis };
