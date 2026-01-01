-- Insert test popup
INSERT INTO promo_popups (
    title, 
    image_url, 
    link_url,
    link_type,
    description,
    is_active, 
    start_date, 
    priority, 
    show_once_per_user
) VALUES (
    'Promo Tahun Baru 2026!', 
    'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&h=600&fit=crop',
    '/communities',
    'community',
    'Gabung komunitas UMKM dan dapatkan insight bisnis terbaru!',
    true, 
    NOW(), 
    10, 
    true
);

DO $$
BEGIN
    RAISE NOTICE 'Test popup created!';
END $$;
