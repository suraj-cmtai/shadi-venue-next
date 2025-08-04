
import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

// Use status: 'active' | 'draft' | 'archived'
export type CourseStatus = 'active' | 'draft' | 'archived';

interface Course {
  id: string;
  title: string;
  category: string;
  duration: string;
  country: string; // changed from level to country
  price: number;
  feeType: string; // Field for fee duration/type (e.g., "per year", "full course fee")
  currency: 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR'; // Field for currency
  status: CourseStatus;
  description: string;
  instructor: string;
  enrollmentCount: number;
  image: string | null;
  learningHours: string;
  modeOfDelivery: string;
  modeOfAssessment: string;
  createdAt: Date;
  updatedAt: Date;
  modules?: string[];
  prerequisites?: string[];
  careerOpportunities?: string[];
}

// Course Services
class CourseService {
  static courses: Course[] = [];
  static isInitialized = false;

  // Helper method to convert Firestore timestamp to Date
  private static convertTimestamp(timestamp: any): Date {
    // Handle Firestore Timestamp objects
    if (timestamp && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }
    
    // Handle Firestore server timestamp (which might be null/undefined initially)
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // Handle Date objects
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    // Handle string timestamps
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    
    // Handle number timestamps
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    
    // Handle null, undefined, or empty objects - return current date
    if (!timestamp || (typeof timestamp === 'object' && Object.keys(timestamp).length === 0)) {
      return new Date();
    }
    
    // Fallback to current date for any other cases
    return new Date();
  }

  // Helper method to convert document data to Course type
  private static convertToType(id: string, data: any): Course {
    return {
      id,
      title: data.title || "",
      category: data.category || "",
      duration: data.duration || "",
      country: (data.country || "").toLowerCase(), // always save as lowercase
      price: Number(data.price || 0),
      feeType: data.feeType || "",
      currency: data.currency || "USD",
      status: (data.status as CourseStatus) || "draft",
      description: data.description || "",
      instructor: data.instructor || "",
      enrollmentCount: Number(data.enrollmentCount || 0),
      image: data.image || null,
      learningHours: data.learningHours || "",
      modeOfDelivery: data.modeOfDelivery || "",
      modeOfAssessment: data.modeOfAssessment || "",
      createdAt: this.convertTimestamp(data.createdAt),
      updatedAt: this.convertTimestamp(data.updatedAt),
      modules: data.modules || [],
      prerequisites: data.prerequisites || [],
      careerOpportunities: data.careerOpportunities || [],
    };
  }

  // Initialize Firestore real-time listener
  static initCourses() {
    if (this.isInitialized) return;

    consoleManager.log("Initializing Firestore listener for courses...");
    const coursesCollection = db.collection("courses");

    coursesCollection.onSnapshot((snapshot: any) => {
      this.courses = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
      consoleManager.log(
        "Firestore Read: Courses updated, count:",
        this.courses.length
      );
    });

    this.isInitialized = true;
  }

  // Get all courses
  static async getAllCourses(forceRefresh = true) {
    if (forceRefresh || !this.isInitialized) {
      consoleManager.log("Force refreshing courses from Firestore...");
      const snapshot = await db
        .collection("courses")
        .orderBy("createdAt", "desc")
        .get();
      this.courses = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
      this.isInitialized = true;
    } else {
      consoleManager.log("Returning cached courses. No Firestore read.");
    }
    return this.courses;
  }

  // Add a new course
  static async addCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      // Ensure country is always saved as lowercase
      const courseDataWithLowerCountry = {
        ...courseData,
        country: (courseData.country || "").toLowerCase(),
      };
      const newCourseRef = await db.collection("courses").add({
        ...courseDataWithLowerCountry,
        enrollmentCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      consoleManager.log("New course added with ID:", newCourseRef.id);

      // Wait a moment for the server timestamp to be resolved
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Fetch the newly created course to get the resolved timestamps
      const newCourseDoc = await db.collection("courses").doc(newCourseRef.id).get();
      const newCourse = this.convertToType(newCourseDoc.id, newCourseDoc.data());
      
      // Update the cache
      await this.getAllCourses(true);
      
      return newCourse;
      
    } catch (error: any) {
      consoleManager.error("Error adding new course:", error);
      throw error;
    }
  }

