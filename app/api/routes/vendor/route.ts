// app/api/routes/vendor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { uploadImageClient } from "@/lib/firebase-client";
import VendorService from "../../services/vendorServices";

// GET /api/routes/vendor - Fetch all vendors or active vendors
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    
    // Initialize vendors if not already done
    if (!VendorService.isInitialized) {
      VendorService.initVendors();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for initialization
    }

    let vendors;
    if (status === 'active') {
      vendors = await VendorService.getActiveVendors();
    } else {
      vendors = await VendorService.getAllVendors();
    }

    return NextResponse.json({
      success: true,
      data: vendors,
      count: vendors.length
    });
  } catch (error: any) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch vendors",
        message: error.message
      },
      { status: 500 }
    );
  }
}

// POST /api/routes/vendor - Create a new vendor
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract files for upload
    const logoFile = formData.get('logoFile') as File | null;
    const coverImageFile = formData.get('coverImageFile') as File | null;
    const portfolioFiles = formData.getAll('portfolioFiles') as File[];
    
    // Upload images to Firebase
    let logoUrl = '';
    let coverImageUrl = '';
    let portfolioImages: string[] = [];

    if (logoFile) {
      logoUrl = await uploadImageClient(logoFile);
    }

    if (coverImageFile) {
      coverImageUrl = await uploadImageClient(coverImageFile);
    }

    // Upload portfolio images
    if (portfolioFiles && portfolioFiles.length > 0) {
      for (const file of portfolioFiles) {
        if (file instanceof File) {
          const imageUrl = await uploadImageClient(file);
          portfolioImages.push(imageUrl);
        }
      }
    }

    // Parse other form data
    const vendorData = {
      businessName: formData.get('businessName') as string,
      category: formData.get('category') as any,
      yearOfEstablishment: formData.get('yearOfEstablishment') as string,
      contactPersonName: formData.get('contactPersonName') as string,
      designation: formData.get('designation') as any,
      mobileNumber: formData.get('mobileNumber') as string,
      whatsappNumber: formData.get('whatsappNumber') as string,
      email: formData.get('email') as string,
      websiteOrSocial: formData.get('websiteOrSocial') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      pinCode: formData.get('pinCode') as string,
      serviceAreas: JSON.parse(formData.get('serviceAreas') as string || '[]'),
      servicesOffered: JSON.parse(formData.get('servicesOffered') as string || '[]'),
      startingPrice: Number(formData.get('startingPrice') || 0),
      guestCapacityMin: formData.get('guestCapacityMin') ? Number(formData.get('guestCapacityMin')) : undefined,
      guestCapacityMax: formData.get('guestCapacityMax') ? Number(formData.get('guestCapacityMax')) : undefined,
      facilitiesAvailable: JSON.parse(formData.get('facilitiesAvailable') as string || '[]'),
      specialities: formData.get('specialities') as string,
      logoUrl,
      coverImageUrl,
      portfolioImages,
      videoLinks: JSON.parse(formData.get('videoLinks') as string || '[]'),
      about: formData.get('about') as string,
      awards: formData.get('awards') as string,
      notableClients: formData.get('notableClients') as string,
      advancePaymentPercent: formData.get('advancePaymentPercent') ? Number(formData.get('advancePaymentPercent')) : undefined,
      refundPolicy: formData.get('refundPolicy') as string,
      paymentModesAccepted: JSON.parse(formData.get('paymentModesAccepted') as string || '[]'),
      username: formData.get('username') as string,
      agreedToTerms: formData.get('agreedToTerms') === 'true',
      status: (formData.get('status') as any) || 'inactive',
      isPremium: formData.get('isPremium') === 'true',
      isFeatured: formData.get('isFeatured') === 'true',
    };

    const newVendor = await VendorService.addVendor(vendorData);

    return NextResponse.json({
      success: true,
      data: newVendor,
      message: "Vendor created successfully"
    });
  } catch (error: any) {
    console.error("Error creating vendor:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create vendor",
        message: error.message
      },
      { status: 500 }
    );
  }
}