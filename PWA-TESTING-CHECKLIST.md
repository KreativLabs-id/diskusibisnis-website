# PWA Testing Checklist untuk DiskusiBisnis

## ✅ Pre-Testing Checklist

- [x] Install dependencies (`npm install`)
- [x] Generate icons (`node scripts/generate-icons.js`)
- [x] Build production (`npm run build`)
- [x] Service Worker terdaftar di `public/sw.js`
- [x] Manifest.json tersedia di `public/manifest.json`
- [x] Semua icon sizes tersedia (12 icons)

## 🌐 Browser Testing

### Chrome Desktop (Windows/Mac/Linux)
1. [ ] Buka https://localhost:3000 atau URL production
2. [ ] Buka DevTools (F12)
3. [ ] Tab Application > Manifest
   - [ ] Manifest loaded correctly
   - [ ] All icons displayed
   - [ ] Name: "DiskusiBisnis - Forum Q&A UMKM Indonesia"
   - [ ] Short name: "DiskusiBisnis"
   - [ ] Theme color: #2563eb
4. [ ] Tab Application > Service Workers
   - [ ] Service Worker registered
   - [ ] Status: Activated and running
   - [ ] Update on reload works
5. [ ] Tab Application > Cache Storage
   - [ ] Multiple caches created
   - [ ] Static assets cached
6. [ ] Install prompt
   - [ ] Icon "Install" muncul di address bar
   - [ ] Klik install
   - [ ] App opens in standalone window
7. [ ] Lighthouse Audit
   - [ ] Performance > 90
   - [ ] PWA score > 90
   - [ ] SEO > 90

