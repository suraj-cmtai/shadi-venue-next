import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

/**
 * AboutService manages about content and process steps for the about page.
 * It provides CRUD operations and uses a Firestore real-time listener for cache.
 */
class AboutService {
  static aboutContent: any[] = [];
  static processSteps: any[] = [];
  static isAboutInitialized = false;
  static isProcessStepsInitialized = false;

  // Initialize Firestore real-time listener for about content (runs once)
  static initAboutContent() {
    if (this.isAboutInitialized) return;

    consoleManager.log("Initializing Firestore listener for about content...");
    const aboutCollection = db.collection("aboutContent");

    aboutCollection.onSnapshot((snapshot: any) => {
      this.aboutContent = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      consoleManager.log(
        "Firestore Read: About content updated, count:",
        this.aboutContent.length
      );
    });

    this.isAboutInitialized = true;
  }

  // Initialize Firestore real-time listener for process steps (runs once)
  static initProcessSteps() {
    if (this.isProcessStepsInitialized) return;

    consoleManager.log("Initializing Firestore listener for process steps...");
    const processStepsCollection = db.collection("processSteps");

    processStepsCollection.onSnapshot((snapshot: any) => {
      this.processSteps = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      consoleManager.log(
        "Firestore Read: Process steps updated, count:",
        this.processSteps.length
      );
    });

    this.isProcessStepsInitialized = true;
  }

  private static convertTimestamp(timestamp: any): Date {
    if (timestamp && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }
    return timestamp instanceof Date ? timestamp : new Date(timestamp);
  }

  private static convertToAboutType(id: string, data: any): any {
    return {
      id,
      title: data.title || "",
      subtitle: data.subtitle || "",
      description: data.description || "",
      image: data.image || "",
      buttonText: data.buttonText || "",
      buttonLink: data.buttonLink || "",
      status: data.status || "active",
      createdOn: this.convertTimestamp(data.createdOn),
      updatedOn: this.convertTimestamp(data.updatedOn),
    };
  }

  private static convertToProcessStepType(id: string, data: any): any {
    return {
      id,
      icon: data.icon || "",
      title: data.title || "",
      description: data.description || "",
      bgColor: data.bgColor || "",
      titleColor: data.titleColor || "",
      order: data.order || 1,
      status: data.status || "active",
      createdOn: this.convertTimestamp(data.createdOn),
      updatedOn: this.convertTimestamp(data.updatedOn),
    };
  }

  // ABOUT CONTENT METHODS

  // Get all about content (Uses cache unless forceRefresh is true)
  static async getAllAboutContent(forceRefresh = false) {
    if (forceRefresh || !this.isAboutInitialized) {
      consoleManager.log("Force refreshing about content from Firestore...");
      const snapshot = await db
        .collection("aboutContent")
        .orderBy("createdOn", "desc")
        .get();
      this.aboutContent = snapshot.docs.map((doc: any) =>
        this.convertToAboutType(doc.id, doc.data())
      );
      this.isAboutInitialized = true;
    } else {
      consoleManager.log("Returning cached about content. No Firestore read.");
    }
    return this.aboutContent;
  }

  // Add a new about content with createdOn timestamp
  static async addAboutContent(aboutData: any) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const newAboutRef = await db.collection("aboutContent").add({
        ...aboutData,
        status: aboutData.status || "active",
        createdOn: timestamp,
        updatedOn: timestamp,
      });

      consoleManager.log("New about content added with ID:", newAboutRef.id);

      // Force refresh the cache after adding new about content
      await this.getAllAboutContent(true);

