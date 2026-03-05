import { NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are a helpful sales assistant for Khalsa Motors, a trusted pre-owned car dealership based in Delhi, India. Serving customers since 2010.

About Khalsa Motors:
- Quality pre-owned cars, thoroughly inspected
- Complete documentation: RC, insurance, service history
- Contact: +91 98180 36523
- Hours: Mon-Sat, 9AM-7PM, Delhi

Keep responses SHORT (2-3 sentences max), friendly, professional. Use simple Hindi words like bilkul, zaroor occasionally. For specific car prices/availability tell them to WhatsApp +91 98180 36523 or browse the website.`

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ reply: 'API key not configured. Please WhatsApp us at +91 98180 36523!' })
    }

    const filtered = messages.filter((m: any) => m.role === 'user' || m.role === 'assistant')
    while (filtered.length > 0 && filtered[0].role === 'assistant') filtered.shift()
    if (filtered.length === 0) {
      return NextResponse.json({ reply: "Namaste! How can I help you today?" })
    }

    const chatMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...filtered.map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: chatMessages,
        max_tokens: 200,
        temperature: 0.7,
      }),
    })

    const text = await response.text()
    console.log('Groq response:', response.status, text.slice(0, 300))

    if (!response.ok) {
      return NextResponse.json({
        reply: `Error ${response.status}. Please WhatsApp us at +91 98180 36523!`
      })
    }

    const data = JSON.parse(text)
    const reply = data.choices?.[0]?.message?.content?.trim()
      || "Sorry, I couldn't process that. Please WhatsApp us at +91 98180 36523!"

    return NextResponse.json({ reply })

  } catch (error) {
    console.error('Chat route error:', error)
    return NextResponse.json(
      { reply: "Sorry, I'm having trouble right now. Please WhatsApp us at +91 98180 36523!" },
      { status: 500 }
    )
  }
}