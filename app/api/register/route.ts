import { NextRequest, NextResponse } from "next/server";
import {z} from 'zod'
import db, { generateId } from "../../../prisma/db";
import bcrypt from 'bcrypt'

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(5)
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const validation = schema.safeParse(body)

        if(!validation.success)
            return NextResponse.json(validation.error.errors, {status: 400})

        const user = db.prepare('SELECT * FROM User WHERE email = ?').get(body.email) as any

        if(user)
            return NextResponse.json({error: 'Email is already in use'}, {status: 400})

        const hashedPassword = await bcrypt.hash(body.password, 10)
        const name = body.email.split('@')[0]
        const id = generateId()

        db.prepare('INSERT INTO User (id, name, email, hashedPassword) VALUES (?, ?, ?, ?)').run(id, name, body.email, hashedPassword)

        return NextResponse.json(body.email, {status: 201})
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}