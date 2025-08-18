import { NextResponse } from "next/server";
import UserService from "@/app/api/services/userServices";
import consoleManager from "@/app/api/utils/consoleManager";

// PATCH /api/routes/users/[id]/invite/events
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // The thunk expects: { eventData, eventIndex }
    const { eventData, eventIndex } = body;

    await UserService.updateWeddingEvent(id, eventData, eventIndex);
    const updatedUser = await UserService.getUserById(id);

    // The thunk expects errorCode "NO" for success
    return NextResponse.json(
      {
        errorCode: "NO",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    consoleManager.error("Error updating wedding event:", error);
    return NextResponse.json(
      {
        errorCode: "INTERNAL_ERROR",
        errorMessage: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/routes/users/[id]/invite/events/[eventIndex]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; index: string }> }
) {
  try {
    const { id, index } = await params;

    await UserService.deleteWeddingEvent(id, parseInt(index));
    const updatedUser = await UserService.getUserById(id);

    // The thunk expects errorCode "NO" for success
    return NextResponse.json(
      {
        errorCode: "NO",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    consoleManager.error("Error deleting wedding event:", error);
    return NextResponse.json(
      {
        errorCode: "INTERNAL_ERROR",
        errorMessage: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}