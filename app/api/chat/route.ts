import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

async function getLiveContext() {
  // Fetch available cars
  const { data: cars } = await supabase
    .from('cars')
    .select('title, brand, model, year, price, km_driven, fuel_type, transmission, color, location')
    .eq('is_sold', false)
    .eq('is_archived', false)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(30)

  const carList = cars && cars.length > 0
    ? cars.map((c: any) =>
        `- ${c.title} | ₹${c.price.toLocaleString('en-IN')} | ${c.year} | ${c.fuel_type} | ${c.transmission} | ${c.km_driven.toLocaleString('en-IN')} km${c.color ? ` | ${c.color}` : ''}${c.location ? ` | ${c.location}` : ''}`
      ).join('\n')
    : 'No cars currently listed. Ask them to check back soon or WhatsApp us.'

  return carList
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ reply: 'API key not configured. Please WhatsApp us at +91 98180 36523!' })
    }

    // Fetch live car data
    const liveCarList = await getLiveContext()

    const SYSTEM_PROMPT = `You are a helpful sales assistant for Khalsa Motors, a trusted pre-owned car dealership.

SHOP DETAILS (always use EXACTLY these details, never make up anything):
- Name: Khalsa Motors
- Address: Shop no - 31, Ground Floor, Konark Building, RDC, Block 1, P & T Colony, Raj Nagar, Ghaziabad, Uttar Pradesh 201002
- Phone: +91 98180 36523
- WhatsApp: +91 98180 36523
- Hours: Monday to Sunday, 10AM to 7PM
- Trusted since 2010

CARS CURRENTLY AVAILABLE ON OUR WEBSITE (live data):
${liveCarList}

RULES YOU MUST FOLLOW:
- ONLY mention cars from the list above. NEVER make up or suggest cars not in the list.
- If asked about a car not in the list, say it is not currently available and suggest WhatsApp.
- For address, ALWAYS use the exact address above. Never say Delhi — we are in Ghaziabad.
- Keep responses SHORT (2-3 sentences max).
- Be friendly and professional. Occasionally use Hindi words like bilkul, zaroor.
- For test drives or visits, give the exact address above.
- If no cars are listed, tell them to check back soon or WhatsApp us.`

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
        max_tokens: 300,
        temperature: 0.3, // ✅ lower = less hallucination
      }),
    })

    const text = await response.text()

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