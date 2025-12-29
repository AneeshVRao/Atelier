# Atelier

A personal wardrobe intelligence system that tracks what you actually wear, manages laundry cycles, and provides contextual outfit recommendations.

---

## Problem Statement

Most wardrobe apps focus on cataloging clothes. They miss the more useful question: _what should I wear today, given what's clean, what I've worn recently, and what the weather looks like?_

Atelier approaches this differently. It tracks wear frequency and laundry state per item, builds a profile of your actual style from usage patterns (not just what you say you like), and uses that context to generate practical outfit suggestions.

The goal is simple: reduce morning decision fatigue by surfacing outfits that make sense for _your_ wardrobe, _today_.

---

## Core Features

### Wardrobe Management

- Add, edit, and delete clothing items with detailed metadata
- Fields include: category, color, secondary color, pattern, material, fit, style tags, occasion, season
- Search by name, category, brand, or color
- Filter by category, color, or wash status
- Sort by wear frequency, last worn date, or wash status

### Laundry Tracking

- Track wear count per item with customizable wash thresholds
- View items that need washing in a dedicated laundry basket
- Log washes with type (machine, hand, dry clean) and notes
- Visual indicators on items showing clean/dirty state
- Dashboard alerts when items need attention

### Style Intelligence

- Automatic style distribution analysis (e.g., "65% minimalist, 20% casual")
- Color palette extraction from your actual wardrobe
- Gap analysis for wardrobe variety
- Versatility scoring based on item usage patterns

### AI Outfit Recommendations

- Daily suggestions powered by Google Gemini
- Context includes: weather, occasion, style profile, wear history
- Option to exclude dirty items from suggestions
- Explanations for why each outfit was chosen
- Save outfits to collections or mark as worn

### Additional Tools

- Calendar-based outfit planning for future events
- Shopping wishlist with priority levels
- Style boards for visual inspiration
- Style streak gamification for consistent logging
- Weather widget on dashboard

---

## System Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                            │
│  Add items → Log outfits → Mark washes → Request suggestions    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SUPABASE BACKEND                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Auth       │  │  Database   │  │  Edge Functions         │  │
│  │  (Users)    │  │  (Items,    │  │  (generate-outfit)      │  │
│  │             │  │   Outfits,  │  │                         │  │
│  │             │  │   Logs)     │  │                         │  │
│  └─────────────┘  └─────────────┘  └───────────┬─────────────┘  │
└────────────────────────────────────────────────┼────────────────┘
                                                 │
                              ┌──────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STYLE ANALYZER                             │
│  Wardrobe data → Style distribution → Color analysis → Gaps    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GEMINI API                                 │
│  Style context + Weather + Preferences → Outfit recommendations │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      REACT FRONTEND                             │
│  Display suggestions → User selects → Wear counts update        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer        | Technology                                  |
| ------------ | ------------------------------------------- |
| Frontend     | React 18, TypeScript, Vite                  |
| Styling      | Tailwind CSS, shadcn/ui, Radix primitives   |
| State & Data | TanStack Query, React Context               |
| Backend      | Supabase (Auth, PostgreSQL, Edge Functions) |
| AI           | Google Gemini API (via Edge Function)       |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Google AI Studio API key (for Gemini)

### Installation

```bash
# Clone the repository
git clone https://github.com/AneeshVRao/Atelier.git
cd Atelier

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Environment Variables

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_URL=https://your_project_id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL migrations in `supabase/migrations/` (in order)
3. Set the Gemini API key as an Edge Function secret:
   ```bash
   npx supabase secrets set GEMINI_API_KEY=your_gemini_api_key
   ```
4. Deploy the Edge Function:
   ```bash
   npx supabase functions deploy generate-outfit
   ```

### Run Locally

```bash
npm run dev
```

---

## Key Design Decisions

### Laundry as First-Class Data

Most wardrobe apps ignore garment state. Atelier tracks wear counts and wash status because recommending a shirt you wore three times this week isn't helpful.

### Learned Style Over Declared Style

Users often describe their style aspirationally. The style analyzer examines what's actually in the wardrobe and how often items are worn, then compares this to stated preferences.

### AI as the Last Step

Gemini receives rich context—style distribution, color analysis, weather, clean items only—so it can make informed suggestions rather than generic ones. The AI doesn't drive the system; it consumes the system's intelligence.

### TypeScript Strict Mode

The codebase runs with `strict: true`. All types are explicit. No `any` escape hatches in application code.

### Code Splitting

Routes are lazy-loaded. Vendor dependencies are chunked by domain (React, Radix, data libraries, charts). Initial JS bundle is ~114KB (gzip: ~35KB).

---

## Roadmap

**Completed:**

- Core wardrobe CRUD
- Laundry tracking system
- Style intelligence engine
- AI outfit generation with context

**Next:**

- Image upload for wardrobe items
- Link saved outfits to specific wardrobe item IDs
- "What I Wore" history view with photos
- Calendar integration for outfit planning

---

## Notes

This is a personal project under active development. It's not production-ready and isn't accepting external contributions at this time.

If you're exploring the codebase for learning purposes, start with:

- `src/lib/styleAnalyzer.ts` — core style analysis logic
- `src/hooks/useDataQueries.ts` — TanStack Query patterns
- `supabase/functions/generate-outfit/index.ts` — AI integration

---

MIT License
