// app/api/routes/vendor/search/route.ts
import VendorService from "@/app/api/services/vendorServices";
import { NextRequest, NextResponse } from "next/server";

// GET /api/routes/vendor/search?q=query&category=category&city=city&status=status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const status = searchParams.get('status');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Initialize vendors if not already done
    if (!VendorService.isInitialized) {
      VendorService.initVendors();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for initialization
    }

    // Get all vendors first
    let vendors = await VendorService.getAllVendors();

    // Apply text search if provided
    if (query) {
      vendors = await VendorService.searchVendors(query);
    }

    // Apply category filter
    if (category) {
      vendors = vendors.filter(vendor => vendor.category === category);
    }

    // Apply city filter
    if (city) {
      vendors = vendors.filter(vendor => 
        vendor.city.toLowerCase() === city.toLowerCase()
      );
    }

    // Apply status filter
    if (status) {
      vendors = vendors.filter(vendor => vendor.status === status);
    }

    // Apply price range filter
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      vendors = vendors.filter(vendor => 
        vendor.startingPrice >= min && vendor.startingPrice <= max
      );
    }

    // Sort by relevance (active vendors first, then by creation date)
    vendors.sort((a, b) => {
      // Active vendors first
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (b.status === 'active' && a.status !== 'active') return 1;
      
      // Then by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      data: vendors,
      count: vendors.length,
      filters: {
        query,
        category,
        city,
        status,
        minPrice,
        maxPrice
      }
    });
  } catch (error: any) {
    console.error("Error searching vendors:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search vendors",
        message: error.message
      },
      { status: 500 }
    );
  }
}