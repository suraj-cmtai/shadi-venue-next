import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

// Types
export type SubscriberStatus = 'Active' | 'Inactive' | 'Unsubscribed';

export interface Subscriber {
  id: string;
  email: string;
  status: SubscriberStatus;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  lastEmailSent?: Date | null;
}

// Subscriber Services
class SubscriberService {
  static subscribers: Subscriber[] = [];
  static isInitialized = false;

  // Helper method to convert Firestore timestamp to Date
  private static convertTimestamp(timestamp: any): Date {
    if (timestamp && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }
    // Return as is if it's already a Date object, otherwise create a new Date
    return timestamp instanceof Date ? timestamp : new Date(timestamp);
  }
  
  // Get all subscribers (from cache or Firestore)
  static async getAllSubscribers(forceRefresh = false): Promise<Subscriber[]> {
    if (forceRefresh || !this.isInitialized) {
      consoleManager.log("Fetching subscribers from Firestore...");
      try {
        const snapshot = await db
          .collection("subscribers")
          .orderBy("createdAt", "desc")
          .get();

        this.subscribers = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            email: data.email,
            status: data.status,
            source: data.source,
            createdAt: this.convertTimestamp(data.createdAt),
            updatedAt: this.convertTimestamp(data.updatedAt),
            lastEmailSent: data.lastEmailSent ? this.convertTimestamp(data.lastEmailSent) : null,
          } as Subscriber;
        });
        
        this.isInitialized = true;
        consoleManager.log(
          "Firestore Read: Subscribers updated, count:",
          this.subscribers.length
        );

      } catch (error: any) {
        consoleManager.error("Error fetching subscribers:", error);
        throw error;
      }
    } else {
      consoleManager.log("Returning cached subscribers. No Firestore read.");
    }
    return this.subscribers;
  }

  // Add a new subscriber (Create)
  static async addSubscriber(subscriberData: Omit<Subscriber, 'id' | 'createdAt' | 'updatedAt' | 'lastEmailSent'>): Promise<Subscriber> {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const newSubscriberRef = await db.collection("subscribers").add({
        ...subscriberData,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      consoleManager.log("New subscriber added with ID:", newSubscriberRef.id);

      // Refresh the cache to include the new subscriber
      await this.getAllSubscribers(true);
      
      const newSubscriber = await this.getSubscriberById(newSubscriberRef.id);
      return newSubscriber;

    } catch (error: any) {
      consoleManager.error("Error adding new subscriber:", error);
      throw error;
    }
  }

  // Get a subscriber by ID (Read)
  static async getSubscriberById(id: string): Promise<Subscriber> {
    // Ensure the cache is populated if it's the first run
    if (!this.isInitialized) {
        await this.getAllSubscribers();
    }
    
    const subscriber = this.subscribers.find((sub) => sub.id === id);
    if (!subscriber) {
      consoleManager.error(`Subscriber with ID ${id} not found in cache.`);
      throw new Error("Subscriber not found");
    }
    return subscriber;
  }

  // Update a subscriber by ID (Update)
  static async updateSubscriber(id: string, updateData: Partial<Omit<Subscriber, 'id' | 'createdAt'>>): Promise<Partial<Subscriber>> {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const subscriberRef = db.collection("subscribers").doc(id);
      await subscriberRef.update({
        ...updateData,
        updatedAt: timestamp,
      });

      consoleManager.log("Subscriber updated successfully:", id);

      // Force refresh the cache after updating
      await this.getAllSubscribers(true);
    const updatedSubscriber = await this.getSubscriberById(id);
    return updatedSubscriber;

    } catch (error: any) {
      consoleManager.error("Error updating subscriber:", error);
      throw error;
    }
  }

  // Delete a subscriber by ID (Delete)
  static async deleteSubscriber(id: string): Promise<{ id: string }> {
    try {
      const subscriberRef = db.collection("subscribers").doc(id);
      await subscriberRef.delete();

      consoleManager.log("Subscriber deleted successfully:", id);

      // Force refresh the cache after deleting
      await this.getAllSubscribers(true);
      return { id };

    } catch (error: any) {
      consoleManager.error("Error deleting subscriber:", error);
      throw error;
    }
  }
}

export default SubscriberService;