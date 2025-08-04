import { NextResponse } from "next/server";
import TestService from "../../services/testServices";
import consoleManager from "../../utils/consoleManager";

// Common CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { 
            questions, 
            answers, 
            recommendations, 
            userDetails, 
            testDuration, 
            totalQuestions 
        } = body;

        consoleManager.log("📥 Received POST request with data:", {
            questionsCount: questions?.length,
            answersCount: answers?.length,
            recommendationsCount: recommendations?.length,
            hasUserDetails: !!userDetails,
            userDetails: userDetails
        });

        // Validate required input
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "INVALID_INPUT",
                errorMessage: "Questions array is required and must not be empty.",
            }, { status: 400, headers: corsHeaders });
        }

        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "INVALID_INPUT",
                errorMessage: "Answers array is required and must not be empty.",
            }, { status: 400, headers: corsHeaders });
        }

        if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "INVALID_INPUT",
                errorMessage: "Recommendations array is required and must not be empty.",
            }, { status: 400, headers: corsHeaders });
        }

        if (!userDetails || !userDetails.name || !userDetails.email || !userDetails.phone) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "INVALID_INPUT",
                errorMessage: "User details (name, email, phone) are required.",
            }, { status: 400, headers: corsHeaders });
        }

        // Validate that answers correspond to questions
        if (answers.length !== questions.length) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "INVALID_INPUT",
                errorMessage: "Number of answers must match number of questions.",
            }, { status: 400, headers: corsHeaders });
        }

        // Save complete test result
        const result = await TestService.saveTestResult({
            questions,
            answers,
            recommendations,
            userDetails,
            testDuration,
            totalQuestions
        });

        consoleManager.log("✅ Complete test result saved via API:", result.id);

        return NextResponse.json({
            statusCode: 200,
            message: "Complete test result saved successfully",
            data: result,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200, headers: corsHeaders });

    } catch (error: any) {
        consoleManager.error("❌ Error in test API:", error.message);

        return NextResponse.json({
            statusCode: 500,
            errorCode: "SAVE_FAILED",
            errorMessage: error.message || "Failed to save test result",
        }, { status: 500, headers: corsHeaders });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userEmail = searchParams.get('userEmail');
        const id = searchParams.get('id');
        const stats = searchParams.get('stats');

        if (stats === 'true') {
            // Get test statistics
            const statistics = await TestService.getTestStats(userEmail || undefined);
            
            return NextResponse.json({
                statusCode: 200,
                message: "Test statistics retrieved successfully",
                data: statistics,
                errorCode: "NO",
                errorMessage: "",
            }, { status: 200, headers: corsHeaders });
        }

        if (id) {
            // Get specific test result by ID
            const result = await TestService.getTestResultById(id);
            
            return NextResponse.json({
                statusCode: 200,
                message: "Test result retrieved successfully",
                data: result,
                errorCode: "NO",
                errorMessage: "",
            }, { status: 200, headers: corsHeaders });
        } else {
            // Get all test results (optionally filtered by userEmail)
            const results = await TestService.getTestResults(userEmail || undefined);
            
            return NextResponse.json({
                statusCode: 200,
                message: "Test results retrieved successfully",
                data: results,
                errorCode: "NO",
                errorMessage: "",
            }, { status: 200, headers: corsHeaders });
        }

    } catch (error: any) {
        consoleManager.error("❌ Error fetching test results:", error.message);

        return NextResponse.json({
            statusCode: 500,
            errorCode: "FETCH_FAILED",
            errorMessage: error.message || "Failed to fetch test results",
        }, { status: 500, headers: corsHeaders });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "INVALID_INPUT",
                errorMessage: "Test result ID is required.",
            }, { status: 400, headers: corsHeaders });
        }

        consoleManager.log("🗑️ Deleting test result:", id);

        // Delete the test result
        await TestService.deleteTestResult(id);

        consoleManager.log("✅ Test result deleted successfully:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Test result deleted successfully",
            data: { id },
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200, headers: corsHeaders });

    } catch (error: any) {
        consoleManager.error("❌ Error deleting test result:", error.message);

        return NextResponse.json({
            statusCode: 500,
            errorCode: "DELETE_FAILED",
            errorMessage: error.message || "Failed to delete test result",
        }, { status: 500, headers: corsHeaders });
    }
} 