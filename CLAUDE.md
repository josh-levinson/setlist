# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Comedy Setlist Manager built with React, TypeScript, Vite, and Supabase. It allows comedians to manage their jokes, organize them into setlists, and track performance metrics.

## Core Architecture

- **Frontend**: React 19 with TypeScript, using CSS Modules for styling
- **Backend**: Supabase (PostgreSQL with real-time subscriptions)
- **Authentication**: Supabase Auth with email/password and magic links
- **State Management**: React Context for auth state, local state for component data
- **Data Layer**: Service pattern with `dataService.ts` handling all Supabase operations

### Key Data Models

- **User**: Authenticated users with email-based accounts
- **Joke**: Individual comedy bits with name, content, rating (1-5), duration, and tags
- **Setlist**: Collections of jokes for performances
- **Tag**: User-created labels for organizing jokes

### Database Schema

The app uses a relational structure:
- `jokes` table with user_id foreign key
- `setlists` table with user_id foreign key  
- `setlist_jokes` junction table for many-to-many relationship
- `tags` table with user_id foreign key
- Row Level Security (RLS) ensures data isolation between users

## Development Commands

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build

# Run linter
bun run lint

# Database seeding (requires auth setup)
bun run seed
bun run seed-with-auth
bun run create-test-user
bun run check-data
bun run get-user-id
```

## Project Structure

- `src/contexts/AuthContext.tsx` - Authentication state management using Supabase Auth
- `src/services/dataService.ts` - All database operations organized by entity (jokes, setlists, tags)
- `src/lib/supabase.ts` - Supabase client configuration
- `src/types.ts` - TypeScript interfaces for all data models
- `src/components/` - Reusable UI components organized by feature
- `src/pages/` - Top-level page components using React Router
- `src/utils/` - Utility functions for filtering, sorting, and data manipulation

## Authentication Flow

The app uses Supabase Auth with:
- Email/password authentication
- Magic link authentication  
- Password reset functionality
- Automatic session management via AuthContext
- Redirect handling for auth callbacks

## Data Service Pattern

All Supabase operations are centralized in `dataService.ts` with services for:
- `jokeService` - CRUD operations for jokes
- `setlistService` - CRUD operations for setlists with joke associations
- `tagService` - CRUD operations for tags

Each service handles the complexity of joining related data and maintains type safety.

## Environment Setup

Requires `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing and Linting

- Uses ESLint with TypeScript and React configurations
- No test framework currently configured
- TypeScript compilation via `tsc -b` during build process

## Known Issues

- Password reset redirect URL logic in `AuthContext.tsx:102-105` has redundant localhost check