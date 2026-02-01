// supabase/functions/generate-joke-tags/index.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const PROMPT_ID = 'pmpt_6903fa95eb5481978ffffc714377c44f09fb282ecf7b02cd';
const PROMPT_VERSION = '4';

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
      prompt: {
        id: PROMPT_ID,
        version: PROMPT_VERSION
      },
      input: [
        {
          role: 'user',
          content: JSON.stringify(jokesData)
        }
      ]
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

    // Parse the response - it's an object with output array
    const outputMessage = data.output?.find(item => item.type === 'message');
    console.log('Output message:', JSON.stringify(outputMessage, null, 2));
    
    if (!outputMessage || !outputMessage.content) {
      console.error('No output message found in response');
      throw new Error('Invalid API response structure');
    }

    const outputContent = outputMessage.content.find(c => c.type === 'output_text');
    console.log('Output content:', JSON.stringify(outputContent, null, 2));
    
    if (!outputContent || !outputContent.text) {
      console.error('No output text found in message content');
      throw new Error('No output text in API response');
    }

    const outputText = outputContent.text;
    console.log('Output text:', outputText);

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