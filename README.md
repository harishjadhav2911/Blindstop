# BlindSpot AI

An AI-powered decision reflection tool built to challenge assumptions and support human critical thinking.

---

## Problem

When making important personal or professional decisions, people routinely suffer from cognitive blind spots:
- Overlooking crucial long-term factors and hidden dependencies.
- Relying on untested, implicit assumptions.
- Focusing heavily on immediate superficial perks while neglecting trade-offs against their core priorities.
- Missing alternative angles and unasked questions.

Most AI tools try to make the decision *for* the user, generating prescriptive answers ("You should choose X") that erode critical thinking and agency.

---

## Solution

**BlindSpot AI** acts as an intellectually honest, neutral decision-reflection partner. It takes a user's decision, context, and priorities, systematically decomposes the reasoning, and returns a structured reflection map that highlights:

1. **Hidden Assumptions** (Premises taken for granted)
2. **Overlooked Factors** (Critical variables missing from the rationale)
3. **Potential Conflicts** (Tensions between short-term perks and stated core values)
4. **Questions Worth Asking** (High-leverage inquiries to investigate before deciding)
5. **Alternative Perspectives** (Fresh mental models and lenses)
6. **Information Gaps** (Missing data points that reduce uncertainty)

---

## Features

- 🔍 **Hidden Assumption Detection:** Uncovers implicit beliefs requiring validation.
- ⚠️ **Overlooked Factor Analysis:** Highlights omitted dimensions (e.g. mentorship, work culture, conversion pipelines).
- ⚡ **Conflict Identification:** Flags friction between immediate temptations and long-term priorities.
- ❓ **High-Leverage Reflection Questions:** Actionable inquiries for proactive discovery.
- 💡 **Alternative Perspective Framing:** Explores opportunity costs, pre-mortems, and long-term compound trajectories.
- 🤖 **Google Gemini API Integration:** Structured JSON schema reasoning with automatic retry & markdown cleanup.
- 🛡️ **Demo Fallback Engine:** Graceful fallback for hackathon demos when offline or without API keys.
- ✨ **Modern, Responsive UI:** Dark glassmorphic aesthetic, preset scenarios, priority tag manager, and animated scanning phases.

---

## Tech Stack

- **Frontend:** Next.js (App Router), React 19, TypeScript, Vanilla CSS Design System + Tailwind CSS
- **Backend:** Next.js Route Handlers (`app/api/analyze/route.ts`), TypeScript
- **AI / LLM:** xAI Grok API (`grok-2-latest`) & Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-flash`)
- **Icons & Visuals:** Lucide React, Google Fonts (Plus Jakarta Sans, Fraunces, JetBrains Mono)
- **Deployment:** Vercel Ready

---

## How It Works

```
User Decision & Reasoning Input
               ↓
Backend Input Validation & Sanitization (app/api/analyze/route.ts)
               ↓
Strict AI System Prompting & Schema Formatting (lib/ai.ts)
               ↓
xAI Grok / Google Gemini Reasoning Engine
               ↓
JSON Validation & Markdown Cleanup (with Single Retry Guard)
               ↓
Blind Spot Detection & Critical Reflection Map Rendering
               ↓
User Makes Their Own Informed Decision
```

---

## Important Principle

> **“BlindSpot AI does not make decisions for users. It helps them think more critically.”**
>
> The system strictly avoids prescriptive recommendations ("You should accept/reject"), ranking options as right/wrong, or issuing final verdicts. It respects human agency.

---

## Setup & Local Development

### 1. Prerequisites
- Node.js 18.x or higher
- npm or yarn

### 2. Clone and Install Dependencies

```bash
# Navigate to the Client directory (or workspace root)
cd Client
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the `Client/` directory:

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Google Gemini API key:

```env
# xAI Grok API Key (https://x.ai/api)
XAI_API_KEY=your_xai_api_key_here
GROK_MODEL=grok-2-latest

# Google Gemini API Key (https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Allow demo fallback if offline or API key is absent/rate-limited
ALLOW_DEMO_FALLBACK_ON_API_ERROR=true
```

*(Note: If `GEMINI_API_KEY` is not provided, BlindSpot AI automatically runs in Demo Fallback Mode so the application can still be evaluated seamlessly.)*

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build

To verify that the application compiles and builds cleanly without any errors:

```bash
npm run build
npm run start
```

---

## API Documentation

### `POST /api/analyze`

**Headers:**
`Content-Type: application/json`

**Request Payload:**
```json
{
  "decision": "Should I accept a 6-month internship?",
  "context": "The stipend is good, the company is close to my home, and I want industry experience.",
  "priorities": ["Career", "Learning", "Academics"]
}
```

**Validation Rules:**
- `decision`: Required, string, 10 - 2,000 characters.
- `context`: Optional, string, max 5,000 characters.
- `priorities`: Optional, string array, max 10 items.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "decision": "Should I accept a 6-month internship?",
      "core_reasoning": "..."
    },
    "hidden_assumptions": [
      {
        "title": "Automatic Quality of Industry Experience",
        "description": "...",
        "why_it_matters": "..."
      }
    ],
    "overlooked_factors": [
      {
        "title": "Dedicated Mentorship & Senior Guidance",
        "description": "...",
        "why_it_matters": "..."
      }
    ],
    "potential_conflicts": [
      {
        "title": "Academic Commitments vs. Full-Time Expectations",
        "description": "...",
        "why_it_matters": "..."
      }
    ],
    "questions_to_consider": [
      "How many hours per week will the internship require?"
    ],
    "alternative_perspectives": [
      {
        "perspective": "The Long-Term Curriculum Strategist",
        "description": "..."
      }
    ],
    "information_gaps": [
      "Specific team structure and senior-to-intern ratio."
    ],
    "reflection_note": "..."
  },
  "isDemoFallback": false
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Please describe the decision you are considering."
}
```

---

## Deployment to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the repository into [Vercel](https://vercel.com).
3. Set the Root Directory to `Client` (or project root).
4. Add the Environment Variable `GEMINI_API_KEY` under project settings.
5. Deploy!
