import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

/**
 * HeroService manages hero slides for the home page.
 * It provides CRUD operations and uses a Firestore real-time listener for cache.
 */
class HeroService {
  static heroSlides: any[] = [];
  static isInitialized = false;

  // Initialize Firestore real-time listener (runs once)
  static initHeroSlides() {
    if (this.isInitialized) return;

    consoleManager.log("Initializing Firestore listener for hero slides...");
    const heroCollection = db.collection("heroSlides");

    heroCollection.onSnapshot((snapshot: any) => {
      this.heroSlides = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      consoleManager.log(
        "Firestore Read: Hero slides updated, count:",
        this.heroSlides.length
      );
    });

    this.isInitialized = true;
  }

  private static convertTimestamp(timestamp: any): Date {
    if (timestamp && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }
    return timestamp instanceof Date ? timestamp : new Date(timestamp);
  }

  private static convertToType(id: string, data: any): any {
    return {
      id,
      image: data.image || "",
      heading: data.heading || "",
      subtext: data.subtext || "",
      cta: data.cta || "",
      status: data.status || "active",
      createdOn: this.convertTimestamp(data.createdOn),
      updatedOn: this.convertTimestamp(data.updatedOn),
    };
  }

  // Get all hero slides (Uses cache unless forceRefresh is true)
  static async getAllHeroSlides(forceRefresh = false) {
    if (forceRefresh || !this.isInitialized) {
      consoleManager.log("Force refreshing hero slides from Firestore...");
      const snapshot = await db
        .collection("heroSlides")
        .orderBy("createdOn", "desc")
        .get();
      this.heroSlides = snapshot.docs.map((doc: any) =>
        this.convertToType(doc.id, doc.data())
      );
      this.isInitialized = true;
    } else {
      consoleManager.log("Returning cached hero slides. No Firestore read.");
    }
    return this.heroSlides;
  }

  // Add a new hero slide with createdOn timestamp
  static async addHeroSlide(heroData: any) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const newHeroRef = await db.collection("heroSlides").add({
        ...heroData,
        status: heroData.status || "active",
        createdOn: timestamp,
      });

      consoleManager.log("New hero slide added with ID:", newHeroRef.id);

      // Force refresh the cache after adding a new hero slide
      await this.getAllHeroSlides(true);

      return { id: newHeroRef.id, ...heroData, createdOn: timestamp };
    } catch (error) {
      consoleManager.error("Error adding hero slide:", error);
      throw new Error("Failed to add hero slide");
    }
  }

  // Get hero slide by ID (fetches from cache first)
  static async getHeroSlideById(heroId: string) {
    try {
      // Check if hero slide exists in cache
      const cachedHero = this.heroSlides.find((h: any) => h.id === heroId);
      if (cachedHero) {
        consoleManager.log("Hero slide fetched from cache:", heroId);
        return cachedHero;
      }

      // Fetch from Firestore if not in cache
      const heroRef = db.collection("heroSlides").doc(heroId);
      const doc = await heroRef.get();

      if (!doc.exists) {
        consoleManager.warn("Hero slide not found:", heroId);
        return null;
      }

      consoleManager.log("Hero slide fetched from Firestore:", heroId);
      return this.convertToType(doc.id, doc.data());
    } catch (error) {
      consoleManager.error("❌ Error fetching hero slide by ID:", error);
      throw new Error("Failed to fetch hero slide");
    }
  }

  // Update hero slide with updatedOn timestamp
  static async updateHeroSlide(heroId: string, updatedData: any) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const heroRef = db.collection("heroSlides").doc(heroId);
      await heroRef.update({
        ...updatedData,
        updatedOn: timestamp,
      });

      consoleManager.log("Hero slide updated:", heroId);

      // Force refresh the cache after updating a hero slide
      await this.getAllHeroSlides(true);

      return { id: heroId, ...updatedData, updatedOn: timestamp };
    } catch (error) {
      consoleManager.error("Error updating hero slide:", error);
      throw new Error("Failed to update hero slide");
    }
  }

  // Delete hero slide
  static async deleteHeroSlide(heroId: string) {
    try {
      await db.collection("heroSlides").doc(heroId).delete();
      consoleManager.log("Hero slide deleted:", heroId);

      // Force refresh the cache after deleting a hero slide
      await this.getAllHeroSlides(true);

      return { success: true, message: "Hero slide deleted successfully" };
    } catch (error) {
      consoleManager.error("Error deleting hero slide:", error);
      throw new Error("Failed to delete hero slide");
    }
  }

  // Get all active hero slides (Uses cache)
  static async getAllActiveHeroSlides(forceRefresh = true) {
    if (forceRefresh || !this.isInitialized) {
      consoleManager.log("Force refreshing active hero slides from Firestore...");
      const snapshot = await db
        .collection("heroSlides")
        .where("status", "==", "active")
        .orderBy("createdOn", "desc")
        .get();
      this.heroSlides = snapshot.docs.map((doc: any) =>
        this.convertToType(doc.id, doc.data())
      );
    } else {
      consoleManager.log("Returning cached active hero slides. No Firestore read.");
    }
    return this.heroSlides;
  }
}

export default HeroService;
