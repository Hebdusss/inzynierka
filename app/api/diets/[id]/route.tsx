import { NextRequest, NextResponse } from "next/server";
import db from "../../../../prisma/db";

export async function DELETE(
    request: NextRequest,
    {params}: {params: {id: string}}
) {
    try {
        const id = parseInt(params.id)
        const diet = db.prepare('SELECT * FROM Diet WHERE id = ?').get(id) as any

        if(!diet)
            return NextResponse.json({error: 'Diet doesnt exist'}, {status: 404})

        db.prepare('DELETE FROM Diet WHERE id = ?').run(id)

        return NextResponse.json(diet)
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}

export async function GET(
    request: NextRequest,
    {params}: {params: {id: string}}
    ) {
    try {
        const diets = db.prepare('SELECT * FROM Diet WHERE userId = ?').all(params.id)

        return NextResponse.json(diets, {status: 200})
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}

export async function PUT(
    request: NextRequest,
    {params}: {params: {id: string}}
) {
    try {
        const id = parseInt(params.id)
        const existing = db.prepare('SELECT * FROM Diet WHERE id = ?').get(id) as any
        if (!existing)
            return NextResponse.json({error: 'Diet not found'}, {status: 404})

        const body = await request.json()
        db.prepare(
            'UPDATE Diet SET name = ?, grams = ?, kcal = ?, proteins = ?, fats = ?, carbohydrate = ?, vitamins = ? WHERE id = ?'
        ).run(body.name, body.grams, body.kcal, body.proteins, body.fats, body.carbohydrate, body.vitamins, id)

        const updated = db.prepare('SELECT * FROM Diet WHERE id = ?').get(id)
        return NextResponse.json(updated)
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}