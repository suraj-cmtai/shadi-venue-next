import { NextResponse } from "next/server";
import {db} from "@/app/api/config/firebase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Get RSVP responses for this invite
    const rsvpSnapshot = await db
      .collection("rsvp")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const responses = rsvpSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      statusCode: 200,
      data: responses,
    });

  } catch (error: any) {
    console.error("Error fetching RSVP responses:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        errorMessage: "Failed to fetch RSVP responses."
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { rsvpId, status } = body;

    // Update the RSVP status
    await db.collection("rsvp").doc(rsvpId).update({
      status,
      updatedAt: new Date().toISOString()
    });

    // Get the updated RSVP
    const updatedRsvp = await db.collection("rsvp").doc(rsvpId).get();

    if (!updatedRsvp.exists) {
      return NextResponse.json(
        {
          statusCode: 404,
          errorMessage: "RSVP not found"
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      statusCode: 200,
      data: {
        id: updatedRsvp.id,
        ...updatedRsvp.data()
      }
    });

  } catch (error: any) {
    console.error("Error updating RSVP status:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        errorMessage: "Failed to update RSVP status."
      },
      { status: 500 }
    );
  }
}
