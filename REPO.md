# Macro Tracker Application (Onigiri) - Comprehensive Documentation

## Project Overview

Onigiri is a modern, AI-powered macro tracking application designed to help users track their daily nutritional intake. The application allows users to log food entries organized by meal type (breakfast, lunch, dinner), set nutritional goals, maintain a personalized food database, and export their data for further analysis. The app features a clean, mobile-friendly interface with real-time progress tracking and AI-powered food image analysis capabilities.

## Tech Stack

### Frontend
- **Next.js 15.5.7** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript** - Type safety throughout the application
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui components** - Reusable UI components built with Radix UI

### Backend & Database
- **Convex** - Backend-as-a-Service providing real-time database, authentication, and server functions
- **Convex Schema** - Defines data models for Foods, Entries, and Goals

### Authentication
- **Clerk** - Complete authentication solution with sign-in/sign-out functionality

### AI & Machine Learning
- **OpenAI AI SDK (v5)** - AI integration framework
- **GPT-5-nano model** - Food image analysis for extracting nutritional information
- **Cloudflare Vectorize** - Vector database for semantic search of food images

### Deployment
- **Cloudflare Workers** - Edge computing platform
- **OpenNext.js for Cloudflare** - Next.js adapter for Cloudflare deployment
- **Cloudflare R2** - Object storage for food images
- **Cloudflare Pages** - Custom domain: `macros.joshuakirby.webcam`

### Additional Libraries
- **React Hook Form** - Form management with Zod validation
- **TanStack Query (React Query)** - Data fetching and caching
- **date-fns** - Date manipulation utilities
- **Zustand** - State management for selected dates
- **Sonner** - Toast notifications
- **Motion (Framer Motion)** - Animations
- **Recharts** - Charts and visualizations

## Key Features

### 1. Food Tracking
- **Meal-based Organization**: Entries are categorized by breakfast, lunch, and dinner
- **Real-time Progress**: Visual progress bars show how close users are to their daily goals
- **Quantity Management**: Track fractional servings (e.g., 0.5 servings, 1.5 servings)
- **Smart Meal Detection**: Automatically suggests meal type based on time of day (before 11am = breakfast, before 4pm = lunch, otherwise = dinner)

### 2. Food Database
- **Personal Food Library**: Users can create and manage their own food items
- **Food Search**: Command palette-style search (Cmd/Ctrl+K) with fuzzy matching
- **Image Integration**: Each food item has an associated image from the Thiings emoji/food icon library
- **Nutritional Information**: Track calories, protein, fat, carbs, fiber, and sugar
- **Serving Size Management**: Define custom serving sizes and units

### 3. Goals Management
- **Meal-specific Goals**: Set different targets for breakfast, lunch, and dinner
- **Macro Tracking**: Set goals for calories, protein, fat, carbs, and fiber
- **Daily Totals**: Automatically calculate daily totals from meal goals
- **Calculated Calories**: Option to calculate calories from macros (Protein × 4 + Carbs × 4 + Fat × 9)
- **Date-based Goals**: Goals persist from the set date forward

### 4. AI-Powered Image Analysis
- **Nutrition Label Scanning**: Upload images of nutrition labels to automatically extract nutritional data
- **Smart Extraction**: Uses GPT-5-nano to extract structured data from packaging images
- **Base64 Support**: Accepts images uploaded as base64 strings
- **Validation**: Only outputs fields that can be clearly read, avoiding hallucinations

### 5. Export Functionality
- **Date Range Selection**: Export entries for any date range
- **Meal Filtering**: Choose which meals to include in export
- **Nutrition Field Selection**: Select which nutritional fields to export
- **Multiple Formats**: Copy to clipboard or download as markdown file
- **Integration Ready**: Markdown format ideal for sharing with ChatGPT or other AI tools

