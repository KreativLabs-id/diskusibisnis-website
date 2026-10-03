import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

// Ensure top_banners table exists
let tableEnsured = false;
const ensureTableExists = async () => {
    if (tableEnsured) return;
    try {
        await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await pool.query(`
            CREATE TABLE IF NOT EXISTS top_banners (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                title VARCHAR(255) NOT NULL,
                link_url TEXT,
                link_text VARCHAR(100) DEFAULT 'Selengkapnya',
                is_active BOOLEAN DEFAULT TRUE,
                start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                end_date TIMESTAMP,
                created_by UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed with existing active promo if table was just created and empty
        const countCheck = await pool.query('SELECT COUNT(*) FROM top_banners');
        if (parseInt(countCheck.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO top_banners (title, link_url, link_text, is_active)
                SELECT title, link_url, 'Selengkapnya', is_active
                FROM promo_popups
                WHERE is_active = TRUE
                ORDER BY created_at DESC
                LIMIT 1
            `);
        }

        tableEnsured = true;
    } catch (err) {
        console.error('Error ensuring top_banners table:', err);
    }
};

/**
 * Get active top banner for public website
 */
export const getActiveTopBanner = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await ensureTableExists();
        const query = `
            SELECT id, title, link_url, link_text, is_active, start_date, end_date
            FROM top_banners
            WHERE is_active = TRUE
              AND start_date <= NOW()
              AND (end_date IS NULL OR end_date >= NOW())
            ORDER BY created_at DESC
            LIMIT 1
        `;
        const result = await pool.query(query);

        res.json({
            status: 'success',
            data: { banner: result.rows[0] || null }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * List all top banners for admin
 */
export const getAllTopBanners = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await ensureTableExists();
        const query = `
            SELECT 
                b.*,
                u.display_name as created_by_name
            FROM top_banners b
            LEFT JOIN users u ON b.created_by = u.id
            ORDER BY b.created_at DESC
        `;
        const result = await pool.query(query);

        res.json({
            status: 'success',
            data: { banners: result.rows }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get single top banner
 */
export const getTopBannerById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await ensureTableExists();
        const { id } = req.params;
        const query = `
            SELECT b.*, u.display_name as created_by_name
            FROM top_banners b
            LEFT JOIN users u ON b.created_by = u.id
            WHERE b.id = $1
        `;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ status: 'error', message: 'Top banner tidak ditemukan' });
            return;
        }

        res.json({
            status: 'success',
            data: { banner: result.rows[0] }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Create new top banner (admin)
 */
export const createTopBanner = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await ensureTableExists();
        const userId = (req as any).user?.id;
        const { title, linkUrl, linkText, isActive = true, startDate, endDate } = req.body;

        if (!title || !title.trim()) {
            res.status(400).json({ status: 'error', message: 'Judul banner wajib diisi' });
            return;
        }

        const query = `
            INSERT INTO top_banners (
                title, link_url, link_text, is_active, start_date, end_date, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const result = await pool.query(query, [
            title.trim(),
            linkUrl?.trim() || null,
            linkText?.trim() || 'Selengkapnya',
            isActive,
            startDate || new Date(),
            endDate || null,
            userId || null
        ]);

        res.status(201).json({
            status: 'success',
            message: 'Top banner berhasil dibuat',
            data: { banner: result.rows[0] }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update top banner (admin)
 */
export const updateTopBanner = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await ensureTableExists();
        const { id } = req.params;
        const { title, linkUrl, linkText, isActive, startDate, endDate } = req.body;

        const query = `
            UPDATE top_banners
            SET 
                title = COALESCE($1, title),
                link_url = $2,
                link_text = COALESCE($3, link_text),
                is_active = COALESCE($4, is_active),
                start_date = COALESCE($5, start_date),
                end_date = $6,
                updated_at = NOW()
            WHERE id = $7
            RETURNING *
        `;

        const result = await pool.query(query, [
            title !== undefined ? title.trim() : null,
            linkUrl !== undefined ? (linkUrl?.trim() || null) : null,
            linkText !== undefined ? (linkText?.trim() || 'Selengkapnya') : null,
            isActive,
            startDate,
            endDate,
            id
        ]);

        if (result.rows.length === 0) {
            res.status(404).json({ status: 'error', message: 'Top banner tidak ditemukan' });
            return;
        }

        res.json({
            status: 'success',
            message: 'Top banner berhasil diperbarui',
            data: { banner: result.rows[0] }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete top banner (admin)
 */
export const deleteTopBanner = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await ensureTableExists();
        const { id } = req.params;
        const result = await pool.query('DELETE FROM top_banners WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ status: 'error', message: 'Top banner tidak ditemukan' });
            return;
        }

        res.json({
            status: 'success',
            message: 'Top banner berhasil dihapus'
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Toggle active status (admin)
 */
export const toggleTopBannerStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await ensureTableExists();
        const { id } = req.params;
        const query = `
            UPDATE top_banners
            SET is_active = NOT is_active, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ status: 'error', message: 'Top banner tidak ditemukan' });
            return;
        }

        res.json({
            status: 'success',
            message: `Top banner berhasil ${result.rows[0].is_active ? 'diaktifkan' : 'dinonaktifkan'}`,
            data: { banner: result.rows[0] }
        });
    } catch (err) {
        next(err);
    }
};
