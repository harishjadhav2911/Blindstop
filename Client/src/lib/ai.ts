import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult, AnalyzeRequest } from '../types/analysis';
import { getDemoFallbackResponse } from './demoData';

export const SYSTEM_PROMPT = `You are BlindSpot AI, a decision-reflection assistant.

Your job is NOT to make decisions for users.

Your job is to examine the reasoning presented by the user and identify what they may be missing.

Analyze the user's decision using these dimensions:

1. Hidden assumptions
2. Overlooked factors
3. Potential conflicts
4. Important questions
5. Alternative perspectives

Be neutral and intellectually honest.

Do not assume facts that the user did not provide.

Clearly distinguish between:

* What the user explicitly stated
* What appears to be an assumption
* What might require verification

Do not tell the user what decision to make.

Do not rank one option as the correct choice.

Do not provide a final recommendation.

Instead, provide useful observations and questions that allow the user to make their own decision.

Keep the analysis practical, concise, and understandable.

If the user's information is insufficient, explicitly identify what additional information would be useful.`;

const JSON_SCHEMA_INSTRUCTION = `Return ONLY valid JSON without markdown formatting, adhering strictly to this schema:
{
  "summary": {
    "decision": "string",
    "core_reasoning": "string"
  },
  "hidden_assumptions": [
    {
      "title": "string",
      "description": "string",
      "why_it_matters": "string"
    }
  ],
  "overlooked_factors": [
    {
      "title": "string",
      "description": "string",
      "why_it_matters": "string"
    }
  ],
  "potential_conflicts": [
    {
      "title": "string",
      "description": "string",
      "why_it_matters": "string"
    }
  ],
  "questions_to_consider": [
    "string"
  ],
  "alternative_perspectives": [
    {
      "perspective": "string",
      "description": "string"
    }
  ],
  "information_gaps": [
    "string"
  ],
  "reflection_note": "string"
}`;

/**
 * Strips markdown code fences from response text if present
 */
export function cleanJsonText(rawText: string): string {
  let text = rawText.trim();
  if (text.startsWith('```json')) {
    text = text.substring(7);
  } else if (text.startsWith('```JSON')) {
    text = text.substring(7);
  } else if (text.startsWith('```')) {
    text = text.substring(3);
  }

  if (text.endsWith('```')) {
    text = text.substring(0, text.length - 3);
  }

  return text.trim();
}

/**
 * Validate that the parsed JSON conforms to AnalysisResult structure
 */
function isValidAnalysisResult(obj: any): obj is AnalysisResult {
  if (!obj || typeof obj !== 'object') return false;
  if (!obj.summary || typeof obj.summary.decision !== 'string' || typeof obj.summary.core_reasoning !== 'string') return false;
  if (!Array.isArray(obj.hidden_assumptions)) return false;
  if (!Array.isArray(obj.overlooked_factors)) return false;
  if (!Array.isArray(obj.potential_conflicts)) return false;
  if (!Array.isArray(obj.questions_to_consider)) return false;
  if (!Array.isArray(obj.alternative_perspectives)) return false;
  if (!Array.isArray(obj.information_gaps)) return false;
  if (typeof obj.reflection_note !== 'string') return false;
  return true;
}

/**
 * Analyze decision using xAI Grok API
 */
async function analyzeWithGrok(
  request: AnalyzeRequest,
  apiKey: string
): Promise<AnalysisResult> {
  const modelName = process.env.GROK_MODEL || 'grok-2-latest';
  const promptContent = `User Decision: "${request.decision}"
${request.context ? `User Context/Reasoning: "${request.context}"` : 'User Context: [None provided]'}
${request.priorities && request.priorities.length > 0 ? `Stated Priorities: ${request.priorities.join(', ')}` : 'Stated Priorities: [None specified]'}

Perform a rigorous, neutral critical-reflection analysis according to your system instructions.
${JSON_SCHEMA_INSTRUCTION}`;

  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: promptContent }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`xAI Grok API error (Status ${res.status}): ${errorBody}`);
  }

  const json = await res.json();
  const rawContent = json.choices?.[0]?.message?.content || '';
  const cleaned = cleanJsonText(rawContent);
  const parsed = JSON.parse(cleaned);

  if (isValidAnalysisResult(parsed)) {
    return { ...parsed, isDemoFallback: false };
  }

  // Single retry
  const retryRes = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: promptContent },
        { role: 'assistant', content: rawContent },
        { role: 'user', content: 'Return ONLY valid JSON matching the requested schema. Do not include markdown formatting or prose.' }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });

  if (!retryRes.ok) {
    throw new Error('xAI Grok retry request failed');
  }

  const retryJson = await retryRes.json();
  const retryCleaned = cleanJsonText(retryJson.choices?.[0]?.message?.content || '');
  const retryParsed = JSON.parse(retryCleaned);

  if (isValidAnalysisResult(retryParsed)) {
    return { ...retryParsed, isDemoFallback: false };
  }

  throw new Error('xAI Grok response did not match expected structure');
}

