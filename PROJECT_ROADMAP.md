# My Style Muse - Project Roadmap

> Last Updated: December 29, 2025

---

## 📊 Current Project Status

### ✅ Completed Features

#### Core Functionality

- **User Authentication** — Sign up, login, logout with Supabase Auth
- **User Profile** — Style preferences, body type, height, budget, preferred brands, gender
- **Onboarding Flow** — Multi-step wizard to capture initial style preferences

#### Wardrobe Management

- **Add/Edit/Delete Items** — Full CRUD for wardrobe items
- **Item Details** — Name, category, color, brand, occasion, season
- **Search & Filters** — Search by name, filter by category, color, wash status
- **Sort Options** — Newest, oldest, name, most worn, least worn, needs wash, recently worn
- **Wardrobe Insights** — Category distribution, color analysis, season coverage, versatility score

#### Laundry Tracking System

- **Wear Tracking** — Counts wears per item, tracks last worn date
- **Custom Wash Thresholds** — Per-item setting for wears before wash needed
- **Laundry Basket** — View all items that need washing
- **Wash Logging** — Mark items as washed with wash type and notes
- **Laundry History** — View past wash logs with item names
- **Navigation Badge** — Shows count of dirty items in nav
- **Dashboard Widget** — Alert widget when items need washing
- **Wash Status on Outfit Items** — Visual indicators on Looks page

#### AI Outfit Generation

- **Daily Outfit Recommendations** — Gemini AI generates outfits from wardrobe
- **Weather Integration** — Uses location weather in recommendations
- **Style Profile Context** — AI considers user's declared preferences
- **Prefer Clean Items** — Toggle to avoid dirty items in suggestions
- **Save to Collection** — Save generated outfits
- **Mark as Worn** — Log outfit and increment wear counts

#### Additional Features

- **Saved Outfits Page** — View and manage saved outfit collections
- **Calendar Planning** — Plan outfits for future dates/occasions
- **Shopping Wishlist** — Track items to buy with priority and links
- **Style Boards** — Create mood boards with colors and tags
- **Style Streak** — Gamification for consistent outfit logging
- **Weather Widget** — Current weather on dashboard

---

## 🚀 Upcoming Features

### ✅ Phase 1: Style Intelligence System (COMPLETED)

#### 1.1 Enhanced Data Capture

- [x] Add `style_tags` field (minimalist, streetwear, romantic, etc.)
- [x] Add `pattern` field (solid, stripes, floral, plaid, etc.)
- [x] Add `secondary_color` field for multi-color items
- [x] Add `material` field (cotton, denim, silk, wool, etc.)
- [x] Add `fit` field (fitted, regular, relaxed, oversized)
- [x] Update Add/Edit Item forms with new fields
- [x] Database migration for new columns

#### 1.2 Style Analyzer Engine

- [x] Create `src/lib/styleAnalyzer.ts` utility
- [x] Calculate style distribution from wardrobe (e.g., "60% minimalist")
- [x] Extract actual color palette vs declared preference
- [x] Identify style gaps and variety opportunities
- [x] Create `useStyleProfile` hook

#### 1.3 Color Harmony System

- [x] Create `src/lib/colorHarmony.ts` utility
- [x] Complementary color mappings
- [x] Analogous color relationships
- [x] Show suggestions when adding items ("pairs well with your Navy collection")

#### 1.4 Style DNA Visualization

- [x] Add "Style DNA" section to Wardrobe Insights
- [x] Visual breakdown chart of style distribution
- [x] Compare learned vs declared preferences
- [x] Show color palette analysis

#### 1.5 Enhanced AI Integration

- [x] Pass rich style context to Gemini (actual style mix, wear frequency)
- [x] Include color temperature analysis (warm/cool palette)
- [x] Add "why this outfit" explanations
- [x] Reference user's style DNA in recommendations

---

### Phase 2: Image Upload System

#### 2.1 Storage Setup

- [ ] Create Supabase Storage bucket for wardrobe images
- [ ] Set up RLS policies for user image access
- [ ] Configure image compression/optimization

#### 2.2 Upload UI

- [ ] Add image upload to Add Item form
- [ ] Drag-and-drop support
- [ ] Camera capture for mobile
- [ ] Image preview and crop

#### 2.3 Visual Wardrobe

- [ ] Display item thumbnails in wardrobe grid
- [ ] Larger image view in item details
- [ ] Fallback icons for items without photos

#### 2.4 Auto Color Extraction (Optional)

- [ ] Extract dominant colors from uploaded images
- [ ] Auto-suggest color field based on image
- [ ] Pattern detection (future enhancement)

---

### Phase 3: Outfit-Wardrobe Linking

#### 3.1 Item ID Tracking

