import { NextResponse } from "next/server";
import VendorService from "../../../services/vendorServices";
import { UploadImage } from "../../../controller/imageController";
import consoleManager from "../../../utils/consoleManager";

// GET: Fetch a single vendor profile by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vendor = await VendorService.getVendorById(id);

    if (!vendor) {
      return NextResponse.json(
        {
          statusCode: 404,
          errorCode: "NOT_FOUND",
          errorMessage: "Vendor not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        statusCode: 200,
        message: "Vendor profile fetched successfully",
        data: vendor,
        errorCode: "NO",
        errorMessage: "",
      },
      { status: 200 }
    );
  } catch (error: any) {
    consoleManager.error("Error in GET /api/routes/vendor/profile:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        errorCode: "INTERNAL_ERROR",
        errorMessage: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

// PATCH: Update a vendor profile by ID (expects multipart/form-data)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const formData = await req.formData();
    const { id } = await params;

    // Build updateData object based on Vendor interface
    const updateData: any = {};

    // Step 1: Basic Business Info
    if (formData.has("businessName")) updateData.businessName = formData.get("businessName")?.toString() || "";
    if (formData.has("category")) updateData.category = formData.get("category")?.toString() || "Others";
    if (formData.has("yearOfEstablishment")) updateData.yearOfEstablishment = formData.get("yearOfEstablishment")?.toString() || "";

    // Step 2: Contact Details
    if (formData.has("contactPersonName")) updateData.contactPersonName = formData.get("contactPersonName")?.toString() || "";
    if (formData.has("designation")) updateData.designation = formData.get("designation")?.toString() || "Other";
    if (formData.has("mobileNumber")) updateData.mobileNumber = formData.get("mobileNumber")?.toString() || "";
    if (formData.has("whatsappNumber")) updateData.whatsappNumber = formData.get("whatsappNumber")?.toString() || "";
    if (formData.has("email")) updateData.email = formData.get("email")?.toString() || "";
    if (formData.has("websiteOrSocial")) updateData.websiteOrSocial = formData.get("websiteOrSocial")?.toString() || "";

    // Step 3: Location & Coverage
    if (formData.has("address")) updateData.address = formData.get("address")?.toString() || "";
    if (formData.has("city")) updateData.city = formData.get("city")?.toString() || "";
    if (formData.has("state")) updateData.state = formData.get("state")?.toString() || "";
    if (formData.has("pinCode")) updateData.pinCode = formData.get("pinCode")?.toString() || "";
    if (formData.has("serviceAreas")) {
      updateData.serviceAreas = formData.getAll("serviceAreas").map((v) => v.toString()).filter(Boolean);
    }

    // Step 4: Services / Venue Details
    if (formData.has("servicesOffered")) {
      updateData.servicesOffered = formData.getAll("servicesOffered").map((v) => v.toString()).filter(Boolean);
    }
    if (formData.has("startingPrice")) {
      const val = formData.get("startingPrice")?.toString();
      updateData.startingPrice = val ? Number(val) : 0;
    }
    if (formData.has("guestCapacityMin")) {
      const val = formData.get("guestCapacityMin")?.toString();
      updateData.guestCapacityMin = val ? Number(val) : undefined;
    }
    if (formData.has("guestCapacityMax")) {
      const val = formData.get("guestCapacityMax")?.toString();
      updateData.guestCapacityMax = val ? Number(val) : undefined;
    }
    if (formData.has("facilitiesAvailable")) {
      updateData.facilitiesAvailable = formData.getAll("facilitiesAvailable").map((v) => v.toString()).filter(Boolean);
    }
    if (formData.has("specialities")) updateData.specialities = formData.get("specialities")?.toString() || "";

    // Step 5: Portfolio Upload
    // Handle logo and cover image uploads if present
    if (formData.has("logo")) {
      const logoFile = formData.get("logo") as File | null;
      if (logoFile && typeof logoFile === "object" && logoFile.size > 0) {
        const logoUrl = await UploadImage(logoFile, 800, 800);
        updateData.logoUrl = logoUrl;
      }
    }
    if (formData.has("coverImage")) {
      const coverImageFile = formData.get("coverImage") as File | null;
      if (coverImageFile && typeof coverImageFile === "object" && coverImageFile.size > 0) {
        const coverImageUrl = await UploadImage(coverImageFile, 800,800);
        updateData.coverImageUrl = coverImageUrl;
      }
    }
    if (formData.has("portfolioImages")) {
      // Accept multiple files or URLs
      const files = formData.getAll("portfolioImages");
      const urls: string[] = [];
      for (const file of files) {
        if (typeof file === "string") {
          urls.push(file);
        } else if (file instanceof File && file.size > 0) {
          const url = await UploadImage(file, 800,800) || "";
          urls.push(url.toString());
        }
      }
      updateData.portfolioImages = urls;
    }
    if (formData.has("videoLinks")) {
      updateData.videoLinks = formData.getAll("videoLinks").map((v) => v.toString()).filter(Boolean);
    }

    // Step 6: Business Highlights
    if (formData.has("about")) updateData.about = formData.get("about")?.toString() || "";
    if (formData.has("awards")) updateData.awards = formData.get("awards")?.toString() || "";
    if (formData.has("notableClients")) updateData.notableClients = formData.get("notableClients")?.toString() || "";

    // Step 7: Payment & Booking Terms
    if (formData.has("advancePaymentPercent")) {
      const val = formData.get("advancePaymentPercent")?.toString();
      updateData.advancePaymentPercent = val ? Number(val) : undefined;
    }
    if (formData.has("refundPolicy")) updateData.refundPolicy = formData.get("refundPolicy")?.toString() || "";
    if (formData.has("paymentModesAccepted")) {
      updateData.paymentModesAccepted = formData.getAll("paymentModesAccepted").map((v) => v.toString()).filter(Boolean);
    }

    // Step 8: Account Setup
    if (formData.has("username")) updateData.username = formData.get("username")?.toString() || "";
    if (formData.has("passwordHash")) updateData.passwordHash = formData.get("passwordHash")?.toString() || "";
    if (formData.has("agreedToTerms")) {
      const val = formData.get("agreedToTerms")?.toString();
      updateData.agreedToTerms = val === "true" || val === "1";
    }

    // System fields
    if (formData.has("status")) updateData.status = formData.get("status")?.toString() || "inactive";

    // Update vendor in DB
    const updatedVendor = await VendorService.updateVendor(id, updateData);

    return NextResponse.json(
      {
        statusCode: 200,
        message: "Vendor profile updated successfully",
        data: updatedVendor,
        errorCode: "NO",
        errorMessage: "",
      },
      { status: 200 }
    );
  } catch (error: any) {
    consoleManager.error("Error in PATCH /api/routes/vendor/profile:", error);
    return NextResponse.json(
      {
        statusCode: 500,
        errorCode: "INTERNAL_ERROR",
        errorMessage: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}