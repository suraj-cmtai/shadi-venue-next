import { NextResponse } from "next/server";
import WeddingService from "@/app/api/services/inviteService";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await WeddingService.getWeddingDataById(id);
        
        if (!data) {
            return NextResponse.json({ error: "Data not found" }, { status: 404 });
        }
        
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error(`GET error for wedding/${(await params).id}:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const update = await req.json();
        const updated = await WeddingService.updateWeddingDataById(id, update);
        
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error(`PUT error for wedding/${(await params).id}:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const result = await WeddingService.deleteWeddingDataById(id);
        
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error(`DELETE error for wedding/${(await params).id}:`, error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}