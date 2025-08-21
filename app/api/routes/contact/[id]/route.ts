import { NextResponse } from "next/server";
import ContactService from "../../../services/contactServices";
import consoleManager from "../../../utils/consoleManager";

// Get a specific contact (GET)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const contact = await ContactService.getContactById(id);

        if (!contact) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Contact not found",
            }, { status: 404 });
        }

        consoleManager.log("Fetched contact:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Contact fetched successfully",
            data: contact,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/contacts/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Update a contact (PUT)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await req.formData();
        
        const name = formData.get("name");
        const email = formData.get("email");
        const phone = formData.get("phone");
        const subject = formData.get("subject");
        const message = formData.get("message") || formData.get("additionalDetails");
        const status = formData.get("status");
        const priority = formData.get("priority");
        // New optional fields
        const preferredDate = formData.get("preferredDate");
        const locationPreference = formData.get("locationPreference");
        const venueServiceType = formData.get("venueServiceType");
        const guests = formData.get("guests");
        const budgetRange = formData.get("budgetRange");
        const contactTimePreference = formData.get("contactTimePreference");

        // Validate contact exists
        const existingContact = await ContactService.getContactById(id);
        if (!existingContact) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Contact not found",
            }, { status: 404 });
        }

        // Update contact data
        const contactData: any = {};
        if (name) contactData.name = name.toString();
        if (email) contactData.email = email.toString();
        if (phone) contactData.phone = phone.toString();
        if (subject) contactData.subject = subject.toString();
        if (message) contactData.message = message.toString();
        if (status) contactData.status = status.toString();
        if (priority) contactData.priority = priority.toString();
        if (preferredDate) contactData.preferredDate = preferredDate.toString();
        if (locationPreference) contactData.locationPreference = locationPreference.toString();
        if (venueServiceType) contactData.venueServiceType = venueServiceType.toString();
        if (guests) contactData.guests = Number(guests.toString());
        if (budgetRange) contactData.budgetRange = budgetRange.toString();
        if (contactTimePreference) contactData.contactTimePreference = contactTimePreference.toString();

        const updatedContact = await ContactService.updateContact(id, contactData);

        consoleManager.log("Contact updated successfully:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Contact updated successfully",
            data: updatedContact,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in PUT /api/contacts/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Delete a contact (DELETE)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // Validate contact exists
        const existingContact = await ContactService.getContactById(id);
        if (!existingContact) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Contact not found",
            }, { status: 404 });
        }

        await ContactService.deleteContact(id);

        consoleManager.log("Contact deleted successfully:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Contact deleted successfully",
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in DELETE /api/contacts/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
