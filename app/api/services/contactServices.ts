import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

export enum ContactStatus {
  NEW = "New",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed"
}

export enum ContactPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High"
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  // Optional wedding inquiry details
  preferredDate?: string;
  locationPreference?: string;
  venueServiceType?: string;
  guests?: number;
  budgetRange?: string;
  contactTimePreference?: string;
  status: ContactStatus;
  priority: ContactPriority;
  createdAt: Date;
  updatedAt: Date;
}

// Contact Services
class ContactService {
  static contacts: Contact[] = [];
  static isInitialized = false;

  // Helper method to convert Firestore timestamp to Date
  private static convertTimestamp(timestamp: any): Date {
    if (timestamp && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }
    return timestamp instanceof Date ? timestamp : new Date(timestamp);
  }

  // Helper method to convert document data to Contact type
  private static convertToType(id: string, data: any): Contact {
    return {
      id,
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      subject: data.subject || "",
      message: data.message || "",
      preferredDate: data.preferredDate || undefined,
      locationPreference: data.locationPreference || undefined,
      venueServiceType: data.venueServiceType || undefined,
      guests: typeof data.guests === 'number' ? data.guests : (data.guests ? Number(data.guests) : undefined),
      budgetRange: data.budgetRange || undefined,
      contactTimePreference: data.contactTimePreference || undefined,
      status: data.status as ContactStatus || ContactStatus.NEW,
      priority: data.priority as ContactPriority || ContactPriority.LOW,
      createdAt: this.convertTimestamp(data.createdAt),
      updatedAt: this.convertTimestamp(data.updatedAt),
    };
  }

  // Initialize Firestore real-time listener
  static initContacts() {
    if (this.isInitialized) return;

    consoleManager.log("Initializing Firestore listener for contacts...");
    const contactsCollection = db.collection("contacts");

    contactsCollection.onSnapshot((snapshot: any) => {
      this.contacts = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
      consoleManager.log(
        "Firestore Read: Contacts updated, count:",
        this.contacts.length
      );
    });

    this.isInitialized = true;
  }

  // Get all contacts
  static async getAllContacts(forceRefresh = false) {
    if (forceRefresh || !this.isInitialized) {
      consoleManager.log("Force refreshing contacts from Firestore...");
      const snapshot = await db
        .collection("contacts")
        .orderBy("createdAt", "desc")
        .get();
      this.contacts = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
      this.isInitialized = true;
    } else {
      consoleManager.log("Returning cached contacts. No Firestore read.");
    }
    return this.contacts;
  }

  // Add a new contact
  static async addContact(contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const newContactRef = await db.collection("contacts").add({
        ...contactData,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      consoleManager.log("New contact added with ID:", newContactRef.id);

      await this.getAllContacts(true);
      const newContact = await this.getContactById(newContactRef.id);
      return newContact;
    } catch (error: any) {
      consoleManager.error("Error adding new contact:", error);
      throw error;
    }
  }

  // Get a contact by ID
  static async getContactById(id: string) {
    try {
      const contact = this.contacts.find((contact) => contact.id === id);
      if (contact) {
        consoleManager.log(`Contact found in cache:`, id);
        return contact;
      }

      const contactDoc = await db.collection("contacts").doc(id).get();
      
      if (!contactDoc.exists) {
        consoleManager.error(`Contact with ID ${id} not found in Firestore.`);
        throw new Error("Contact not found");
      }

      const contactData = this.convertToType(contactDoc.id, contactDoc.data());
      consoleManager.log(`Contact fetched from Firestore:`, id);
      return contactData;
    } catch (error) {
      consoleManager.error(`Error fetching contact ${id}:`, error);
      throw error;
    }
  }

  // Update a contact by ID
  static async updateContact(id: string, updateData: Partial<Contact>) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const contactRef = db.collection("contacts").doc(id);
      await contactRef.update({
        ...updateData,
        updatedAt: timestamp,
      });

      consoleManager.log("Contact updated successfully:", id);
      await this.getAllContacts(true);
      
      const updatedContact = await this.getContactById(id);
      return updatedContact;
    } catch (error: any) {
      consoleManager.error("Error updating contact:", error);
      throw error;
    }
  }

  // Delete a contact by ID
  static async deleteContact(id: string) {
    try {
      const contactRef = db.collection("contacts").doc(id);
      await contactRef.delete();

      consoleManager.log("Contact deleted successfully:", id);
      await this.getAllContacts(true);
      return { id };
    } catch (error: any) {
      consoleManager.error("Error deleting contact:", error);
      throw error;
    }
  }

  // Get contacts by status
  static async getContactsByStatus(status: ContactStatus) {
    return this.contacts.filter(contact => contact.status === status);
  }

  // Get contacts by priority
  static async getContactsByPriority(priority: ContactPriority) {
    return this.contacts.filter(contact => contact.priority === priority);
  }

  // Search contacts
  static async searchContacts(query: string) {
    const searchTerm = query.toLowerCase();
    return this.contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm) ||
      contact.email.toLowerCase().includes(searchTerm) ||
      contact.subject.toLowerCase().includes(searchTerm) ||
      contact.message.toLowerCase().includes(searchTerm)
    );
  }
}

export default ContactService;