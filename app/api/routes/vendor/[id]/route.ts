// app/api/routes/vendor/[id]/route.ts
import { NextResponse } from "next/server";
import { uploadImageClient, replaceImageClient } from "@/lib/firebase-client";
import VendorService from "@/app/api/services/vendorServices";

// GET /api/routes/vendor/[id] - Get vendor by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Vendor ID is required"
        },
        { status: 400 }
      );
    }

    const vendor = await VendorService.getVendorById(id);

    return NextResponse.json({
      success: true,
      data: vendor
    });
  } catch (error: any) {
    console.error(`Error fetching vendor:`, error);

    if (error.message === "Vendor not found") {
      return NextResponse.json(
        {
          success: false,
          error: "Vendor not found"
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch vendor",
        message: error.message
      },
      { status: 500 }
    );
  }
}

// PUT /api/routes/vendor/[id] - Update vendor (all fields)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Vendor ID is required"
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    // Get existing vendor for image replacement
    const existingVendor = await VendorService.getVendorById(id);

    // Handle file uploads
    const logoFile = formData.get('logoFile') as File | null;
    const coverImageFile = formData.get('coverImageFile') as File | null;
    const portfolioFiles = formData.getAll('portfolioFiles') as File[];

    let logoUrl = existingVendor.logoUrl;
    let coverImageUrl = existingVendor.coverImageUrl;
    let portfolioImages = Array.isArray(existingVendor.portfolioImages)
      ? [...existingVendor.portfolioImages]
      : [];

    // Replace logo if new file provided
    if (logoFile) {
      const newLogoUrl = await replaceImageClient(logoFile, existingVendor.logoUrl);
      if (newLogoUrl) logoUrl = newLogoUrl;
    }

    // Replace cover image if new file provided
    if (coverImageFile) {
      const newCoverUrl = await replaceImageClient(coverImageFile, existingVendor.coverImageUrl);
      if (newCoverUrl) coverImageUrl = newCoverUrl;
    }

    // Handle portfolio images - add new ones
    if (portfolioFiles && portfolioFiles.length > 0) {
      for (const file of portfolioFiles) {
        if (file instanceof File) {
          const imageUrl = await uploadImageClient(file);
          portfolioImages.push(imageUrl);
        }
      }
    }

    // Parse update data for all fields in Vendor interface
    const updateData: any = {};

    // All fields from Vendor interface
    const allFields = [
      // Basic Business Info
      'name', 'category', 'yearOfEstablishment',
      // Contact Details
      'contactPersonName', 'designation', 'mobileNumber', 'mobileVerified', 
      'whatsappNumber', 'email', 'websiteOrSocial',
      // Location & Coverage
      'address', 'city', 'state', 'pinCode',
      // Services / Venue Details
      'servicesOffered', 'startingPrice', 'guestCapacityMin', 'guestCapacityMax',
      'facilitiesAvailable', 'specialities',
      // Portfolio Upload
      'logoUrl', 'coverImageUrl',
      // Business Highlights
      'about', 'awards', 'notableClients',
      // Payment & Booking Terms
      'advancePaymentPercent', 'refundPolicy',
      // Account Setup
      'username', 'passwordHash', 'agreedToTerms',
      // System fields
      'status', 'isPremium'
    ];

    // Fields that are arrays (parse as JSON)
    const arrayFields = [
      'serviceAreas', 'servicesOffered', 'facilitiesAvailable', 'portfolioImages', 
      'videoLinks', 'paymentModesAccepted'
    ];

    // Fields that are numbers
    const numberFields = [
      'startingPrice', 'guestCapacityMin', 'guestCapacityMax', 'advancePaymentPercent'
    ];

    // Fields that are booleans
    const booleanFields = [
      'agreedToTerms', 'mobileVerified', 'isPremium', 'isFeatured'
    ];

    // Parse all fields from formData
    for (const field of allFields) {
      if (field === 'logoUrl' || field === 'coverImageUrl' || field === 'portfolioImages') {
        // These are handled above
        continue;
      }
      const value = formData.get(field);
      if (value !== null) {
        if (arrayFields.includes(field)) {
          try {
            updateData[field] = JSON.parse(value as string);
          } catch {
            updateData[field] = [];
          }
        } else if (numberFields.includes(field)) {
          updateData[field] = value === "" ? undefined : Number(value);
        } else if (booleanFields.includes(field)) {
          // Use consistent boolean parsing style
          updateData[field] = value?.toString().toLowerCase() === "true";
        } else {
          updateData[field] = value;
        }
      }
    }

    // Update image URLs
    updateData.logoUrl = logoUrl;
    updateData.coverImageUrl = coverImageUrl;
    updateData.portfolioImages = portfolioImages;

    // passwordHash: never allow update to plain password, only hash if provided
    if (formData.get('passwordHash') !== null) {
      updateData.passwordHash = formData.get('passwordHash');
    }

    // status: allow update if provided
    if (formData.get('status') !== null) {
      updateData.status = formData.get('status');
    }

    // isPremium: allow update if provided, use consistent boolean parsing style
    if (formData.get('isPremium') !== null) {
      const isPremium = formData.get("isPremium")?.toString();
      updateData.isPremium = isPremium?.toLowerCase() === "true";
    }

    // isFeatured: allow update if provided, use consistent boolean parsing style
    if (formData.get('isFeatured') !== null) {
      const isFeatured = formData.get("isFeatured")?.toString();
      updateData.isFeatured = isFeatured?.toLowerCase() === "true";
    }

    // createdAt, updatedAt: do not allow manual update (handled by backend)

    const updatedVendor = await VendorService.updateVendor(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedVendor,
      message: "Vendor updated successfully"
    });
  } catch (error: any) {
    console.error(`Error updating vendor:`, error);

    if (error.message === "Vendor not found") {
      return NextResponse.json(
        {
          success: false,
          error: "Vendor not found"
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update vendor",
        message: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE /api/routes/vendor/[id] - Delete vendor
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Vendor ID is required"
        },
        { status: 400 }
      );
    }

    await VendorService.deleteVendor(id);

    return NextResponse.json({
      success: true,
      message: "Vendor deleted successfully"
    });
  } catch (error: any) {
    console.error(`Error deleting vendor:`, error);

    if (error.message === "Vendor not found") {
      return NextResponse.json(
        {
          success: false,
          error: "Vendor not found"
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete vendor",
        message: error.message
      },
      { status: 500 }
    );
  }
}