import { NextResponse } from "next/server";
import {db} from "@/app/api/config/firebase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ rsvpId: string }> }
) {
  try {
    const { rsvpId } = await params;
    const { status } = await request.json();

    // Update RSVP status
    await db
      .collection("rsvp")
      .doc(rsvpId)
      .update({
        status,
        updatedAt: new Date().toISOString()
      });

    return NextResponse.json({
      statusCode: 200,
      message: "RSVP status updated successfully",
    });

  } catch (error: any) {
    console.error("Error updating RSVP status:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        errorCode: "INTERNAL_SERVER_ERROR",
        errorMessage: "Failed to update RSVP status.",
      },
      { status: 500 }
    );
  }
}