import { NextResponse } from "next/server";
import {db} from "@/app/api/config/firebase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    console.log("GET /api/routes/invite/[userId]/responses - userId:", userId);

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

    console.log("Found RSVP responses:", responses.length);

    return NextResponse.json({
      statusCode: 200,
      message: "RSVP responses fetched successfully",
      data: responses,
    });

  } catch (error: any) {
    console.error("Error fetching RSVP responses:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        errorMessage: "Failed to fetch RSVP responses.",
        details: error.message
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

    console.log("PATCH RSVP Request:", { userId, rsvpId, status, body });

    // Validate required fields
    if (!rsvpId) {
      console.error("Missing rsvpId in request body");
      return NextResponse.json(
        {
          statusCode: 400,
          errorMessage: "Missing rsvpId in request body"
        },
        { status: 400 }
      );
    }

    if (!status) {
      console.error("Missing status in request body");
      return NextResponse.json(
        {
          statusCode: 400,
          errorMessage: "Missing status in request body"
        },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['pending', 'confirmed', 'declined'];
    if (!validStatuses.includes(status)) {
      console.error("Invalid status value:", status);
      return NextResponse.json(
        {
          statusCode: 400,
          errorMessage: "Invalid status value. Must be one of: pending, confirmed, declined"
        },
        { status: 400 }
      );
    }

    // Check if RSVP document exists first
    const rsvpDoc = await db.collection("rsvp").doc(rsvpId).get();
    if (!rsvpDoc.exists) {
      console.error("RSVP document not found:", rsvpId);
      return NextResponse.json(
        {
          statusCode: 404,
          errorMessage: "RSVP not found"
        },
        { status: 404 }
      );
    }

    console.log("RSVP document found:", rsvpDoc.data());

    // Update the RSVP status
    await db.collection("rsvp").doc(rsvpId).update({
      status,
      updatedAt: new Date().toISOString()
    });

    console.log("RSVP status updated successfully");

    // Get the updated RSVP
    const updatedRsvp = await db.collection("rsvp").doc(rsvpId).get();

    if (!updatedRsvp.exists) {
      console.error("Updated RSVP document not found after update");
      return NextResponse.json(
        {
          statusCode: 404,
          errorMessage: "RSVP not found after update"
        },
        { status: 404 }
      );
    }

    const rsvpData = {
      id: updatedRsvp.id,
      ...updatedRsvp.data()
    };

    console.log("Updated RSVP data:", rsvpData);

    return NextResponse.json({
      statusCode: 200,
      message: "RSVP status updated successfully",
      data: rsvpData
    });

  } catch (error: any) {
    console.error("Error updating RSVP status:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return NextResponse.json(
      {
        statusCode: 500,
        errorMessage: "Failed to update RSVP status.",
        details: error.message
      },
      { status: 500 }
    );
  }
}
