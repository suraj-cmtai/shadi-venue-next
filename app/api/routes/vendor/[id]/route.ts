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
    // params may be a promise, so we can't access params.id directly here
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

// PUT /api/routes/vendor/[id] - Update vendor
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

    // Parse update data
    const updateData: any = {};

    // Only update fields that are provided
    const fields = [
      'businessName', 'category', 'yearOfEstablishment', 'contactPersonName',
      'designation', 'mobileNumber', 'whatsappNumber', 'email', 'websiteOrSocial',
      'address', 'city', 'state', 'pinCode', 'specialities', 'about',
      'awards', 'notableClients', 'refundPolicy', 'username', 'status'
    ];

    fields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) {
        updateData[field] = value;
      }
    });

    // Handle array and number fields
    const arrayFields = ['serviceAreas', 'servicesOffered', 'facilitiesAvailable', 'videoLinks', 'paymentModesAccepted'];
    arrayFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) {
        updateData[field] = JSON.parse(value as string);
      }
    });

    const numberFields = ['startingPrice', 'guestCapacityMin', 'guestCapacityMax', 'advancePaymentPercent'];
    numberFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null && value !== '') {
        updateData[field] = Number(value);
      }
    });

    // Handle boolean fields
    if (formData.get('agreedToTerms') !== null) {
      updateData.agreedToTerms = formData.get('agreedToTerms') === 'true';
    }

    if (formData.get('mobileVerified') !== null) {
      updateData.mobileVerified = formData.get('mobileVerified') === 'true';
    }

    // Update image URLs
    updateData.logoUrl = logoUrl;
    updateData.coverImageUrl = coverImageUrl;
    updateData.portfolioImages = portfolioImages;

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