-- ========================================
-- FIX: Supabase Storage Policies untuk question-images bucket
-- ========================================
-- Jalankan script ini di Supabase SQL Editor untuk memperbaiki policies

-- 1. HAPUS semua policies lama yang mungkin konflik
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users Can Upload" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Delete Own Images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 42yurj_0" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 42yurj_1" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 42yurj_2" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder 42yurj_3" ON storage.objects;

-- 2. Buat policies baru yang BENAR
-- Policy 1: Semua orang bisa lihat (SELECT/READ)
CREATE POLICY "Anyone can view question images"
ON storage.objects FOR SELECT
USING (bucket_id = 'question-images');

-- Policy 2: Semua orang bisa upload (INSERT) - untuk testing
-- Nanti bisa diganti ke authenticated only kalau sudah jalan
CREATE POLICY "Anyone can upload question images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'question-images');

-- Policy 3: Semua orang bisa update
CREATE POLICY "Anyone can update question images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'question-images');

-- Policy 4: Semua orang bisa delete
CREATE POLICY "Anyone can delete question images"
ON storage.objects FOR DELETE
USING (bucket_id = 'question-images');

-- 3. Verify policies created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND (qual LIKE '%question-images%' OR with_check LIKE '%question-images%')
ORDER BY policyname;
