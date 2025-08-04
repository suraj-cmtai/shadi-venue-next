import { NextResponse } from "next/server";
import { UploadImage } from "../../controller/imageController";
import VendorService, { VendorType } from "../../services/vendorServices";
import consoleManager from "../../utils/consoleManager";

// Get all vendors or filter by type
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type") as VendorType;
        const status = searchParams.get("status");
        const city = searchParams.get("city");

        let vendors = await VendorService.getAllVendors();

        // Apply filters if provided
        if (type) {
            vendors = vendors.filter((vendor) => vendor.type === type);
        }
        if (status) {
            vendors = vendors.filter((vendor) => vendor.status === status);
        }
        if (city) {
            vendors = vendors.filter((vendor) => 
                vendor.location.city.toLowerCase() === city.toLowerCase()
            );
        }

        consoleManager.log("Fetched vendors with filters:", vendors.length);

        return NextResponse.json({
            statusCode: 200,
            message: "Vendors fetched successfully",
            data: vendors,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/vendors:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Add a new vendor
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        
        // Extract basic info
        const name = formData.get("name");
        const type = formData.get("type") as VendorType;
        const description = formData.get("description");
        const services = formData.get("services");
        const basePrice = formData.get("basePrice");
        const currency = formData.get("currency");
        
        // Extract location info
        const address = formData.get("address");
        const city = formData.get("city");
        const state = formData.get("state");
        const country = formData.get("country");
        
        // Extract contact info
        const phone = formData.get("phone");
        const email = formData.get("email");
        const website = formData.get("website");
        
        // Extract availability
        const availableDays = formData.get("availableDays");
        const availableHours = formData.get("availableHours");
        
        // Validate required fields
        if (!name || !type || !description || !basePrice || !address || !city || !country || !phone || !email) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Missing required fields",
            }, { status: 400 });
        }

        // Validate basePrice is a number
        const priceNumber = Number(basePrice);
        if (isNaN(priceNumber)) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Base price must be a valid number",
            }, { status: 400 });
        }

        // Handle image uploads
        const images = formData.getAll("images");
        const imageUrls: string[] = [];

        for (const image of images) {
            if (image instanceof File) {
                const imageUrl = await UploadImage(image, 1200, 800);
                if (imageUrl) imageUrls.push(String(imageUrl));
            }
        }

        // Prepare vendor data
        const vendorData = {
            name: name.toString(),
            type: type,
            description: description.toString(),
            services: services ? services.toString().split(',').map(s => s.trim()) : [],
            pricing: {
                basePrice: priceNumber,
                currency: (currency?.toString() || 'USD') as 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR',
            },
            location: {
                address: address.toString(),
                city: city.toString(),
                state: state?.toString() || "",
                country: country.toString(),
            },
            contactInfo: {
                phone: phone.toString(),
                email: email.toString(),
                website: website?.toString(),
            },
            portfolio: {
                images: imageUrls,
                videos: [],
            },
            rating: 0,
            reviews: [],
            availability: {
                days: availableDays ? availableDays.toString().split(',').map(d => d.trim()) : [],
                hours: availableHours?.toString() || "",
            },
            status: 'active' as const,
        };

        const newVendor = await VendorService.addVendor(vendorData);

        return NextResponse.json({
            statusCode: 201,
            message: "Vendor added successfully",
            data: newVendor,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 201 });

    } catch (error: any) {
        consoleManager.error("Error in POST /api/vendors:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Update a vendor
export async function PUT(req: Request) {
    try {
        const formData = await req.formData();
        const id = formData.get("id");

        if (!id) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Vendor ID is required",
            }, { status: 400 });
        }

        // Get existing vendor
        const existingVendor = await VendorService.getVendorById(id.toString());
        if (!existingVendor) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Vendor not found",
            }, { status: 404 });
        }

        // Handle image uploads if any
        const newImages = formData.getAll("images");
        const imageUrls: string[] = [...existingVendor.portfolio.images];

        for (const image of newImages) {
            if (image instanceof File) {
                const imageUrl = await UploadImage(image, 1200, 800);
                if (imageUrl) imageUrls.push(String(imageUrl));
            }
        }

        // Prepare update data
        const updateData = {
            ...existingVendor,
            name: formData.get("name")?.toString() || existingVendor.name,
            type: (formData.get("type")?.toString() as VendorType) || existingVendor.type,
            description: formData.get("description")?.toString() || existingVendor.description,
            services: formData.get("services")?.toString().split(',').map(s => s.trim()) || existingVendor.services,
            pricing: {
                basePrice: Number(formData.get("basePrice")) || existingVendor.pricing.basePrice,
                currency: (formData.get("currency")?.toString() as 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR') || existingVendor.pricing.currency,
            },
            location: {
                address: formData.get("address")?.toString() || existingVendor.location.address,
                city: formData.get("city")?.toString() || existingVendor.location.city,
                state: formData.get("state")?.toString() || existingVendor.location.state,
                country: formData.get("country")?.toString() || existingVendor.location.country,
            },
            contactInfo: {
                phone: formData.get("phone")?.toString() || existingVendor.contactInfo.phone,
                email: formData.get("email")?.toString() || existingVendor.contactInfo.email,
                website: formData.get("website")?.toString() || existingVendor.contactInfo.website,
            },
            portfolio: {
                ...existingVendor.portfolio,
                images: imageUrls,
            },
            availability: {
                days: formData.get("availableDays")?.toString().split(',').map(d => d.trim()) || existingVendor.availability.days,
                hours: formData.get("availableHours")?.toString() || existingVendor.availability.hours,
            },
            status: (formData.get("status")?.toString() as 'active' | 'inactive') || existingVendor.status,
        };

        const updatedVendor = await VendorService.updateVendor(id.toString(), updateData);

        return NextResponse.json({
            statusCode: 200,
            message: "Vendor updated successfully",
            data: updatedVendor,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });

    } catch (error: any) {
        consoleManager.error("Error in PUT /api/vendors:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Delete a vendor
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Vendor ID is required",
            }, { status: 400 });
        }

        await VendorService.deleteVendor(id);

        return NextResponse.json({
            statusCode: 200,
            message: "Vendor deleted successfully",
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });

    } catch (error: any) {
        consoleManager.error("Error in DELETE /api/vendors:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
