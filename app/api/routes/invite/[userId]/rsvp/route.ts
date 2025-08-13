import { NextResponse } from "next/server";
import { db } from "@/app/api/config/firebase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const rsvpData = await request.json();

    // Create new RSVP document
    const rsvpRef = await db.collection("rsvp").add({
      ...rsvpData,
      userId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Get the created RSVP
    const rsvp = await rsvpRef.get();

    return NextResponse.json({
      statusCode: 200,
      data: {
        id: rsvp.id,
        ...rsvp.data()
      }
    });

  } catch (error: any) {
    console.error("Error submitting RSVP:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        errorMessage: "Failed to submit RSVP."
      },
      { status: 500 }
    );
  }
}
