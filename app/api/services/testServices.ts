import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";

export interface TestQuestion {
  id: number;
  question: string;
  options: string[];
  category: string;
}

export interface TestAnswer {
  questionId: number;
  answer: string;
  timeSpent: number;
  category: string;
}

export interface CareerRecommendation {
  title: string;
  description: string;
  matchPercentage: number;
  skills: string[];
  educationPath: string[];
  image?: string;
  link?: string;
  id?: string;
}

export interface UserDetails {
  name: string;
  phone: string;
  email: string;
}

export interface TestResult {
  questions: TestQuestion[];
  answers: TestAnswer[];
  recommendations: CareerRecommendation[];
  userDetails: UserDetails;
  testDuration?: number;
  totalQuestions?: number;
  createdAt: string;
  updatedAt: string;
}

class TestService {
  static async saveTestResult(testData: { 
    questions: TestQuestion[]; 
    answers: TestAnswer[]; 
    recommendations: CareerRecommendation[]; 
    userDetails: UserDetails;
    testDuration?: number;
    totalQuestions?: number;
  }) {
    try {
      consoleManager.log("💾 Saving complete test result...");

      const testResult: TestResult = {
        questions: testData.questions,
        answers: testData.answers,
        recommendations: testData.recommendations,
        userDetails: testData.userDetails,
        testDuration: testData.testDuration,
        totalQuestions: testData.totalQuestions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await db.collection("testResults").add(testResult);

      consoleManager.log("✅ Complete test result saved successfully:", docRef.id);
      return {
        id: docRef.id,
        ...testResult
      };

    } catch (error: any) {
      consoleManager.error("❌ Error saving complete test result:", error.message);
      throw new Error(error.message || "Failed to save test result");
    }
  }

  static async getTestResults(userEmail?: string) {
    try {
      consoleManager.log("🔍 Fetching test results...");

      let query = db.collection("testResults").orderBy("createdAt", "desc");
      
      if (userEmail) {
        query = query.where("userDetails.email", "==", userEmail);
      }

      const snapshot = await query.get();
      const results: (TestResult & { id: string })[] = [];

      snapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data() as TestResult
        });
      });

      consoleManager.log("✅ Test results fetched successfully:", results.length);
      return results;

    } catch (error: any) {
      consoleManager.error("❌ Error fetching test results:", error.message);
      throw new Error(error.message || "Failed to fetch test results");
    }
  }

  static async getTestResultById(id: string) {
    try {
      consoleManager.log("🔍 Fetching test result by ID:", id);

      const doc = await db.collection("testResults").doc(id).get();

      if (!doc.exists) {
        throw new Error("Test result not found");
      }

      const result = {
        id: doc.id,
        ...doc.data() as TestResult
      };

      consoleManager.log("✅ Test result fetched successfully:", id);
      return result;

    } catch (error: any) {
      consoleManager.error("❌ Error fetching test result:", error.message);
      throw new Error(error.message || "Failed to fetch test result");
    }
  }

  static async deleteTestResult(id: string) {
    try {
      consoleManager.log("🗑️ Deleting test result:", id);

      const doc = await db.collection("testResults").doc(id).get();

      if (!doc.exists) {
        throw new Error("Test result not found");
      }

      await db.collection("testResults").doc(id).delete();

      consoleManager.log("✅ Test result deleted successfully:", id);
      return { id };

    } catch (error: any) {
      consoleManager.error("❌ Error deleting test result:", error.message);
      throw new Error(error.message || "Failed to delete test result");
    }
  }

  static async getTestStats(userEmail?: string) {
    try {
      consoleManager.log("📊 Fetching test statistics...");

      const results = await this.getTestResults(userEmail);
      
      const stats = {
        totalTests: results.length,
        averageQuestions: results.reduce((sum, test) => sum + (test.totalQuestions || 0), 0) / results.length || 0,
        averageDuration: results.reduce((sum, test) => sum + (test.testDuration || 0), 0) / results.length || 0,
        mostCommonCategories: this.getMostCommonCategories(results),
        averageMatchPercentage: results.reduce((sum, test) => {
          const avgMatch = test.recommendations.reduce((recSum, rec) => recSum + rec.matchPercentage, 0) / test.recommendations.length || 0;
          return sum + avgMatch;
        }, 0) / results.length || 0,
        uniqueUsers: new Set(results.map(r => r.userDetails.email)).size
      };

      consoleManager.log("✅ Test statistics calculated successfully");
      return stats;

    } catch (error: any) {
      consoleManager.error("❌ Error calculating test statistics:", error.message);
      throw new Error(error.message || "Failed to calculate test statistics");
    }
  }

  private static getMostCommonCategories(results: (TestResult & { id: string })[]) {
    const categoryCount: Record<string, number> = {};
    
    results.forEach(test => {
      test.answers.forEach(answer => {
        categoryCount[answer.category] = (categoryCount[answer.category] || 0) + 1;
      });
    });

    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
  }
}

export default TestService; 