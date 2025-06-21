# Setup Guide for Comedy Setlist Manager

## Database Setup (Supabase)

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Set up Environment Variables**
   Create a `.env` file in the root directory:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Schema**
   Run these SQL commands in your Supabase SQL editor:

   ```sql
   -- Create jokes table
   CREATE TABLE jokes (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     content TEXT,
     rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
     duration INTEGER NOT NULL CHECK (duration > 0),
     tags TEXT[] DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create setlists table
   CREATE TABLE setlists (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create setlist_jokes junction table
   CREATE TABLE setlist_jokes (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     setlist_id UUID REFERENCES setlists(id) ON DELETE CASCADE,
     joke_id UUID REFERENCES jokes(id) ON DELETE CASCADE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(setlist_id, joke_id)
   );

   -- Create tags table
   CREATE TABLE tags (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     name TEXT NOT NULL,
     color TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable RLS on all tables
   ALTER TABLE jokes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE setlists ENABLE ROW LEVEL SECURITY;
   ALTER TABLE setlist_jokes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   -- Jokes policies
   CREATE POLICY "Users can view their own jokes" ON jokes
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own jokes" ON jokes
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own jokes" ON jokes
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own jokes" ON jokes
     FOR DELETE USING (auth.uid() = user_id);

   -- Setlists policies
   CREATE POLICY "Users can view their own setlists" ON setlists
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own setlists" ON setlists
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own setlists" ON setlists
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own setlists" ON setlists
     FOR DELETE USING (auth.uid() = user_id);

   -- Setlist jokes policies
   CREATE POLICY "Users can view setlist jokes for their setlists" ON setlist_jokes
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM setlists 
         WHERE setlists.id = setlist_jokes.setlist_id 
         AND setlists.user_id = auth.uid()
       )
     );

   CREATE POLICY "Users can insert setlist jokes for their setlists" ON setlist_jokes
     FOR INSERT WITH CHECK (
       EXISTS (
         SELECT 1 FROM setlists 
         WHERE setlists.id = setlist_jokes.setlist_id 
         AND setlists.user_id = auth.uid()
       )
     );

   CREATE POLICY "Users can delete setlist jokes for their setlists" ON setlist_jokes
     FOR DELETE USING (
       EXISTS (
         SELECT 1 FROM setlists 
         WHERE setlists.id = setlist_jokes.setlist_id 
         AND setlists.user_id = auth.uid()
       )
     );

   -- Tags policies
   CREATE POLICY "Users can view their own tags" ON tags
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own tags" ON tags
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own tags" ON tags
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own tags" ON tags
     FOR DELETE USING (auth.uid() = user_id);

   -- Create function to update updated_at timestamp
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ language 'plpgsql';

   -- Create triggers for updated_at
   CREATE TRIGGER update_jokes_updated_at BEFORE UPDATE ON jokes
     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

   CREATE TRIGGER update_setlists_updated_at BEFORE UPDATE ON setlists
     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

## Running the Application

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Start the development server**
   ```bash
   bun dev
   ```

3. **Build for production**
   ```bash
   bun run build
   ```

## Features

- **User Authentication**: Sign up, sign in, and sign out
- **User-scoped Data**: Each user only sees their own jokes, setlists, and tags
- **Real-time Database**: All data is stored in Supabase with real-time capabilities
- **Secure**: Row Level Security ensures data isolation between users
- **Responsive**: Works on desktop and mobile devices

## Deployment

The app can be deployed to any static hosting service (Vercel, Netlify, etc.) since it's a React SPA with Supabase as the backend. 