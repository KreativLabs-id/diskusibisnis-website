-- Insert test announcement
INSERT INTO announcements (
    title, 
    message, 
    type, 
    is_active, 
    start_date, 
    priority, 
    show_on, 
    is_dismissible
) VALUES (
    'Selamat Tahun Baru 2026!', 
    'Semoga bisnis Anda sukses di tahun baru ini. Mari diskusi bersama komunitas UMKM Indonesia!', 
    'promo', 
    true, 
    NOW(), 
    10, 
    'all', 
    true
);

DO $$
BEGIN
    RAISE NOTICE 'Test announcement created!';
END $$;
