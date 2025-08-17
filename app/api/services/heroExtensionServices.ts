import { db } from "../config/firebase";
import admin from "firebase-admin";
import { HeroExtensionImage, HeroExtensionContent, ImageType } from "@/lib/redux/features/heroExtensionSlice";

/**
 * HeroExtensionService manages hero extension images and content for the home page.
 * It provides CRUD operations and uses a Firestore real-time listener for cache.
 * Uses the 'hero-extension' collection.
 */
class HeroExtensionService {
  static images: HeroExtensionImage[] = [];
  static content: HeroExtensionContent | null = null;
  static imagesListener: (() => void) | null = null;
  static contentListener: (() => void) | null = null;

  /**
   * Initializes Firestore listeners for hero extension images and content.
   * Keeps the cache up-to-date in memory.
   */
  static initializeListeners() {
    // Images listener
    if (!this.imagesListener) {
      this.imagesListener = db.collection("hero-extension")
        .where("type", "!=", "content")
        .onSnapshot((snapshot: admin.firestore.QuerySnapshot) => {
          this.images = snapshot.docs.map(doc => doc.data() as HeroExtensionImage);
        });
    }
    // Content listener
    if (!this.contentListener) {
      this.contentListener = db.collection("hero-extension")
        .where("type", "==", "content")
        .limit(1)
        .onSnapshot((snapshot: admin.firestore.QuerySnapshot) => {
          if (!snapshot.empty) {
            this.content = snapshot.docs[0].data() as HeroExtensionContent;
          } else {
            this.content = null;
          }
        });
    }
  }

  // IMAGE MANAGEMENT