  // Get a course by ID
  static async getCourseById(id: string) {
    try {
      const course = this.courses.find((course) => course.id === id);
      if (course) {
        consoleManager.log(`Course found in cache:`, id);
        return course;
      }

      const courseDoc = await db.collection("courses").doc(id).get();
      
      if (!courseDoc.exists) {
        consoleManager.error(`Course with ID ${id} not found in Firestore.`);
        throw new Error("Course not found");
      }

      const courseData = this.convertToType(courseDoc.id, courseDoc.data());
      consoleManager.log(`Course fetched from Firestore:`, id);
      return courseData;
    } catch (error) {
      consoleManager.error(`Error fetching course ${id}:`, error);
      throw error;
    }
  }

  // Update a course by ID
  static async updateCourse(id: string, updateData: Partial<Course>) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const courseRef = db.collection("courses").doc(id);
      // If country is being updated, ensure it's lowercase
      const updateDataWithLowerCountry = {
        ...updateData,
        ...(updateData.country !== undefined && { country: (updateData.country || "").toLowerCase() }),
        updatedAt: timestamp,
      };
      await courseRef.update(updateDataWithLowerCountry);

      consoleManager.log("Course updated successfully:", id);
      
      // Wait a moment for the server timestamp to be resolved
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await this.getAllCourses(true);
      
      const updatedCourse = await this.getCourseById(id);
      return updatedCourse;
    } catch (error: any) {
      consoleManager.error("Error updating course:", error);
      throw error;
    }
  }

  // Delete a course by ID
  static async deleteCourse(id: string) {
    try {
      const courseRef = db.collection("courses").doc(id);
      await courseRef.delete();

      consoleManager.log("Course deleted successfully:", id);
      await this.getAllCourses(true);
      return { id };
    } catch (error: any) {
      consoleManager.error("Error deleting course:", error);
      throw error;
    }
  }

  // Update enrollment count
  static async updateEnrollmentCount(id: string, increment: boolean = true) {
    try {
      const courseRef = db.collection("courses").doc(id);
      const incrementValue = increment ? 1 : -1;
      
      await courseRef.update({
        enrollmentCount: admin.firestore.FieldValue.increment(incrementValue),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      consoleManager.log(`Course enrollment ${increment ? 'increased' : 'decreased'} for:`, id);
      await this.getAllCourses(true);
      return { success: true };
    } catch (error: any) {
      consoleManager.error("Error updating course enrollment:", error);
      throw error;
    }
  }

  // Get courses by category
  static async getCoursesByCategory(category: string) {
    return this.courses.filter(course => course.category === category);
  }

  // Get courses by country
  static async getCoursesByCountry(country: string) {
    return this.courses.filter(course => course.country === country.toLowerCase());
  }

  // Get courses by instructor
  static async getCoursesByInstructor(instructor: string) {
    return this.courses.filter(course => course.instructor === instructor);
  }

  // Get published courses (for backward compatibility, treat 'active' as published)
  static async getPublishedCourses() {
    return this.courses.filter(course => course.status === "active");
  }

  // Search courses
  static async searchCourses(query: string) {
    const searchTerm = query.toLowerCase();
    return this.courses.filter(course => 
      course.title.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm) ||
      course.category.toLowerCase().includes(searchTerm) ||
      course.instructor.toLowerCase().includes(searchTerm) ||
      (course.country && course.country.toLowerCase().includes(searchTerm))
    );
  }

  // Get all active courses (Uses cache)
  static async getAllActiveCourses(forceRefresh = true) {
    if (forceRefresh || !this.isInitialized) {
      consoleManager.log("Force refreshing active courses from Firestore...");
      const snapshot = await db
        .collection("courses")
        .where("status", "==", "active")
        .orderBy("createdAt", "desc")
        .get();
      this.courses = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
    } else {
      consoleManager.log("Returning cached active courses. No Firestore read.");
    }
    return this.courses;
  }
}

export default CourseService;