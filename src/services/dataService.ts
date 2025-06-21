import { supabase } from '../lib/supabase'
import type { Joke, Setlist, Tag } from '../types'

// Joke operations
export const jokeService = {
  async getJokes(userId: string): Promise<Joke[]> {
    const { data, error } = await supabase
      .from('jokes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getJoke(id: string): Promise<Joke> {
    const { data, error } = await supabase
      .from('jokes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createJoke(joke: Omit<Joke, 'id' | 'created_at' | 'updated_at'>): Promise<Joke> {
    const { data, error } = await supabase
      .from('jokes')
      .insert([joke])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateJoke(id: string, joke: Partial<Joke>): Promise<Joke> {
    const { data, error } = await supabase
      .from('jokes')
      .update({ ...joke, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteJoke(id: string): Promise<void> {
    const { error } = await supabase
      .from('jokes')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Setlist operations
export const setlistService = {
  async getSetlists(userId: string): Promise<Setlist[]> {
    const { data, error } = await supabase
      .from('setlists')
      .select(`
        *,
        jokes:setlist_jokes(
          joke:jokes(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Transform the data to match our Setlist interface
    return (data || []).map(setlist => ({
      ...setlist,
      jokes: setlist.jokes.map((sj: any) => sj.joke),
    }))
  },

  async getSetlist(id: string): Promise<Setlist> {
    const { data, error } = await supabase
      .from('setlists')
      .select(`
        *,
        jokes:setlist_jokes(
          joke:jokes(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    
    // Transform the data to match our Setlist interface
    return {
      ...data,
      jokes: data.jokes.map((sj: any) => sj.joke),
    }
  },

  async createSetlist(setlist: Omit<Setlist, 'id' | 'created_at' | 'updated_at'>): Promise<Setlist> {
    const { jokes, ...setlistData } = setlist
    
    // Create the setlist
    const { data: setlistResult, error: setlistError } = await supabase
      .from('setlists')
      .insert([setlistData])
      .select()
      .single()

    if (setlistError) throw setlistError

    // Create the joke associations
    if (jokes.length > 0) {
      const jokeAssociations = jokes.map(joke => ({
        setlist_id: setlistResult.id,
        joke_id: joke.id
      }))

      const { error: associationError } = await supabase
        .from('setlist_jokes')
        .insert(jokeAssociations)

      if (associationError) throw associationError
    }

    return {
      ...setlistResult,
      jokes,
    }
  },

  async updateSetlist(id: string, setlist: Partial<Setlist>): Promise<Setlist> {
    const { jokes, ...setlistData } = setlist
    
    // Update the setlist
    const { data: setlistResult, error: setlistError } = await supabase
      .from('setlists')
      .update({ ...setlistData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (setlistError) throw setlistError

    // Update joke associations if jokes were provided
    if (jokes) {
      // Delete existing associations
      await supabase
        .from('setlist_jokes')
        .delete()
        .eq('setlist_id', id)

      // Create new associations
      if (jokes.length > 0) {
        const jokeAssociations = jokes.map(joke => ({
          setlist_id: id,
          joke_id: joke.id
        }))

        const { error: associationError } = await supabase
          .from('setlist_jokes')
          .insert(jokeAssociations)

        if (associationError) throw associationError
      }
    }

    return {
      ...setlistResult,
      jokes: jokes || [],
    }
  },

  async deleteSetlist(id: string): Promise<void> {
    // Delete joke associations first
    await supabase
      .from('setlist_jokes')
      .delete()
      .eq('setlist_id', id)

    // Delete the setlist
    const { error } = await supabase
      .from('setlists')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// Tag operations
export const tagService = {
  async getTags(userId: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  },

  async createTag(tag: Omit<Tag, 'id'>): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .insert([tag])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateTag(id: string, tag: Partial<Tag>): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .update(tag)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteTag(id: string): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
} 