### 6. User Experience Features
- **Date Navigation**: Browse entries for any date with easy navigation
- **Carousel UI**: Swipeable meal cards for mobile users
- **Quick Actions**: Add foods from a floating bottom bar
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Dark Mode**: Theme support for light and dark modes
- **Keyboard Shortcuts**: Cmd/Ctrl+K for quick food search

## Architecture

### Directory Structure

```
macro-tracker/
├── app/                          # Next.js App Router pages
│   ├── _components/              # Shared app-level components
│   │   ├── layout/              # Layout components (navbar, providers)
│   │   └── page/                # Page-specific components (today-entries, food-adder)
│   ├── create/                  # Create new food page
│   ├── export/                  # Export entries page
│   ├── foods/                   # Food management pages
│   │   ├── [foodId]/           # Dynamic food detail pages
│   │   └── page.tsx            # Food list page
│   ├── settings/               # Goals settings page
│   ├── sign-in/                # Clerk authentication page
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home page (today's entries)
│   └── globals.css             # Global styles
├── components/                  # Reusable React components
│   ├── entry/                  # Entry-related components
│   ├── food/                   # Food-related components
│   │   └── food-form/         # Food form subcomponents
│   ├── shadcn/                 # UI components from shadcn/ui
│   └── ...other components
├── convex/                      # Convex backend functions
│   ├── auth.config.ts         # Convex-Clerk integration
│   ├── entries.ts             # Entry queries and mutations
│   ├── foods.ts               # Food queries and mutations
│   ├── goals.ts               # Goal queries and mutations
│   └── schema.ts              # Database schema definition
├── actions/                     # Server Actions
│   ├── food/                  # Food-related actions
│   │   └── analyze-food-image-action.ts
│   └── search-thiings-action.ts
├── utils/                       # Utility functions
│   ├── ai.ts                  # AI utilities
│   ├── thiings/               # Thiings image search utilities
│   ├── date-util.ts           # Date manipulation utilities
│   ├── entry-util.ts          # Entry calculation utilities
│   ├── export-util.ts         # Export formatting utilities
│   └── ...other utilities
├── package.json                # Dependencies and scripts
├── next.config.ts             # Next.js configuration
├── wrangler.json              # Cloudflare Workers configuration
└── tsconfig.json              # TypeScript configuration
```

### Data Models

#### Food Schema
```typescript
{
  _id: string,
  userId: string,              // Owner's Clerk user ID
  name: string,                // Food name
  image: string,               // Image filename (Thiings emoji)
  brand?: string,              // Brand name (optional)
  description?: string,        // Additional details (optional)
  servingSize: number,         // Numerical serving size
  servingUnit: string,         // Unit (e.g., "cup", "g", "servings")
  calories: number,            // Calories per serving
  protein: number,             // Protein in grams per serving
  fat: number,                 // Fat in grams per serving
  carbs: number,               // Carbs in grams per serving
  sugar: number,               // Sugar in grams per serving
  fiber: number,               // Fiber in grams per serving
  createdAt: number,           // Creation timestamp
  updatedAt: number,           // Last update timestamp
  touchedAt: number            // Last accessed timestamp (for sorting)
}
```

#### Entry Schema
```typescript
{
  _id: string,
  userId: string,              // Owner's Clerk user ID
  foodId: string,              // Reference to Food document
  quantity: number,             // Number of servings consumed
  entryDate: string,           // Date string (format: "YYYY-MM-DD")
  mealType: "breakfast" | "lunch" | "dinner",
  note?: string,               // Optional notes
  createdAt: number,           // Creation timestamp
  updatedAt: number            // Last update timestamp
}
```

#### Goal Schema
```typescript
{
  _id: string,
  userId: string,              // Owner's Clerk user ID
  startDate: string,           // Start date for goal (format: "YYYY-MM-DD")
  breakfast?: {                // Breakfast targets
    calories?: number,
    protein?: number,
    fat?: number,
    carbs?: number,
    fiber?: number
  },
  lunch?: {                    // Lunch targets
    calories?: number,
    protein?: number,
    fat?: number,
    carbs?: number,
    fiber?: number
  },
  dinner?: {                   // Dinner targets
    calories?: number,
    protein?: number,
    fat?: number,
    carbs?: number,
    fiber?: number
  },
  createdAt: number,           // Creation timestamp
  updatedAt: number            // Last update timestamp
}
```

