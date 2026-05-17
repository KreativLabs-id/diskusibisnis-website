# Design Spec: Tags Page Redesign

**Date**: 2026-04-29
**Topic**: Tags Page Redesign
**Status**: Approved (Option B: Clean Bottom + Glassmorphism)

## 1. Objective
Redesign the Tags page to move away from "AI generic" aesthetics towards a minimalist, modern forum look.

## 2. Visual Style
- **Aesthetic**: Refined Minimalism + Subtle Glassmorphism.
- **Color Palette**: 
  - Monochromatic base with Emerald/Teal accents.
  - Transparent surfaces with backdrop blur.
- **Typography**: Focused on hierarchy and readability.

## 3. UI Components

### 3.1 Header
- **Icon**: Minimal hashtag or tag icon in a soft background square.
- **Title**: Large, bold "Topik Bisnis" or "Tags".
- **Subtitle**: Single line description.

### 3.2 Search & Filters
- **Search Bar**: Full-width or integrated with filters. Glass effect background.
- **Filters**: Minimalist buttons for "Populer" and "Nama".

### 3.3 Tag Cards (Refined Grid)
- **Container**: Glass effect (`backdrop-blur-md`), rounded corners (`2xl`).
- **Layout**:
  - Top: Tag label pill (subtle background).
  - Middle: Tag name (large, bold).
  - Bottom: Description (max 2 lines) + Discussion count.
- **Interaction**: Subtle hover scale and border glow.

### 3.4 Footer
- **Approach**: Option B (Clean Bottom). 
- **Details**: Remove the large "Tips" box. The layout should end cleanly after the grid.

## 4. Technical Implementation
- **File**: `frontend/app/(main)/tags/page.tsx`
- **Stack**: Next.js, Tailwind CSS (Vanilla CSS for glass effects if needed), Lucide React.
- **Responsiveness**: Mobile-first, scaling to 3 columns on desktop.

## 5. Success Criteria
- The page feels premium and unique.
- Visual noise is reduced.
- Navigation to specific tags remains intuitive.
