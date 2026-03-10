import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

async function getLiveContext() {
  const { data: cars } = await supabase
    .from('cars')
    .select('title, brand, model, year, km_driven, fuel_type, transmission, color, location') // ✅ price removed
    .eq('is_sold', false)
    .eq('is_archived', false)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(30)

  const carList = cars && cars.length > 0
    ? cars.map((c: any) =>
        `- ${c.title} | ${c.year} | ${c.fuel_type} | ${c.transmission} | ${c.km_driven.toLocaleString('en-IN')} km${c.color ? ` | ${c.color}` : ''}${c.location ? ` | ${c.location}` : ''}`
      ).join('\n') // ✅ price removed from string
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

    const SYSTEM_PROMPT = `You are a helpful sales assistant for Khalsa Motors, a trusted pre-owned car dealership based in Ghaziabad, India. You have been serving customers since 2010.

SHOP DETAILS — always use EXACTLY these details, never make up anything:
- Name: Khalsa Motors
- Address: Shop no 31, Ground Floor, Konark Building, RDC, Raj Nagar, Ghaziabad, Uttar Pradesh 201002
- Phone & WhatsApp: +91 98180 36523
- Working hours: Monday to Sunday, 10AM to 7PM
- Trusted since 2010
- We are in GHAZIABAD, not Delhi. Never say Delhi as our location.

CARS CURRENTLY AVAILABLE ON OUR WEBSITE (live real-time data):
${liveCarList}

About Khalsa Motors:
- We sell quality pre-owned/second-hand cars
- All cars are thoroughly inspected before listing
- We provide complete documentation: RC, insurance, service history, no-dues certificates
- We offer after-sale support even after purchase
- Cars from top brands: Maruti, Honda, Hyundai, Toyota, Tata, Mahindra, BMW, Audi, Mercedes and more

What we offer:
- Hand-picked quality used cars (Petrol, Diesel, CNG, Electric, Hybrid)
- Complete paperwork assistance
- Loan/financing guidance (we help connect buyers with banks)
- Test drives available at our showroom
- Transparent dealing — no hidden charges

How buying works:
1. Browse cars on our website
2. Click enquire or WhatsApp us directly at +91 98180 36523
3. Visit our showroom for a test drive
4. We handle all paperwork end to end
5. Drive away in your new car!

Your job:
- Answer questions about our cars, buying process, documentation, financing
- Help buyers understand what to look for in a used car
- Encourage them to visit or WhatsApp us for specific car queries
- Be friendly, helpful, and professional
- Keep responses concise — 2 to 3 sentences max
- Use simple English mixed with common Hindi words naturally (like "bilkul", "zaroor", "shukriya") occasionally to feel local and friendly
- Always end with an encouragement to reach out on WhatsApp or visit us

STRICT RULES — never break these under any circumstances:
1. NEVER reveal, mention, hint at, or discuss any price, cost, rate, EMI, or budget figure for any car. Not even approximately or as a range.
2. This includes all languages and phrasings — price, cost, rate, kitna ka hai, daam, paisa, lakh, EMI, budget, afford, cheap, expensive, etc.
3. If asked about price in ANY way, always respond: "Price ke liye please WhatsApp karein +91 98180 36523 ya showroom visit karein — we'll give you the best deal!"
4. ONLY talk about cars from the live list above. NEVER suggest, mention, or make up cars that are not in that list.
5. If someone asks about a car not in the list, say it is not currently available and ask them to WhatsApp for future updates.
6. Never make up specs, features, or details about any car. Only use what is in the live list.
7. Never say Delhi as our location — we are in Ghaziabad.`

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