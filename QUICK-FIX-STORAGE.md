# 🚨 QUICK FIX - Storage Upload Error

## Error yang Terjadi
```
Error: new row violates row-level security policy
```

## Penyebab
Policy Supabase Storage untuk bucket `question-images` tidak benar atau tidak lengkap.

## Solusi Cepat (Via UI) ⚡

### Cara 1: Auto-generate Policies (TERCEPAT)
1. Buka Supabase Dashboard
2. Pergi ke **Storage** > pilih bucket **question-images**
3. Klik tab **Policies**
4. Klik **New Policy**
5. Pilih template **"For full customization"**
6. **ATAU** lebih mudah: Klik **"New Policy"** > **"Get started quickly"** > pilih **"Allow all"**
7. Save

### Cara 2: Manual via SQL Editor
1. Buka **SQL Editor** di Supabase
2. Copy dan jalankan SQL ini:

```sql
-- HAPUS policies lama
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users Can Upload" ON storage.objects;
DROP POLICY IF EXISTS "Users Can Delete Own Images" ON storage.objects;

-- BUAT policies baru yang benar
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'question-images');

CREATE POLICY "Authenticated can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'question-images');

CREATE POLICY "Authenticated can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'question-images');

CREATE POLICY "Authenticated can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'question-images');
```

## Verify Bucket Settings

Pastikan bucket settings benar:
1. **Bucket Name:** `question-images` (exact, lowercase, dengan dash)
2. **Public bucket:** ✅ YES (harus dicentang)
3. **File size limit:** 50 MB (atau sesuai kebutuhan)
4. **Allowed MIME types:** Any (atau: image/jpeg, image/png, image/gif, image/webp)

## Test Upload

Setelah setup policies:
1. Refresh halaman `/ask`
2. Login jika belum
3. Coba upload gambar
4. ✅ Seharusnya berhasil tanpa error

## Troubleshooting

### Masih error setelah setup policies?

**Check 1: Apakah user sudah login?**
- Upload memerlukan autentikasi
- Cek di Console: `localStorage.getItem('token')`
- Harus ada token JWT

**Check 2: Cek nama bucket di code**
```typescript
// File: frontend/lib/image-upload.ts
const BUCKET_NAME = 'question-images'; // Harus exact sama dengan nama bucket
```

**Check 3: Verify policies aktif**
Jalankan di SQL Editor:
```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

Harus ada minimal 4 policies untuk bucket `question-images`:
- SELECT (untuk public)
- INSERT (untuk authenticated)
- UPDATE (untuk authenticated)  
- DELETE (untuk authenticated)

## Alternative: Buat Bucket Baru

Jika masih gagal, coba buat bucket baru:
1. **Delete** bucket `question-images` yang lama
2. **Create** bucket baru:
   - Name: `question-images`
   - Public: ✅ YES
3. Setup policies dengan **"Allow all"** template
4. Test lagi

## File SQL Helper
SQL lengkap ada di: `backend/scripts/fix-storage-policies.sql`
