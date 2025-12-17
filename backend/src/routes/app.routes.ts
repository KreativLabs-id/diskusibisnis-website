import { Router, Request, Response } from 'express';

const router = Router();

// App version info
const APP_VERSION = {
    version: '1.0.1',
    buildNumber: 2,
    minVersion: '1.0.0',
    forceUpdate: false,
    downloadUrl: 'https://github.com/KreativLabs-id/diskusibisnis-website/releases/latest',
    releaseNotes: 'Bug fixes dan peningkatan performa',
};

// GET /api/app/version - Check latest app version
router.get('/version', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: APP_VERSION,
    });
});

// GET /api/app/health - Health check
router.get('/health', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

export default router;