  /**
   * Returns all hero extension images, sorted by createdOn descending.
   */
  static async getAllImages(): Promise<HeroExtensionImage[]> {
    this.initializeListeners();
    if (this.images.length === 0) {
      // Fallback: fetch from Firestore if cache is empty
      const snapshot = await db.collection("hero-extension")
        .where("type", "!=", "content")
        .get();
      this.images = snapshot.docs.map(doc => doc.data() as HeroExtensionImage);
    }
    return this.images
      .slice()
      .sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());
  }

  /**
   * Returns all active hero extension images, sorted by order ascending.
   */
  static async getActiveImages(): Promise<HeroExtensionImage[]> {
    this.initializeListeners();
    if (this.images.length === 0) await this.getAllImages();
    return this.images
      .filter(image => image.status === "active")
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Returns all images of a given type, sorted by order ascending.
   */
  static async getImagesByType(type: ImageType): Promise<HeroExtensionImage[]> {
    this.initializeListeners();
    if (this.images.length === 0) await this.getAllImages();
    return this.images
      .filter(image => image.type === type)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Returns all active images of a given type, sorted by order ascending.
   */
  static async getActiveImagesByType(type: ImageType): Promise<HeroExtensionImage[]> {
    this.initializeListeners();
    if (this.images.length === 0) await this.getAllImages();
    return this.images
      .filter(image => image.type === type && image.status === "active")
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Returns a single image by its ID.
   */
  static async getImageById(id: string): Promise<HeroExtensionImage | null> {
    this.initializeListeners();
    // Try cache first
    const cached = this.images.find(image => image.id === id);
    if (cached) return cached;
    // Fallback: fetch from Firestore
    const doc = await db.collection("hero-extension").doc(id).get();
    return doc.exists ? (doc.data() as HeroExtensionImage) : null;
  }

  /**
   * Creates a new hero extension image.
   */
  static async createImage(
    imageData: Omit<HeroExtensionImage, "id" | "createdOn" | "updatedOn">
  ): Promise<HeroExtensionImage> {
    const now = new Date().toISOString();
    const newDoc = db.collection("hero-extension").doc();
    const newImage: HeroExtensionImage = {
      ...imageData,
      id: newDoc.id,
      createdOn: now,
      updatedOn: now,
    };
    await newDoc.set(newImage);
    this.images.push(newImage);
    return newImage;
  }

  /**
   * Updates an existing hero extension image by ID.
   */
  static async updateImage(
    id: string,
    imageData: Partial<HeroExtensionImage>
  ): Promise<HeroExtensionImage> {
    const docRef = db.collection("hero-extension").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error("Hero extension image not found");
    const prev = doc.data() as HeroExtensionImage;
    const updated: HeroExtensionImage = {
      ...prev,
      ...imageData,
      updatedOn: new Date().toISOString(),
    };
    await docRef.set(updated, { merge: true });
    // Update cache
    const idx = this.images.findIndex(img => img.id === id);
    if (idx !== -1) this.images[idx] = updated;
    return updated;
  }

  /**
   * Deletes a hero extension image by ID.
   */
  static async deleteImage(id: string): Promise<{ success: boolean; message: string }> {
    const docRef = db.collection("hero-extension").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error("Hero extension image not found");
    await docRef.delete();
    this.images = this.images.filter(img => img.id !== id);
    return { success: true, message: "Hero extension image deleted successfully" };
  }

  /**
   * Updates the order of a hero extension image.
   */
  static async updateImageOrder(imageId: string, newOrder: number): Promise<HeroExtensionImage> {
    return this.updateImage(imageId, { order: newOrder });
  }

  // CONTENT MANAGEMENT

  /**
   * Returns the hero extension content (single document).
   */
  static async getContent(): Promise<HeroExtensionContent | null> {
    this.initializeListeners();
    if (this.content) return this.content;
    // Fallback: fetch from Firestore
    const snapshot = await db
      .collection("hero-extension")
      .where("type", "==", "content")
      .limit(1)
      .get();
    if (!snapshot.empty) {
      this.content = snapshot.docs[0].data() as HeroExtensionContent;
      return this.content;
    }
    return null;
  }

  /**
   * Creates new hero extension content.
   */
  static async createContent(
    contentData: Omit<HeroExtensionContent, "id" | "createdOn" | "updatedOn">
  ): Promise<HeroExtensionContent> {
    const now = new Date().toISOString();
    const newDoc = db.collection("hero-extension").doc();
    const newContent: HeroExtensionContent = {
      ...contentData,
      id: newDoc.id,
      createdOn: now,
      updatedOn: now,
    };
    await newDoc.set(newContent);
    this.content = newContent;
    return newContent;
  }

  /**
   * Updates the hero extension content by ID.
   */
  static async updateContent(
    id: string,
    contentData: Partial<HeroExtensionContent>
  ): Promise<HeroExtensionContent> {
    const docRef = db.collection("hero-extension").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error("Hero extension content not found");
    const prev = doc.data() as HeroExtensionContent;
    const updated: HeroExtensionContent = {
      ...prev,
      ...contentData,
      updatedOn: new Date().toISOString(),
    };
    await docRef.set(updated, { merge: true });
    this.content = updated;
    return updated;
  }

  /**
   * Upserts (creates or updates) the hero extension content.
   */
  static async upsertContent(
    contentData: Omit<HeroExtensionContent, "id" | "createdOn" | "updatedOn">
  ): Promise<HeroExtensionContent> {
    // Try to find existing content
    const snapshot = await db
      .collection("hero-extension")
      .where("type", "==", "content")
      .limit(1)
      .get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return this.updateContent(doc.id, contentData);
    } else {
      return this.createContent(contentData);
    }
  }

  // UTILITY METHODS

  /**
   * Returns a random active image for a given type.
   */
  static async getRandomImageByType(type: ImageType): Promise<HeroExtensionImage | null> {
    const images = await this.getActiveImagesByType(type);
    if (images.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  }

  /**
   * Returns a count of active images for each type.
   */
  static async getImageTypeCounts(): Promise<{ [key in ImageType]: number }> {
    const images = await this.getActiveImages();
    const counts: { [key in ImageType]: number } = {
      tall_left: 0,
      main_center: 0,
      bottom_left: 0,
      center_bottom: 0,
      top_right: 0,
      far_right: 0,
    };
    images.forEach(image => {
      counts[image.type]++;
    });
    return counts;
  }
}

export default HeroExtensionService;