      return { id: newAboutRef.id, ...aboutData, createdOn: timestamp, updatedOn: timestamp };
    } catch (error) {
      consoleManager.error("Error adding about content:", error);
      throw new Error("Failed to add about content");
    }
  }

  // Get about content by ID (fetches from cache first)
  static async getAboutContentById(aboutId: string) {
    try {
      // Check if about content exists in cache
      const cachedAbout = this.aboutContent.find((a: any) => a.id === aboutId);
      if (cachedAbout) {
        consoleManager.log("About content fetched from cache:", aboutId);
        return cachedAbout;
      }

      // Fetch from Firestore if not in cache
      const aboutRef = db.collection("aboutContent").doc(aboutId);
      const doc = await aboutRef.get();

      if (!doc.exists) {
        consoleManager.warn("About content not found:", aboutId);
        return null;
      }

      consoleManager.log("About content fetched from Firestore:", aboutId);
      return this.convertToAboutType(doc.id, doc.data());
    } catch (error) {
      consoleManager.error("❌ Error fetching about content by ID:", error);
      throw new Error("Failed to fetch about content");
    }
  }

  // Update about content with updatedOn timestamp
  static async updateAboutContent(aboutId: string, updatedData: any) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const aboutRef = db.collection("aboutContent").doc(aboutId);
      await aboutRef.update({
        ...updatedData,
        updatedOn: timestamp,
      });

      consoleManager.log("About content updated:", aboutId);

      // Force refresh the cache after updating about content
      await this.getAllAboutContent(true);

      return { id: aboutId, ...updatedData, updatedOn: timestamp };
    } catch (error) {
      consoleManager.error("Error updating about content:", error);
      throw new Error("Failed to update about content");
    }
  }

  // Delete about content
  static async deleteAboutContent(aboutId: string) {
    try {
      await db.collection("aboutContent").doc(aboutId).delete();
      consoleManager.log("About content deleted:", aboutId);

      // Force refresh the cache after deleting about content
      await this.getAllAboutContent(true);

      return { success: true, message: "About content deleted successfully" };
    } catch (error) {
      consoleManager.error("Error deleting about content:", error);
      throw new Error("Failed to delete about content");
    }
  }

  // Get all active about content (Uses cache)
  static async getAllActiveAboutContent(forceRefresh = true) {
    if (forceRefresh || !this.isAboutInitialized) {
      consoleManager.log("Force refreshing active about content from Firestore...");
      const snapshot = await db
        .collection("aboutContent")
        .where("status", "==", "active")
        .orderBy("createdOn", "desc")
        .get();
      this.aboutContent = snapshot.docs.map((doc: any) =>
        this.convertToAboutType(doc.id, doc.data())
      );
    } else {
      consoleManager.log("Returning cached active about content. No Firestore read.");
    }
    return this.aboutContent;
  }

  // PROCESS STEPS METHODS

  // Get all process steps (Uses cache unless forceRefresh is true)
  static async getAllProcessSteps(forceRefresh = false) {
    if (forceRefresh || !this.isProcessStepsInitialized) {
      consoleManager.log("Force refreshing process steps from Firestore...");
      const snapshot = await db
        .collection("processSteps")
        .orderBy("order", "asc")
        .get();
      this.processSteps = snapshot.docs.map((doc: any) =>
        this.convertToProcessStepType(doc.id, doc.data())
      );
      this.isProcessStepsInitialized = true;
    } else {
      consoleManager.log("Returning cached process steps. No Firestore read.");
    }
    return this.processSteps;
  }

  // Add a new process step with createdOn timestamp
  static async addProcessStep(stepData: any) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const newStepRef = await db.collection("processSteps").add({
        ...stepData,
        status: stepData.status || "active",
        createdOn: timestamp,
        updatedOn: timestamp,
      });

      consoleManager.log("New process step added with ID:", newStepRef.id);

      // Force refresh the cache after adding new process step
      await this.getAllProcessSteps(true);

      return { id: newStepRef.id, ...stepData, createdOn: timestamp, updatedOn: timestamp };
    } catch (error) {
      consoleManager.error("Error adding process step:", error);
      throw new Error("Failed to add process step");
    }
  }

  // Get process step by ID (fetches from cache first)
  static async getProcessStepById(stepId: string) {
    try {
      // Check if process step exists in cache
      const cachedStep = this.processSteps.find((s: any) => s.id === stepId);
      if (cachedStep) {
        consoleManager.log("Process step fetched from cache:", stepId);
        return cachedStep;
      }

      // Fetch from Firestore if not in cache
      const stepRef = db.collection("processSteps").doc(stepId);
      const doc = await stepRef.get();

      if (!doc.exists) {
        consoleManager.warn("Process step not found:", stepId);
        return null;
      }

      consoleManager.log("Process step fetched from Firestore:", stepId);
      return this.convertToProcessStepType(doc.id, doc.data());
    } catch (error) {
      consoleManager.error("❌ Error fetching process step by ID:", error);
      throw new Error("Failed to fetch process step");
    }
  }

  // Update process step with updatedOn timestamp
  static async updateProcessStep(stepId: string, updatedData: any) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const stepRef = db.collection("processSteps").doc(stepId);
      await stepRef.update({
        ...updatedData,
        updatedOn: timestamp,
      });

      consoleManager.log("Process step updated:", stepId);

      // Force refresh the cache after updating process step
      await this.getAllProcessSteps(true);

      return { id: stepId, ...updatedData, updatedOn: timestamp };
    } catch (error) {
      consoleManager.error("Error updating process step:", error);
      throw new Error("Failed to update process step");
    }
  }

  // Delete process step
  static async deleteProcessStep(stepId: string) {
    try {
      await db.collection("processSteps").doc(stepId).delete();
      consoleManager.log("Process step deleted:", stepId);

      // Force refresh the cache after deleting process step
      await this.getAllProcessSteps(true);

      return { success: true, message: "Process step deleted successfully" };
    } catch (error) {
      consoleManager.error("Error deleting process step:", error);
      throw new Error("Failed to delete process step");
    }
  }

  // Get all active process steps (Uses cache)
  static async getAllActiveProcessSteps(forceRefresh = true) {
    if (forceRefresh || !this.isProcessStepsInitialized) {
      consoleManager.log("Force refreshing active process steps from Firestore...");
      const snapshot = await db
        .collection("processSteps")
        .where("status", "==", "active")
        .orderBy("order", "asc")
        .get();
      this.processSteps = snapshot.docs.map((doc: any) =>
        this.convertToProcessStepType(doc.id, doc.data())
      );
    } else {
      consoleManager.log("Returning cached active process steps. No Firestore read.");
    }
    return this.processSteps;
  }

  // Initialize both listeners
  static init() {
    this.initAboutContent();
    this.initProcessSteps();
  }
}

export default AboutService;