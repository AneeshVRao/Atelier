# Atelier - AI-Powered Style Assistant

Your personal AI fashion stylist that helps you build outfits from your wardrobe based on weather, occasions, and your unique style preferences.

## Features

- 🎨 **AI Outfit Recommendations** - Get daily outfit suggestions powered by Google Gemini
- 👗 **Digital Wardrobe** - Catalog and organize your clothing items
- 🌤️ **Weather-Aware** - Outfit suggestions consider current weather conditions
- 📅 **Calendar Planning** - Plan outfits for upcoming events
- 🛍️ **Shopping List** - Track items you want to add to your wardrobe
- 🔥 **Style Streak** - Build consistency with daily outfit logging

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **AI**: Google Gemini API
- **Data Fetching**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Google AI Studio API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Start development server
npm run dev
```

### Supabase Setup

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/`
3. Add `GEMINI_API_KEY` to your Supabase Edge Function secrets
4. Deploy the Edge Functions:
   ```bash
   supabase functions deploy generate-outfit
   ```

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## License

MIT
