import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { threatId, threatData } = await req.json();
    console.log('Analyzing threat:', threatId, threatData);

    // Construct detailed prompt for OpenAI
    const prompt = `You are a cybersecurity expert analyzing network threats. Analyze the following threat and provide:
1. A detailed explanation of the attack pattern
2. Potential risks and impact
3. Recommended response actions
4. Prevention strategies

Threat Details:
- Type: ${threatData.threatType}
- Severity: ${threatData.severity}
- Detection Method: ${threatData.detectionMethod}
- Source IP: ${threatData.sourceIP}
- Destination IP: ${threatData.destIP}
- Details: ${threatData.details}
- Confidence: ${(threatData.confidence * 100).toFixed(1)}%

Provide a comprehensive but concise analysis in markdown format.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert cybersecurity analyst specializing in network threat analysis and incident response. Provide clear, actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('AI analysis generated, updating database...');

    // Update the threat record with AI analysis
    const { error: updateError } = await supabase
      .from('threats')
      .update({
        ai_analysis: analysis,
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq('id', threatId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Threat analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        threatId 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in analyze-threat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});