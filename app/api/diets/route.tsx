import { NextRequest, NextResponse } from "next/server";
import db from "../../../prisma/db";
import schema from "./schema";


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = schema.safeParse(body)

        if(!validation.success)
            return NextResponse.json(validation.error.errors, {status: 400})

        const user = db.prepare('SELECT * FROM User WHERE email = ?').get(body.email) as any

        if(!user)
            return NextResponse.json({error: 'This user doesnt exist'}, {status: 404})

        const result = db.prepare(
            'INSERT INTO Diet (name, grams, kcal, proteins, fats, carbohydrate, vitamins, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(body.name, body.grams, body.kcal, body.proteins, body.fats, body.carbohydrate, body.vitamins, user.id)

        const diet = db.prepare('SELECT * FROM Diet WHERE id = ?').get(result.lastInsertRowid) as any

        return NextResponse.json(diet, {status: 201})
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}