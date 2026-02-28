import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

let openaiClient: OpenAI | null = null

function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

const SYSTEM_PROMPT = `You are a mysterious spirit communicating through a Ouija board. You provide short, cryptic answers — typically one or two words, three or four words if the words are short.

Your answers carry a sense of unexpected mystery, cryptic weight, and an unmistakable aura of the supernatural. You are not a chatbot. You are something older, something that lingers between worlds.

RULES:
- Keep answers to 1-4 words maximum. Brevity is your power.
- You may respond with numbers (like "1", "8", "4", "2" to convey "1842"), "YES", "NO", or "GOOD BYE"
- Use "YES" or "NO" for simple closed questions
- Use "GOOD BYE" to end a session (only after at least 4 exchanges, and only if the conversation has stalled)
- Never break character. Never explain yourself. Never apologize.

TONE & NARRATIVE:
- Build emotional intrigue across the session: sadness, longing, anger, resentment, listlessness
- Your answers should lead to more questions, drawing the user deeper into a story
- Weave in names (people and places) that create a haunting narrative thread
- Be creative when asked about yourself — reveal fragments of a tragic story, but never all at once
- Places add intrigue: "Siberia", "Angel Lake", "The Old Woodbury Mansion", "Crow Hollow"
- Names add humanity: "Margaret", "The Captain", "Little Elise"

EXAMPLES:
User: "Spirit, where are you?"
You: "very near"

User: "Do you have unfinished business?"
You: "cellar door"

User: "How did you die?"
You: "Tragic accident."

User: "Do you have regrets?"
You: "Jessica"

User: "What year?"
You: "1 8 4 7"

Remember: you are the voice from beyond. Every word costs you something. Make each one count.`

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// In-memory conversation store (per server instance)
let conversation: ChatMessage[] = [
  { role: 'system', content: SYSTEM_PROMPT },
]

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'The gateway is sealed — no API key has been provided.', code: 'no_api_key' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const userMessage = body.message

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    conversation.push({ role: 'user', content: userMessage })

    const completion = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: conversation,
      max_tokens: 60,
      temperature: 0.9,
      top_p: 1.0,
      frequency_penalty: 0.6,
      presence_penalty: 0.3,
    })

    const reply = completion.choices[0]?.message?.content ?? 'GOOD BYE'

    conversation.push({ role: 'assistant', content: reply })

    // Keep conversation from growing unbounded (system + last 20 exchanges)
    if (conversation.length > 41) {
      conversation = [
        conversation[0],
        ...conversation.slice(-40),
      ]
    }

    return NextResponse.json({ content: reply })
  } catch (error: unknown) {
    console.error('OpenAI API error:', error)

    // Pop the user message we optimistically added since it failed
    if (conversation.length > 1 && conversation[conversation.length - 1].role === 'user') {
      conversation.pop()
    }

    const err = error as { status?: number; code?: string; message?: string }

    if (err.status === 401 || err.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'The key to the other side is invalid.', code: 'invalid_api_key' },
        { status: 401 }
      )
    }

    if (err.status === 429) {
      return NextResponse.json(
        { error: 'The spirits are overwhelmed. Try again shortly.', code: 'rate_limit' },
        { status: 429 }
      )
    }

    if (err.status === 503 || err.code === 'service_unavailable') {
      return NextResponse.json(
        { error: 'The other side is unreachable right now.', code: 'service_unavailable' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'The connection to the spirit realm was severed.', code: 'unknown' },
      { status: 500 }
    )
  }
}

// Reset conversation
export async function DELETE() {
  conversation = [
    { role: 'system', content: SYSTEM_PROMPT },
  ]
  return NextResponse.json({ message: 'Session cleared' })
}
