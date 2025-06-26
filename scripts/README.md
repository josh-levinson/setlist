# Database Seed Script

This directory contains the database seed script for generating test data.

## Getting a User ID

Since the seed script needs a user ID to associate data with, you have several options:

### Option 1: Create a Test User (Recommended)
```bash
bun run create-test-user
```
This will create a test user and show you the ID to use.

### Option 2: Get Current User ID
```bash
bun run get-user-id
```
This will check if you're authenticated and show your user ID, or provide guidance on other options.

### Option 3: Manual Methods
- **Browser Console**: While logged into your app, open DevTools and run `supabase.auth.getUser()`
- **Supabase Dashboard**: Go to Authentication > Users and copy any user ID
- **Use a Test UUID**: Use `00000000-0000-0000-0000-000000000001` for testing

## Usage

### Command Line

```bash
# Basic usage with default values (50 jokes, 10 setlists, 15 tags)
bun run seed <user-id>

# Custom counts
bun run seed <user-id> <joke-count> <setlist-count> <tag-count>

# Examples
bun run seed abc123
bun run seed abc123 100 20 25
bun run seed abc123 25 5 10
```

### Complete Workflow Example
```bash
# 1. Create a test user
bun run create-test-user

# 2. Use the provided user ID to seed data
bun run seed <user-id-from-step-1>

# 3. (Optional) Custom amounts
bun run seed <user-id> 100 20 25
```

### Programmatic Usage

```typescript
import { seedDatabase } from './scripts/seed'

// Basic usage
await seedDatabase('user-id-here')

// With custom options
await seedDatabase('user-id-here', {
  jokeCount: 100,
  setlistCount: 20,
  tagCount: 25
})
```

## What Gets Generated

### Tags (15 by default)
- Random tag names from a predefined list
- Random colors from a curated palette
- Associated with the provided user ID

### Jokes (50 by default)
- Random joke names and content from predefined lists
- Random ratings (1-5)
- Random durations (0.5-5.0 minutes)
- Random tag associations (1-4 tags per joke)
- Random creation/update dates within the last year

### Setlists (10 by default)
- Random setlist names from predefined list
- Random selection of 3-8 jokes per setlist
- Random creation/update dates within the last year

## Sample Data

The script includes a variety of joke types:
- Knock-knock jokes
- One-liners
- Dad jokes
- Observational humor
- Work-related jokes
- Food jokes
- Technology jokes
- And more!

## Requirements

- Must be authenticated with Supabase
- Valid user ID must be provided
- Database tables must exist (jokes, setlists, tags, setlist_jokes)

## Error Handling

The script includes comprehensive error handling and will:
- Log progress with emojis for easy tracking
- Provide detailed error messages if something goes wrong
- Exit with appropriate status codes for CLI usage 