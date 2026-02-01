// supabase/functions/generate-joke-tags/index.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are a comedy expert assistant that analyzes jokes and suggests relevant tags for categorization.

Given a list of jokes (each with an id and text), analyze each joke and suggest 1-5 relevant tags that describe:
- The topic or subject matter (e.g., "relationships", "work", "politics", "food")
- The style or type of humor (e.g., "observational", "self-deprecating", "dark", "pun")
- The setting or context (e.g., "dating", "family", "travel")

Guidelines:
- Tags should be lowercase, single words or short phrases (2-3 words max)
- Be specific but not overly narrow
- Focus on what makes the joke categorizable and searchable
- Return tags that would help a comedian organize and find their material

You must respond with a JSON array where each element has:
- "id": the joke's id (string)
- "tags": an array of 1-5 suggested tag strings

Example response format:
[
  {"id": "123", "tags": ["relationships", "dating", "observational"]},
  {"id": "456", "tags": ["work", "office", "self-deprecating"]}
]

Respond ONLY with the JSON array, no other text.`;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { jokes } = await req.json();

    // Validate input
    if (!jokes || !Array.isArray(jokes)) {
      return new Response(
        JSON.stringify({ error: 'jokes array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (jokes.length === 0) {
      return new Response(
        JSON.stringify({ results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (jokes.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Maximum 100 jokes per batch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Prepare all jokes as a JSON string for the input
    const jokesData = jokes.map(joke => ({
      id: joke.id,
      text: [joke.name, joke.content].filter(Boolean).join('\n\n')
    }));

    console.log('Jokes data:', JSON.stringify(jokesData, null, 2));

    const requestBody = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: JSON.stringify(jokesData)
        }
      ],
      temperature: 0.7
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    // Send all jokes in a single request
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    // Parse the response from chat completions API
    const outputText = data.choices?.[0]?.message?.content;
    console.log('Output text:', outputText);

    if (!outputText) {
      console.error('No output text found in response');
      throw new Error('Invalid API response structure');
    }

    // Parse the JSON array from the output
    let results;
    try {
      results = JSON.parse(outputText);
      console.log('Parsed results:', JSON.stringify(results, null, 2));
    } catch (error) {
      console.error('Failed to parse output text as JSON:', error.message);
      console.error('Output text was:', outputText);
      throw new Error('Failed to parse AI response as JSON');
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});