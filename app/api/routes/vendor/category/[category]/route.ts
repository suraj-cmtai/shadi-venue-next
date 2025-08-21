// app/api/routes/vendor/category/[category]/route.ts
import VendorService from "@/app/api/services/vendorServices";
import { NextResponse } from "next/server";

// GET /api/routes/vendor/category/[category] - Get vendors by category
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id: category } = resolvedParams;

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Category is required"
        },
        { status: 400 }
      );
    }

    // Decode URL-encoded category
    const decodedCategory = decodeURIComponent(category);

    // Validate category
    const validCategories = [
      "Venue", "Planner", "Photographer", "Decorator",
      "Caterer", "Makeup", "Entertainment", "Others"
    ];

    if (!validCategories.includes(decodedCategory)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category"
        },
        { status: 400 }
      );
    }

    // Initialize vendors if not already done
    if (!VendorService.isInitialized) {
      VendorService.initVendors();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for initialization
    }

    const vendors = await VendorService.getVendorsByCategory(decodedCategory as any);

    // Get additional filters from query params
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const status = searchParams.get('status');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    let filteredVendors = vendors;

    // Apply status filter
    if (status) {
      filteredVendors = filteredVendors.filter(vendor => vendor.status === status);
    }

    // Apply city filter
    if (city) {
      filteredVendors = filteredVendors.filter(vendor =>
        vendor.city.toLowerCase() === city.toLowerCase()
      );
    }

    // Apply price range filter
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      filteredVendors = filteredVendors.filter(vendor =>
        vendor.startingPrice >= min && vendor.startingPrice <= max
      );
    }

    // Sort by status (active first) and then by starting price
    filteredVendors.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (b.status === 'active' && a.status !== 'active') return 1;
      return a.startingPrice - b.startingPrice;
    });

    return NextResponse.json({
      success: true,
      data: filteredVendors,
      count: filteredVendors.length,
      category: decodedCategory,
      filters: {
        status,
        city,
        minPrice,
        maxPrice
      }
    });
  } catch (error: any) {
    // If params is a promise, we can't destructure category directly here
    let category = "";
    try {
      const resolvedParams = await params;
      category = resolvedParams.id;
    } catch {}
    console.error(`Error fetching vendors for category ${category}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch vendors by category",
        message: error.message
      },
      { status: 500 }
    );
  }
}