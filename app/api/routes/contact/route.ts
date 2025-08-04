import { NextResponse } from "next/server";
import ContactService, { ContactPriority, ContactStatus } from "../../services/contactServices";
import consoleManager from "../../utils/consoleManager";

// Get all contacts (GET)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const priority = searchParams.get("priority");

        let contacts = await ContactService.getAllContacts();

        // Apply filters if provided
        if (status) {
            contacts = contacts.filter((contact) => contact.status === status);
        }
        if (priority) {
            contacts = contacts.filter((contact) => contact.priority === priority);
        }

        consoleManager.log("Fetched contacts with filters:", contacts.length);

        return NextResponse.json({
            statusCode: 200,
            message: "Contacts fetched successfully",
            data: contacts,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/contacts:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Add a new contact (POST)
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const name = formData.get("name");
        const email = formData.get("email");
        const phone = formData.get("phone");
        const subject = formData.get("subject");
        const message = formData.get("message");
        const priority = formData.get("priority") || ContactPriority.LOW;

        // Validate required fields
        if (!name || !email || !phone || !subject || !message) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "All fields are required",
            }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.toString())) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Invalid email format",
            }, { status: 400 });
        }


        const contactData = {
            name: name.toString(),
            email: email.toString(),
            phone: phone.toString(),
            subject: subject.toString(),
            message: message.toString(),
            status: ContactStatus.NEW,
            priority: priority.toString() as ContactPriority,
        };

        const newContact = await ContactService.addContact(contactData);

        consoleManager.log("Contact created successfully:", newContact);

        return NextResponse.json({
            statusCode: 201,
            message: "Contact added successfully",
            data: newContact,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 201 });

    } catch (error: any) {
        consoleManager.error("Error in POST /api/contacts:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
