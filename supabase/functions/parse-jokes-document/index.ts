const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are a stand-up comedy document parser. Your job is to analyze raw text from a comedian's document and identify individual jokes or bits.

# Instructions

1. **Identify joke boundaries**: Look for natural separations like:
   - Blank lines or paragraph breaks
   - Headers or titles
   - Numbering or bullet points
   - Topic changes

2. **For each joke, extract**:
   - **name**: A short, descriptive title (5-10 words max). If the joke has an obvious title/header, use that. Otherwise, create one based on the main topic or punchline setup.
   - **content**: The full joke text exactly as written
   - **suggestedTags**: 1-3 relevant tags from these categories:
     - Topic: relationships, work, family, animals, food, technology, politics, health, travel, money, dating, marriage, kids, aging, etc.
     - Style: observational, self-deprecating, wordplay, dark, storytelling, one-liner, callback, crowd-work, etc.
     - Audience: family-friendly, adult, edgy, universal, niche
   - **estimatedDuration**: Estimate in minutes based on word count. Use ~150 words per minute for spoken comedy. Minimum 0.5 minutes.

3. **Important guidelines**:
   - Preserve the original joke content exactly - don't edit or clean it up
   - If text doesn't appear to be a joke (stage directions, notes to self, etc.), skip it
   - When in doubt about boundaries, err on the side of keeping jokes separate
   - If the document has no clear joke boundaries, try to identify distinct bits/topics

# Output Format

Return a JSON array of parsed jokes:
[
  {
    "name": "Short descriptive title",
    "content": "Full joke text...",
    "suggestedTags": ["topic", "style"],
    "estimatedDuration": 1.5
  }
]

Return ONLY the JSON array, no additional text or markdown formatting.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'text field is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Document text is empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit text length to avoid token limits (roughly 50k characters)
    const maxLength = 50000;
    const truncatedText = text.length > maxLength
      ? text.substring(0, maxLength) + '\n\n[Document truncated due to length...]'
      : text;

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const requestBody = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: truncatedText }
      ],
      temperature: 0.3,
      max_tokens: 16384
    };

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    const content = choice?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Check if response was truncated due to token limit
    if (choice.finish_reason === 'length') {
      throw new Error('Document too large to process. Please try splitting it into smaller sections.');
    }

    // Parse the JSON response
    let jokes;
    try {
      // Handle potential markdown code blocks in response
      const jsonText = content.replace(/^```json?\n?|\n?```$/g, '').trim();
      jokes = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!Array.isArray(jokes)) {
      throw new Error('AI response is not an array');
    }

    // Validate and sanitize each joke
    const validatedJokes = jokes.map((joke, index) => ({
      name: String(joke.name || `Joke ${index + 1}`).substring(0, 200),
      content: String(joke.content || ''),
      suggestedTags: Array.isArray(joke.suggestedTags)
        ? joke.suggestedTags.filter(t => typeof t === 'string').slice(0, 5)
        : [],
      estimatedDuration: typeof joke.estimatedDuration === 'number'
        ? Math.max(0.5, Math.round(joke.estimatedDuration * 10) / 10)
        : 1
    }));

    return new Response(
      JSON.stringify({ jokes: validatedJokes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to parse document', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