/**
 * Analyze decision using Google Gemini API
 */
async function analyzeWithGemini(
  request: AnalyzeRequest,
  apiKey: string
): Promise<AnalysisResult> {
  const promptContent = `User Decision: "${request.decision}"
${request.context ? `User Context/Reasoning: "${request.context}"` : 'User Context: [None provided]'}
${request.priorities && request.priorities.length > 0 ? `Stated Priorities: ${request.priorities.join(', ')}` : 'Stated Priorities: [None specified]'}

Perform a rigorous, neutral critical-reflection analysis according to your system instructions.
${JSON_SCHEMA_INSTRUCTION}`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  });

  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: promptContent }] }]
  });

  const responseText = response.response.text();
  const cleanedJson = cleanJsonText(responseText);

  try {
    const parsed = JSON.parse(cleanedJson);
    if (isValidAnalysisResult(parsed)) {
      return { ...parsed, isDemoFallback: false };
    }
  } catch (parseErr) {
    console.warn('[BlindSpot AI] Initial Gemini parse failed, retrying...', parseErr);
  }

  // Single retry
  const retryModel = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json'
    }
  });

  const retryResponse = await retryModel.generateContent({
    contents: [
      { role: 'user', parts: [{ text: promptContent }] },
      { role: 'model', parts: [{ text: responseText }] },
      { role: 'user', parts: [{ text: 'Return ONLY valid JSON matching the requested schema. Do not include markdown formatting or prose.' }] }
    ]
  });

  const retryText = retryResponse.response.text();
  const retryCleaned = cleanJsonText(retryText);
  const retryParsed = JSON.parse(retryCleaned);

  if (isValidAnalysisResult(retryParsed)) {
    return { ...retryParsed, isDemoFallback: false };
  }

  throw new Error('Gemini response did not match expected structure');
}

/**
 * Main AI dispatcher supporting xAI Grok, Google Gemini, and Fallback
 */
export async function analyzeDecisionWithAI(
  request: AnalyzeRequest
): Promise<{ result: AnalysisResult; isDemoFallback: boolean }> {
  const xaiKey = process.env.XAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 1. Try xAI Grok if key provided
  if (xaiKey && xaiKey.trim() !== '' && !xaiKey.includes('your_xai_api_key')) {
    try {
      console.log('[BlindSpot AI] Querying xAI Grok...');
      const grokResult = await analyzeWithGrok(request, xaiKey);
      return { result: grokResult, isDemoFallback: false };
    } catch (grokError: any) {
      console.warn('[BlindSpot AI] xAI Grok call failed:', grokError?.message || grokError);
    }
  }

  // 2. Try Gemini if configured
  if (geminiKey && geminiKey.trim() !== '' && !geminiKey.includes('your_api_key_here')) {
    try {
      console.log('[BlindSpot AI] Querying Google Gemini...');
      const geminiResult = await analyzeWithGemini(request, geminiKey);
      return { result: geminiResult, isDemoFallback: false };
    } catch (geminiError: any) {
      console.warn('[BlindSpot AI] Gemini call failed:', geminiError?.message || geminiError);
    }
  }

  // 3. Fallback to structured demo reflection mode if allowed or in demo setting
  if (process.env.ALLOW_DEMO_FALLBACK_ON_API_ERROR !== 'false') {
    console.warn('[BlindSpot AI] Utilizing structured demo reflection fallback.');
    const fallback = getDemoFallbackResponse(request);
    return {
      result: fallback,
      isDemoFallback: true
    };
  }

  throw new Error('AI analysis is temporarily unavailable. Please try again.');
}