### Convex Backend Functions

#### Foods (`convex/foods.ts`)
- **`create`**: Mutation to create a new food item with authentication
- **`forUser`**: Query to get all foods for the authenticated user
- **`byId`**: Query to get a specific food by ID (user-scoped)
- **`update`**: Mutation to update an existing food item
- **`updateQuantitiesForFood`**: Mutation to scale all entry quantities when a food's serving size changes

#### Entries (`convex/entries.ts`)
- **`create`**: Mutation to create a new food entry with authentication
- **`withFoodsForDate`**: Query to get entries and related foods for a specific date
- **`update`**: Mutation to update an existing entry
- **`byFoodId`**: Query to get all entries for a specific food
- **`remove`**: Mutation to delete an entry
- **`withFoodsForDateRange`**: Query to get entries and foods for a date range (for export)

#### Goals (`convex/goals.ts`)
- **`createOrUpdate`**: Mutation to create or update goals for a date (updates if goal exists for that date)
- **`forDate`**: Query to get the most recent goal that applies to a given date (finds goal with latest startDate ≤ query date)

### Component Organization

#### App Pages
- **`app/page.tsx`**: Home page showing today's entries with date controller, entries display, and food adder
- **`app/foods/page.tsx`**: Food list with search functionality
- **`app/foods/[foodId]/page.tsx`**: Food detail/edit page
- **`app/settings/page.tsx`**: Goals configuration form
- **`app/export/page.tsx`**: Data export with filtering options
- **`app/create/page.tsx`**: Create new food form

#### Page Components (`app/_components/page/`)
- **`today-entries.tsx`**: Carousel displaying today's entries organized by meal with progress tracking
- **`food-adder.tsx`**: Floating bottom bar for quickly adding food entries
- **`selected-date-controller.tsx`**: Date navigation component

#### Shared Components (`components/`)
- **`food/food-form/food-form.tsx`**: Reusable form for creating/editing foods
- **`food/food-command.tsx`**: Command palette for food selection with keyboard shortcut
- **`food/food-form/food-form-upload-image.tsx`**: Image upload component for AI analysis
- **`entry/entry-item.tsx`**: Individual entry display with edit/delete actions
- **`foods-list.tsx`**: List of all foods with search filtering

#### Server Actions (`actions/`)
- **`analyze-food-image-action.ts`**: AI-powered nutrition label extraction using GPT-5-nano
- **`search-thiings-action.ts`**: Vector search for food images using Cloudflare Vectorize

## Key Files and Their Purposes

### Configuration Files
- **`package.json`**: Project dependencies, including Next.js 15, React 19, Convex, Clerk, OpenAI AI SDK, and shadcn/ui components
- **`next.config.ts`**: Next.js configuration with image remote patterns and server action body size limits
- **`wrangler.json`**: Cloudflare Workers deployment configuration with custom domains, R2 buckets, and Vectorize bindings
- **`middleware.ts`**: Clerk authentication middleware protecting all routes except static assets

### Core Application Files
- **`app/layout.tsx`**: Root layout wrapping the app with Clerk, React Query, Convex, and Theme providers, plus global header and service worker registration
- **`convex/schema.ts`**: Database schema definitions using Zod with Convex helper utilities for type safety
- **`utils/entry-util.ts`**: Utility functions for calculating totals, determining meal type from time, and aggregating nutritional data

### Feature Implementation Files
- **`app/_components/page/today-entries.tsx`**: Main dashboard showing daily consumption with meal-specific progress bars and color-coded indicators
- **`app/settings/_components/settings-form.tsx`**: Goals management with automatic calculation of daily totals and calorie-from-macros computation
- **`app/export/page.tsx`**: Export functionality with date range picker, meal/nutrition filters, and markdown generation
- **`actions/food/analyze-food-image-action.ts`**: Server action that sends food images to GPT-5-nano for structured nutrition data extraction

