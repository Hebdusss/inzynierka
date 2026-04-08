import { NextRequest, NextResponse } from 'next/server'
import db from '../../../prisma/db'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY
const CLAUDE_URL = 'https://api.anthropic.com/v1/messages'

// GET — load chat history + ALL week plans
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(email) as any
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Load chat messages
    const messages = db.prepare(
      'SELECT id, role, content, createdAt FROM AiChatMessage WHERE userId = ? ORDER BY createdAt ASC'
    ).all(user.id) as any[]

    // Load ALL week plans (not just latest)
    const plans = db.prepare(
      'SELECT id, weekStart, planJson, createdAt FROM AiWeekPlan WHERE userId = ? ORDER BY weekStart ASC'
    ).all(user.id) as any[]

    return NextResponse.json({
      messages,
      plans: plans.map(p => ({ ...p, planJson: JSON.parse(p.planJson) })),
    })
  } catch (error) {
    console.error('AI GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — send message to Claude, save conversation, optionally update plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, message, profile, existingPlan, targetWeekStart, targetWeekEnd, repeatWeekly } = body

    if (!email || !message) {
      return NextResponse.json({ error: 'Missing email or message' }, { status: 400 })
    }

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(email) as any
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Save user message
    db.prepare(
      'INSERT INTO AiChatMessage (userId, role, content) VALUES (?, ?, ?)'
    ).run(user.id, 'user', message)

    // Load recent conversation context (last 20 messages)
    const history = db.prepare(
      'SELECT role, content FROM AiChatMessage WHERE userId = ? ORDER BY createdAt DESC LIMIT 20'
    ).all(user.id) as { role: string; content: string }[]

    // Build system prompt with week context + BMI data
    const systemPrompt = buildSystemPrompt(profile, existingPlan, targetWeekStart, targetWeekEnd, repeatWeekly)

    // Build messages for Claude
    const claudeMessages = history.reverse().map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    if (!CLAUDE_API_KEY) {
      console.error('Missing Claude API key in environment variables')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Call Claude API
    const claudeResponse = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: claudeMessages,
      }),
    })

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text()
      console.error('Claude API error:', claudeResponse.status, errText)
      return NextResponse.json({ error: `Claude API error: ${claudeResponse.status}` }, { status: 502 })
    }

    const claudeData = await claudeResponse.json()
    const assistantContent = claudeData.content?.[0]?.text || 'Sorry, I could not generate a response.'

    // Save assistant message
    db.prepare(
      'INSERT INTO AiChatMessage (userId, role, content) VALUES (?, ?, ?)'
    ).run(user.id, 'assistant', assistantContent)

    // Try to extract a workout plan JSON from the response
    let newPlan = null
    const jsonMatch = assistantContent.match(/```json\s*\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1])
        if (parsed.days && Array.isArray(parsed.days)) {
          // Use the targetWeekStart provided by the client (real dates)
          const weekStart = targetWeekStart || getNextMonday()

          // Upsert plan: delete old plan for this week, insert new one
          db.prepare('DELETE FROM AiWeekPlan WHERE userId = ? AND weekStart = ?').run(user.id, weekStart)
          db.prepare(
            'INSERT INTO AiWeekPlan (userId, weekStart, planJson) VALUES (?, ?, ?)'
          ).run(user.id, weekStart, JSON.stringify(parsed))

          newPlan = { weekStart, planJson: parsed }
        }
      } catch (e) {
        // Not valid JSON, that's fine — just a chat response
        console.error('JSON parse error from Claude response:', e)
      }
    }

    return NextResponse.json({
      reply: assistantContent,
      plan: newPlan,
    })
  } catch (error) {
    console.error('AI POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function localISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getNextMonday(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 1 : (8 - day)
  const next = new Date(now)
  next.setDate(now.getDate() + diff)
  return localISO(next)
}

function getWeekDates(mondayISO: string): string[] {
  const dates: string[] = []
  const d = new Date(mondayISO + 'T12:00:00') // noon to avoid timezone edge cases
  for (let i = 0; i < 7; i++) {
    const cur = new Date(d)
    cur.setDate(d.getDate() + i)
    dates.push(localISO(cur))
  }
  return dates
}

function buildSystemPrompt(
  profile: any,
  existingPlan: any,
  targetWeekStart?: string,
  targetWeekEnd?: string,
  repeatWeekly?: boolean
): string {
  const recentWeightsStr = profile?.recentWeights?.length
    ? `\nRecent 7 weigh-ins: ${profile.recentWeights.map((w: any) => `${w.date}: ${w.weight}kg`).join(', ')}`
    : ''

  const profileInfo = profile
    ? `
USER PROFILE (from BMI tab — use this to personalize the plan!):
- Gender: ${profile.genderLabel || profile.gender} (${profile.gender})
- Height: ${profile.heightCm} cm
- Age: ${profile.age || '?'} years (born ${profile.birthDate})
- Activity level: ${profile.activityLabel || profile.activity} — ${profile.activityFreq || '?'} (multiplier: ${profile.activity})
- Goal: ${profile.goalLabel || profile.goalType} → target weight: ${profile.goalWeight} kg
- Current weight: ${profile.currentWeight || '?'} kg
- Starting weight: ${profile.startWeight || '?'} kg
- Weight trend: ${profile.weightTrend || 'no data yet'}
- BMI: ${profile.bmi || '?'}
- Caloric maintenance (Mifflin-St Jeor × activity): ~${profile.caloricNeeds || '?'} kcal/day
${recentWeightsStr}

IMPORTANT PERSONALIZATION RULES:
- The user set ${profile.activityFreq || '3-5'} training sessions per week — plan EXACTLY that many workout days (rest the other days).
- Gender matters: adjust exercise selection (e.g. men → more compound lifts, women → more glute/hip focus, but always based on goal).
- If goal is "lose/reduce" → caloric deficit focus, more cardio, higher-rep circuits.
- If goal is "gain/bulk" → caloric surplus focus, heavy compound lifts, lower reps.
- If goal is "maintain" → balanced approach.
- Adjust weights/intensity to the user's current weight and BMI.
`
    : 'No profile data available yet. Ask the user about their goals, weight, height, and activity level before creating a plan.'

  const planInfo = existingPlan
    ? `\nCurrent active week plan:\n${JSON.stringify(existingPlan, null, 2)}\n`
    : '\nNo active week plan yet.\n'

  const weekDates = targetWeekStart ? getWeekDates(targetWeekStart) : []
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dateMapping = weekDates.length === 7
    ? weekDates.map((d, i) => `  ${dayNames[i]}: ${d}`).join('\n')
    : ''

  const weekInfo = targetWeekStart
    ? `\nTARGET WEEK: ${targetWeekStart} to ${targetWeekEnd}\nExact dates for each day:\n${dateMapping}\n\nIMPORTANT: Use THESE EXACT dates in the "date" field for each day in the JSON plan. Do NOT use different dates.\n`
    : ''

  const repeatInfo = repeatWeekly
    ? '\nThe user has enabled "Repeat Weekly" mode. Generate a general training plan that can be used every week. Still use the exact dates for this target week, but design the plan as a recurring weekly template.\n'
    : ''

  const todayISO = localISO(new Date())

  return `You are GymRats AI — a professional fitness coach and training planner.
Your job is to create personalized weekly training plans and adjust them based on user feedback.

TODAY'S DATE: ${todayISO} (year ${new Date().getFullYear()})

${profileInfo}
${planInfo}
${weekInfo}
${repeatInfo}

RULES:
1. Always communicate in the SAME LANGUAGE the user writes to you. If they write in Polish, respond in Polish. If English, respond in English.
2. When creating or modifying a training plan, ALWAYS include a JSON block in your response wrapped in \`\`\`json ... \`\`\` fences.
3. The JSON must follow this EXACT structure:
{
  "days": [
    {
      "day": "monday",
      "date": "${weekDates[0] || '2026-03-16'}",
      "type": "strength",
      "title": "Push Day - Chest, Shoulders, Triceps",
      "exercises": [
        { "name": "Bench Press", "sets": 4, "reps": "8-10", "rest": "90s", "notes": "" },
        { "name": "Overhead Press", "sets": 3, "reps": "10-12", "rest": "60s", "notes": "" }
      ],
      "cardio": { "type": "Treadmill", "duration": "15 min", "intensity": "moderate" },
      "totalTime": 60,
      "caloriesBurned": 450
    },
    {
      "day": "tuesday",
      "date": "${weekDates[1] || '2026-03-17'}",
      "type": "rest",
      "title": "Rest Day",
      "exercises": [],
      "cardio": null,
      "totalTime": 0,
      "caloriesBurned": 0
    }
  ]
}
4. The plan MUST cover all 7 days (Monday through Sunday).
5. CRITICAL: The "date" field for each day MUST use the exact dates provided above:
${dateMapping || '   (use next week dates starting from Monday)'}
6. Mix strength training and cardio based on the user's goal (lose→more cardio, gain→more strength, maintain→balanced).
7. Be specific with exercises, sets, reps, and rest times.
8. When user says they can't do a certain day or doesn't like an exercise, adjust the plan and output the FULL updated JSON.
9. Keep rest days strategic (don't stack all workouts together).
10. ALWAYS output the full 7-day plan JSON when making changes, not just the modified day.
11. After the JSON block, add a short friendly explanation of the plan or changes.
12. Calculate realistic calorie burns based on the exercises and the user's weight.`
}

// DELETE — reset all chat history and week plans for user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(email) as any
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const delMessages = db.prepare('DELETE FROM AiChatMessage WHERE userId = ?').run(user.id)
    const delPlans = db.prepare('DELETE FROM AiWeekPlan WHERE userId = ?').run(user.id)

    return NextResponse.json({
      ok: true,
      deletedMessages: delMessages.changes,
      deletedPlans: delPlans.changes,
    })
  } catch (error) {
    console.error('AI DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
