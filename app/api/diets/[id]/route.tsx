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