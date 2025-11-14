# PWA (Progressive Web App) untuk DiskusiBisnis

## 📱 Fitur PWA yang Sudah Diimplementasi

### 1. **Install ke Home Screen**
   - Aplikasi dapat di-install sebagai aplikasi native di perangkat mobile dan desktop
   - Prompt install otomatis muncul untuk pengguna baru
   - Shortcut aplikasi di home screen dengan icon DiskusiBisnis

### 2. **Offline Support**
   - Aplikasi tetap dapat diakses meskipun tidak ada koneksi internet
   - Halaman offline custom dengan UI yang menarik
   - Automatic retry ketika koneksi kembali

### 3. **Caching Strategy**
   - **Fonts**: Cache First dengan expiry 365 hari
   - **Images**: Stale While Revalidate dengan expiry 24 jam
   - **API Calls**: Network First dengan fallback ke cache (timeout 10 detik)
   - **Static Assets**: Optimized caching untuk JS, CSS, dan media files

### 4. **Push Notifications**
   - Support untuk push notifications
   - Custom notification handler dalam service worker
   - Permission request dengan UI yang user-friendly

### 5. **App Shortcuts**
   - Quick actions dari home screen:
     - Tanya Sekarang
     - Pertanyaan Terbaru
     - Komunitas

### 6. **Icon & Splash Screen**
   - Multiple icon sizes untuk berbagai devices (72x72 hingga 512x512)
   - Favicon dengan berbagai ukuran (16x16, 32x32, 48x48)
   - Apple Touch Icon untuk iOS devices
   - Maskable icons untuk adaptive icons di Android

### 7. **Metadata & SEO**
   - Manifest.json lengkap dengan semua konfigurasi
   - Meta tags untuk PWA capabilities
   - Open Graph dan Twitter Cards untuk social sharing
   - Apple-specific meta tags untuk iOS

## 📂 File yang Dibuat/Dimodifikasi

### File Baru:
1. **`public/manifest.json`** - Konfigurasi PWA manifest
2. **`public/icons/`** - Folder berisi semua icon PWA
3. **`public/offline.html`** - Halaman offline custom
4. **`public/sw-custom.js`** - Custom service worker
5. **`lib/pwa-installer.ts`** - PWA installer utility
6. **`components/PWAInstallPrompt.tsx`** - Install prompt component
7. **`scripts/generate-icons.js`** - Script untuk generate icons

### File Dimodifikasi:
1. **`next.config.mjs`** - Added PWA configuration with next-pwa
2. **`app/layout.tsx`** - Added PWA meta tags, manifest link, dan favicon
3. **`app/components/ClientProviders.tsx`** - Added PWA install prompt
4. **`package.json`** - Added next-pwa dan sharp dependencies

## 🚀 Cara Testing PWA

### Development Mode:
```bash
npm run dev
```
**Note**: PWA di-disable di development mode untuk mempermudah debugging.

### Production Mode:
```bash
npm run build
npm start
```

### Testing di Browser:

#### Chrome/Edge (Desktop):
1. Buka aplikasi di browser
2. Klik icon "Install" di address bar
3. Atau buka DevTools > Application > Manifest/Service Workers

#### Chrome (Android):
1. Buka aplikasi di Chrome mobile
2. Klik menu (3 dots) > "Add to Home screen"
3. Konfirmasi untuk install

#### Safari (iOS):
1. Buka aplikasi di Safari
2. Tap Share button
3. Tap "Add to Home Screen"

## 🔍 Verification Checklist

✅ Manifest.json valid dan terpasang
✅ Service Worker registered
✅ Icons dalam berbagai ukuran tersedia
✅ Offline page berfungsi
✅ Install prompt muncul
✅ Meta tags lengkap untuk PWA
✅ Favicon menggunakan logodiskusibisnis.png
✅ Caching strategy teroptimasi
✅ Lighthouse PWA score > 90

## 🛠️ Tools untuk Testing

1. **Chrome DevTools**:
   - Application tab > Manifest
   - Application tab > Service Workers
   - Lighthouse audit untuk PWA score

2. **Online Tools**:
   - [Web.dev Measure](https://web.dev/measure/)
   - [PWA Builder](https://www.pwabuilder.com/)

## 📊 PWA Score Target

- **Performance**: > 90
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 90
- **PWA**: > 90

## 🔄 Update Strategy

Service worker akan otomatis check untuk updates setiap 1 jam. Ketika update tersedia, user akan diberi prompt untuk reload aplikasi.

## 📱 Supported Platforms

- ✅ Android (Chrome, Firefox, Samsung Internet)
- ✅ iOS/iPadOS (Safari, Chrome)
- ✅ Windows (Chrome, Edge)
- ✅ macOS (Chrome, Safari, Edge)
- ✅ Linux (Chrome, Firefox)

## 🎨 Branding

Semua icon dan favicon sudah menggunakan **logodiskusibisnis.png** dengan berbagai ukuran:
- 16x16, 32x32, 48x48 (Favicon)
- 72x72, 96x96, 128x128, 144x144, 152x152 (PWA Icons)
- 192x192, 384x384, 512x512 (PWA Icons)
- 180x180 (Apple Touch Icon)

## 📝 Notes

- PWA akan otomatis di-build saat menjalankan `npm run build`
- File service worker akan digenerate otomatis di `public/` folder
- Custom service worker code ada di `public/sw-custom.js`
- Install prompt akan muncul otomatis setelah 3 detik untuk pengguna baru

## 🐛 Troubleshooting

### Service Worker tidak register:
- Clear browser cache dan reload
- Check console untuk error messages
- Pastikan aplikasi diakses via HTTPS (atau localhost)

### Install prompt tidak muncul:
- PWA sudah terinstall
- Browser tidak support install prompt
- Kriteria installability belum terpenuhi

### Icon tidak muncul:
- Clear cache dan rebuild aplikasi
- Check apakah file icon ada di `public/icons/`
- Verify manifest.json paths

## 🔗 Resources

- [Next PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