### Chrome Mobile (Android)
1. [ ] Buka aplikasi di Chrome mobile
2. [ ] Banner "Add to Home Screen" muncul (atau prompt install)
3. [ ] Tap "Add to Home Screen"
4. [ ] Icon muncul di home screen dengan nama "DiskusiBisnis"
5. [ ] Tap icon dari home screen
6. [ ] App buka dalam mode standalone (no browser UI)
7. [ ] Splash screen muncul saat loading
8. [ ] Navigation bar berwarna theme (#2563eb)

### Safari (iOS)
1. [ ] Buka aplikasi di Safari mobile
2. [ ] Tap Share button (icon dengan arrow ke atas)
3. [ ] Scroll dan tap "Add to Home Screen"
4. [ ] Edit nama jika perlu
5. [ ] Tap "Add"
6. [ ] Icon muncul di home screen
7. [ ] Tap icon untuk buka app
8. [ ] App buka fullscreen tanpa Safari UI

### Edge Desktop
1. [ ] Buka aplikasi di Edge
2. [ ] Icon "App available" di address bar
3. [ ] Klik untuk install
4. [ ] App installed di Windows Start Menu
5. [ ] Dapat dipin ke taskbar

## 🔌 Offline Testing

### Test Offline Functionality
1. [ ] Buka aplikasi dalam mode online
2. [ ] Navigate ke beberapa halaman
3. [ ] Buka DevTools > Network tab
4. [ ] Set throttling ke "Offline"
5. [ ] Reload halaman
6. [ ] Offline page muncul dengan UI yang baik
7. [ ] Message "Anda Sedang Offline" ditampilkan
8. [ ] Button "Coba Lagi" berfungsi
9. [ ] Set network ke "Online"
10. [ ] Klik "Coba Lagi" atau auto reload
11. [ ] Halaman kembali normal

### Test Offline Indicator
1. [ ] Matikan wifi/internet saat app terbuka
2. [ ] Banner orange "Tidak ada koneksi internet" muncul di top
3. [ ] Nyalakan kembali internet
4. [ ] Banner hilang otomatis

## 📱 Mobile-Specific Features

### Touch Optimization
1. [ ] Semua buttons minimal 44x44px (easy to tap)
2. [ ] No text selection pada double-tap
3. [ ] No highlight flash saat tap
4. [ ] Smooth scrolling
5. [ ] Pull-to-refresh disabled

### Safe Area (iOS)
1. [ ] Content tidak tertutup notch (iPhone X+)
2. [ ] Bottom navigation tidak tertutup home indicator
3. [ ] Padding safe area berfungsi

### Orientation
1. [ ] Portrait mode optimal
2. [ ] Landscape mode functional
3. [ ] Content adjusts properly

## 🔔 Notification Testing

### Permission Request
1. [ ] Open app
2. [ ] Check notification permission (dapat manual test via console)
3. [ ] Request notification permission
4. [ ] Permission prompt muncul
5. [ ] Accept permission
6. [ ] Test notification tampil

### Push Notifications (Manual)
```javascript
// Test di browser console
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(registration => {
    registration.showNotification('Test Notification', {
      body: 'Ini adalah test notifikasi dari DiskusiBisnis',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png'
    });
  });
}
```

## 🚀 Performance Testing

### Loading Speed
1. [ ] First Contentful Paint < 2s
2. [ ] Time to Interactive < 5s
3. [ ] Lighthouse Performance > 90

### Cache Performance
1. [ ] Subsequent page loads < 1s
2. [ ] Images load from cache
3. [ ] API responses cached appropriately

## 🎨 Visual Testing

### Icons & Branding
1. [ ] App icon = logodiskusibisnis.png
2. [ ] Favicon menggunakan logo yang benar
3. [ ] Splash screen logo terlihat baik
4. [ ] Icon sharp dan tidak pixelated

### Colors
1. [ ] Theme color konsisten (#2563eb)
2. [ ] Background color putih (#ffffff)
3. [ ] Status bar style sesuai (default)

## 🔄 Update Testing

### Service Worker Update
1. [ ] Make changes to code
2. [ ] Build new version
3. [ ] Deploy
4. [ ] Open app yang sudah installed
5. [ ] New service worker detected
6. [ ] Update prompt muncul
7. [ ] Reload untuk update

## 🔗 App Shortcuts Testing

### Long Press Icon (Android)
1. [ ] Long press app icon di home screen
2. [ ] Shortcuts menu muncul:
   - [ ] Tanya Sekarang
   - [ ] Pertanyaan Terbaru
   - [ ] Komunitas
3. [ ] Tap each shortcut
4. [ ] Navigates ke halaman yang benar

## 📊 Lighthouse PWA Audit Checklist

Run Lighthouse PWA audit dan verify:

1. [ ] ✓ Installable
   - [ ] manifest.json present
   - [ ] Service worker registered
   - [ ] HTTPS or localhost
2. [ ] ✓ PWA Optimized
   - [ ] Fast and reliable
   - [ ] Works offline
   - [ ] Installable
3. [ ] ✓ Icons
   - [ ] 192px icon
   - [ ] 512px icon
   - [ ] Maskable icons
4. [ ] ✓ Splash Screen
   - [ ] name
   - [ ] background_color
   - [ ] theme_color
   - [ ] icons
5. [ ] ✓ Themed Omnibox
   - [ ] theme_color set
6. [ ] ✓ Viewport
   - [ ] viewport meta tag
7. [ ] ✓ Content Sized
   - [ ] Content sized correctly
8. [ ] ✓ Display Mode
   - [ ] display: standalone

## 🌍 Cross-Platform Testing Matrix

| Platform | Browser | Install | Offline | Notifications | Status |
|----------|---------|---------|---------|---------------|--------|
| Android  | Chrome  | [ ]     | [ ]     | [ ]           | ⏳     |
| Android  | Firefox | [ ]     | [ ]     | [ ]           | ⏳     |
| Android  | Samsung | [ ]     | [ ]     | [ ]           | ⏳     |
| iOS      | Safari  | [ ]     | [ ]     | [ ]           | ⏳     |
| iOS      | Chrome  | [ ]     | [ ]     | N/A           | ⏳     |
| Windows  | Chrome  | [ ]     | [ ]     | [ ]           | ⏳     |
| Windows  | Edge    | [ ]     | [ ]     | [ ]           | ⏳     |
| macOS    | Chrome  | [ ]     | [ ]     | [ ]           | ⏳     |
| macOS    | Safari  | [ ]     | [ ]     | [ ]           | ⏳     |
| Linux    | Chrome  | [ ]     | [ ]     | [ ]           | ⏳     |

## 🐛 Known Issues / Workarounds

### iOS Safari
- Service Worker has limitations
- No install prompt (manual Add to Home Screen)
- Push notifications not supported

### Desktop Safari
- Limited PWA support
- No install prompt

### Firefox
- Install prompt may not appear automatically
- Manual installation via menu

## ✨ Success Criteria

Aplikasi dianggap PWA-ready jika:
- [x] Lighthouse PWA score ≥ 90
- [ ] Dapat diinstall di minimal 3 platforms
- [ ] Works offline dengan graceful degradation
- [ ] Service Worker registered successfully
- [ ] All icons load correctly
- [ ] Theme colors applied
- [ ] Fast load time (< 3s)

## 📝 Testing Notes

Tanggal testing: _____________

Tested by: _____________

Devices tested:
- [ ] Android Phone:
- [ ] iPhone:
- [ ] Desktop:

Issues found:
1. 
2. 
3. 

Resolutions:
1. 
2. 
3. 

## 🎉 Sign-off

PWA implementation verified and approved:

- [ ] Developer: ________________
- [ ] QA: ________________
- [ ] Product Owner: ________________

Date: _____________