- [ ] Modify generate-outfit to return wardrobe item IDs (not just names)
- [ ] Link saved outfits to actual wardrobe entries in `outfit_item_logs`
- [ ] Enable accurate per-item wear tracking from outfits

#### 3.2 Outfit History View

- [ ] Create dedicated "What I Wore" page
- [ ] Show past outfits with dates and photos
- [ ] Filter by date range, occasion, season
- [ ] Display "most worn combinations" stats

---

### Phase 4: Calendar + Wardrobe Integration

#### 4.1 Outfit Planning

- [ ] Add outfit picker when creating calendar entries
- [ ] Select from saved outfits or build custom
- [ ] Show outfit preview on calendar day view

#### 4.2 Smart Warnings

- [ ] Warn if planned outfit includes item needing wash
- [ ] Alert if item is already planned for nearby date
- [ ] Suggest alternatives for dirty items

---

### Phase 5: Cost & Value Analytics

#### 5.1 Price Tracking

- [ ] Add purchase price input to Add/Edit Item forms
- [ ] Add purchase date field
- [ ] Track cost data in wardrobe

#### 5.2 Analytics Dashboard

- [ ] Calculate cost-per-wear for each item
- [ ] Display total wardrobe value
- [ ] Show ROI insights ("Best value: Blue Jeans at $0.50/wear")
- [ ] Identify underutilized expensive items

---

### Phase 6: Shopping-Wardrobe Flow

#### 6.1 Purchase Conversion

- [ ] Add "Add to Wardrobe" button on purchased wishlist items
- [ ] Pre-fill wardrobe form with shopping item data
- [ ] Optional auto-add toggle on purchase

#### 6.2 Smart Shopping Suggestions

- [ ] Suggest items that fill wardrobe gaps
- [ ] Recommend colors that complement existing palette
- [ ] Show "this would complete X outfits" insights

---

## 🛠 Technical Debt & Improvements

### 🔴 Critical (Security)

- [x] Add `.env` to `.gitignore` (FIXED - credentials were exposed)
- [x] Create `.env.example` for documentation
- [x] Remove `.env` from git tracking (`git rm --cached .env`)
- [ ] Rotate Supabase anon key if previously committed to **public** git (N/A - private repo)

### 🟡 High Priority (Type Safety)

- [x] Enable TypeScript strict mode (`"strict": true`) ✅
- [x] Add `forceConsistentCasingInFileNames` to tsconfig
- [x] Add `noFallthroughCasesInSwitch` to tsconfig
- [x] Enable `noImplicitAny: true` (included in strict)
- [x] Remove `any` types from hooks and pages (useDataQueries, Looks, Laundry, SavedOutfits)
- [x] Create centralized `src/types/index.ts` for shared types
- [x] Add `OutfitItem` type for proper outfit item typing

### 🟡 Architecture (Refactor Candidates)

- [x] Extract types from `useDataQueries.ts` to `src/types/index.ts` (~150 lines moved)
- [x] Add code-splitting with lazy loaded routes (752KB → multiple chunks)
- [x] Split vendor chunks (React, Radix, Supabase, Charts separated)
- [ ] Further split `useDataQueries.ts` (1940 lines) into domain modules:
  - `hooks/useWardrobeQueries.ts`
  - `hooks/useOutfitQueries.ts`
  - `hooks/useLaundryQueries.ts`
  - `hooks/useProfileQueries.ts`

### 🟢 Medium Priority (Code Quality)

- [ ] Fix inline CSS style lint warnings (move to CSS classes)
- [ ] Add Deno types for Supabase edge functions (local dev only)
- [ ] Add comprehensive error handling
- [ ] Add loading states for all async operations
- [ ] Improve mobile responsiveness

### 🔵 Low Priority (Nice to Have)

- [ ] Add unit tests for utility functions
- [ ] Add E2E tests for critical flows
- [ ] Set up CI/CD pipeline
- [ ] Add bundle size monitoring

---

## 📁 Key Files Reference

| Area              | Files                                                           |
| ----------------- | --------------------------------------------------------------- |
| **Wardrobe**      | `src/pages/Wardrobe.tsx`, `src/components/WardrobeInsights.tsx` |
| **Laundry**       | `src/pages/Laundry.tsx`, laundry hooks in `useDataQueries.ts`   |
| **AI Generation** | `supabase/functions/generate-outfit/index.ts`                   |
| **Profile**       | `src/pages/Profile.tsx`, `src/pages/Onboarding.tsx`             |
| **Constants**     | `src/lib/constants.ts`                                          |
| **Data Layer**    | `src/hooks/useDataQueries.ts`                                   |
| **Navigation**    | `src/components/Navigation.tsx`, `src/components/MobileNav.tsx` |
| **Database**      | `supabase/migrations/*.sql`                                     |

---

## 📝 Notes

_Add your notes and priority adjustments here before implementation begins._