### Utility Files
- **`utils/thiings/thiings.ts`**: Thiings image search integration with Cloudflare Vectorize for semantic matching of food images
- **`utils/ai.ts`**: Abstraction layer for OpenAI API calls (embeddings and object generation)
- **`utils/date-util.ts`**: Date manipulation utilities including Zustand store for selected date state
- **`utils/export-util.ts`**: Markdown export formatting utilities with nutrition field labels

## Data Flow

### Adding a Food Entry
1. User opens FoodAdder (bottom bar on home page)
2. User searches for food using FoodCommand (Cmd+K shortcut)
3. User selects food and sets quantity and meal type
4. `api.entries.create` mutation is called with selected date
5. Entry is inserted into Convex database with user authentication
6. Food's `touchedAt` timestamp is updated for sorting
7. TodayEntries component automatically updates via real-time subscription

### Creating a New Food
1. User navigates to /create
2. User fills out FoodForm (name, brand, description, serving info, macros)
3. User can optionally upload an image for AI analysis
4. If image uploaded, `analyzeFoodImageAction` extracts nutrition data
5. Form data is submitted to `api.foods.create` mutation
6. New food is inserted into Convex database
7. User is redirected to home page with new food pre-selected in FoodAdder

### Setting Goals
1. User navigates to /settings
2. SettingsForm loads current goal for today (or latest past goal)
3. User modifies goals for breakfast, lunch, and dinner
4. Form calculates daily totals automatically
5. User submits form
6. `api.goals.createOrUpdate` mutation is called
7. Goal is either created or updated for today's date
8. Goal persists for all future dates until changed again

### Exporting Data
1. User navigates to /export
2. User selects date range and filters
3. Component calls `api.entries.withFoodsForDateRange` query
4. Entries are filtered by selected meals
5. `exportUtil.generateMarkdown` formats data as markdown
6. User can copy to clipboard or download as .md file

## Authentication & Authorization

- **Clerk Middleware**: All routes require authentication (protected via `clerkMiddleware`)
- **Convex Auth**: Integration between Clerk and Convex using Clerk's JWT tokens
- **User Isolation**: All Convex queries and mutations check `ctx.auth.getUserIdentity()` and filter by `userId`
- **Authorization**: Users can only access their own foods, entries, and goals
- **Public Routes**: Only sign-in page (`/sign-in`) is publicly accessible

## Deployment

### Development
```bash
pnpm dev  # Runs Next.js dev server with Turbopack
```

### Building for Production
```bash
pnpm build  # Builds Next.js app
```

### Cloudflare Deployment
```bash
pnpm deploy  # Deploys to Cloudflare Workers with Convex
```

The application uses:
- **OpenNext.js for Cloudflare** to adapt Next.js for Cloudflare Workers
- **Cloudflare R2** for storing food images
- **Cloudflare Vectorize** for semantic food image search
- **Custom domains**: `macros.joshuakirby.webcam` and `www.macros.joshuakirby.webcam`

## Future Enhancements (from TODO.md)
- Add custom metrics: erythritol, sucralose, etc.
- Create comprehensive food dataset
- Show summaries/trends similar to Apple Health
- Enhanced AI-powered food recognition from photos (not just nutrition labels)

## Summary

Onigiri is a well-architected, full-stack macro tracking application that combines modern web technologies (Next.js 15, React 19) with innovative backend solutions (Convex, Cloudflare). The app provides a user-friendly interface for tracking nutritional intake, with AI-powered features that reduce manual data entry. The architecture emphasizes type safety (TypeScript, Zod), developer experience (React Hook Form, TanStack Query), and performance (edge deployment, real-time updates). The modular component structure and clear separation of concerns make the codebase maintainable and extensible.
