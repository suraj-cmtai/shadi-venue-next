// app/api/routes/vendor/analytics/route.ts
import VendorService from "@/app/api/services/vendorServices";
import { NextRequest, NextResponse } from "next/server";

// GET /api/routes/vendor/analytics - Get vendor analytics and statistics
export async function GET(request: NextRequest) {
  try {
    // Initialize vendors if not already done
    if (!VendorService.isInitialized) {
      VendorService.initVendors();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for initialization
    }

    const vendors = await VendorService.getAllVendors();

    // Basic statistics
    const totalVendors = vendors.length;
    const activeVendors = vendors.filter(v => v.status === 'active').length;
    const inactiveVendors = totalVendors - activeVendors;

    // Category breakdown
    const categoryStats = vendors.reduce((acc, vendor) => {
      acc[vendor.category] = (acc[vendor.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // City breakdown (top 10)
    const cityStats = vendors.reduce((acc, vendor) => {
      const city = vendor.city;
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCities = Object.entries(cityStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((acc, [city, count]) => {
        acc[city] = count;
        return acc;
      }, {} as Record<string, number>);

    // Price range analysis
    const prices = vendors.map(v => v.startingPrice).filter(p => p > 0);
    const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Price range distribution
    const priceRanges = {
      '0-10000': 0,
      '10001-25000': 0,
      '25001-50000': 0,
      '50001-100000': 0,
      '100000+': 0
    };

    prices.forEach(price => {
      if (price <= 10000) priceRanges['0-10000']++;
      else if (price <= 25000) priceRanges['10001-25000']++;
      else if (price <= 50000) priceRanges['25001-50000']++;
      else if (price <= 100000) priceRanges['50001-100000']++;
      else priceRanges['100000+']++;
    });

    // Service area analysis
    const serviceAreaStats = vendors.reduce((acc, vendor) => {
      vendor.serviceAreas.forEach(area => {
        acc[area] = (acc[area] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = vendors.filter(vendor => 
      new Date(vendor.createdAt) > thirtyDaysAgo
    ).length;

    // Monthly registration trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthlyCount = vendors.filter(vendor => {
        const createdDate = new Date(vendor.createdAt);
        return createdDate >= monthStart && createdDate <= monthEnd;
      }).length;

      monthlyTrend.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: monthlyCount
      });
    }

    // Vendors with complete profiles (have logo, cover image, and about text)
    const completeProfiles = vendors.filter(vendor => 
      vendor.logoUrl && vendor.coverImageUrl && vendor.about && vendor.about.length > 50
    ).length;

    const profileCompletionRate = totalVendors > 0 ? Math.round((completeProfiles / totalVendors) * 100) : 0;

    // Payment mode popularity
    const paymentModeStats = vendors.reduce((acc, vendor) => {
      vendor.paymentModesAccepted.forEach(mode => {
        acc[mode] = (acc[mode] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Vendors with verified mobile numbers
    const verifiedVendors = vendors.filter(v => v.mobileVerified).length;
    const verificationRate = totalVendors > 0 ? Math.round((verifiedVendors / totalVendors) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalVendors,
          activeVendors,
          inactiveVendors,
          recentRegistrations,
          profileCompletionRate,
          verificationRate
        },
        pricing: {
          averagePrice: avgPrice,
          minimumPrice: minPrice,
          maximumPrice: maxPrice,
          priceDistribution: priceRanges
        },
        demographics: {
          categoryBreakdown: categoryStats,
          topCities,
          serviceAreaCoverage: serviceAreaStats,
          paymentMethodPopularity: paymentModeStats
        },
        trends: {
          monthlyRegistrations: monthlyTrend
        }
      }
    });
  } catch (error: any) {
    console.error("Error generating vendor analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate analytics",
        message: error.message
      },
      { status: 500 }
    );
  }
}