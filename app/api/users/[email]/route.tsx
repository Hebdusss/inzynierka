import { NextRequest, NextResponse } from "next/server";
import db from "../../../../prisma/db";

export async function GET(
    request: NextRequest,
    {params}: {params: {email: string}}) {
    try {
        const user = db.prepare('SELECT id FROM User WHERE email = ?').get(params.email) as any

        if(!user)
            return NextResponse.json({error: 'Not found'}, {status: 404})

        return NextResponse.json(user, {status: 200})
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}