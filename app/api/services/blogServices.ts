import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string | null;
  excerpt: string;
  author: string;
  tags: string[];
  image: string | null;
  status: 'draft' | 'published' | 'archived';
  createdOn: Date;
  updatedOn: Date;
  publishedOn?: Date | null;
}

// Blog Services
class BlogService {
  static blogs: Blog[] = [];
  static isInitialized = false;
  // Helper method to convert Firestore timestamp to Date
  private static convertTimestamp(timestamp: any): Date {
    if (timestamp && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }
    return timestamp instanceof Date ? timestamp : new Date(timestamp);
  }

  // Helper method to convert document data to Blog type
  private static convertToType(id: string, data: any): Blog {
    return {
      id,
      title: data.title || "",
      slug: data.slug || "",
      content: data.content || "",
      category: data.category || "",
      excerpt: data.excerpt || "",
      author: data.author || "",
      tags: data.tags || [],
      image: data.image || null,
      status: data.status || "draft",
      createdOn: this.convertTimestamp(data.createdOn),
      updatedOn: this.convertTimestamp(data.updatedOn),
      publishedOn: data.publishedOn ? this.convertTimestamp(data.publishedOn) : null
    };
  }

  // Initialize Firestore real-time listener (runs once)
  static initBlogs() {
    if (this.isInitialized) return;

    consoleManager.log("Initializing Firestore listener for blogs...");
    const blogsCollection = db.collection("blogs");

    blogsCollection.onSnapshot((snapshot: any) => {
      this.blogs = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
      consoleManager.log(
        "Firestore Read: Blogs updated, count:",
        this.blogs.length
      );
    });

    this.isInitialized = true;
  }

  // Get all blogs (Uses cache unless forceRefresh is true)
  static async getAllBlogs(forceRefresh = false) {
    if (forceRefresh || !this.isInitialized) {
      consoleManager.log("Force refreshing blogs from Firestore...");
      const snapshot = await db
        .collection("blogs")
        .orderBy("createdOn", "desc")
        .get();
      this.blogs = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
      this.isInitialized = true;
    } else {
      consoleManager.log("Returning cached blogs. No Firestore read.");
    }
    // console.log(this.blogs)
    return this.blogs;
  }

  // Get all published blogs (Uses cache)
  static async getAllPublishedBlogs(forceRefresh = true) {
    if (forceRefresh || !this.isInitialized) {
      consoleManager.log("Force refreshing published blogs from Firestore...");
      const snapshot = await db
        .collection("blogs")
        .where("status", "==", "published")
        .orderBy("createdOn", "desc")
        .get();
      this.blogs = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
    } else {
      consoleManager.log("Returning cached published blogs. No Firestore read.");
    }
    return this.blogs;
  }


  // Add a new blog
  static async addBlog(blogData: Omit<Blog, 'id' | 'createdOn' | 'updatedOn'>) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const newBlogRef = await db.collection("blogs").add({
        ...blogData,
        createdOn: timestamp,
        updatedOn: timestamp,
      });

      consoleManager.log("New blog added with ID:", newBlogRef.id);

      await this.getAllBlogs(true);
      const newBlog = await this.getBlogById(newBlogRef.id);
      return newBlog;
    } catch (error: any) {
      consoleManager.error("Error adding new blog:", error);
      throw error;
    }
  }

  // Get a blog by ID
  static async getBlogById(id: string) {
    try {
      const blog = this.blogs.find((blog) => blog.id === id);
      if (blog) {
        consoleManager.log(`Blog found in cache:`, id);
        return blog;
      }

      const blogDoc = await db.collection("blogs").doc(id).get();
      
      if (!blogDoc.exists) {
        consoleManager.error(`Blog with ID ${id} not found in Firestore.`);
        throw new Error("Blog not found");
      }

      const blogData = this.convertToType(blogDoc.id, blogDoc.data());
      consoleManager.log(`Blog fetched from Firestore:`, id);
      return blogData;
    } catch (error) {
      consoleManager.error(`Error fetching blog ${id}:`, error);
      throw error;
    }
  }

  // Update a blog by ID
  static async updateBlog(id: string, updateData: Partial<Blog>) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const blogRef = db.collection("blogs").doc(id);
      await blogRef.update({
        ...updateData,
        updatedOn: timestamp,
      });

      consoleManager.log("Blog updated successfully:", id);
      await this.getAllBlogs(true);
      
      const updatedBlog = await this.getBlogById(id);
      return updatedBlog;
    } catch (error: any) {
      consoleManager.error("Error updating blog:", error);
      throw error;
    }
  }

  // Delete a blog by ID
  static async deleteBlog(id: string) {
    try {
      const blogRef = db.collection("blogs").doc(id);
      await blogRef.delete();

      consoleManager.log("Blog deleted successfully:", id);
      await this.getAllBlogs(true);
      return { id };
    } catch (error: any) {
      consoleManager.error("Error deleting blog:", error);
      throw error;
    }
  }

  // Get blog by slug
  static async getBlogBySlug(slug: string) {
    try {

      const snapshot = await db
        .collection("blogs")
        .where("slug", "==", slug)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      const blogData = this.convertToType(doc.id, doc.data());
      consoleManager.log(`Blog fetched from Firestore by slug:`, slug);
      return blogData;
    } catch (error) {
      consoleManager.error(`Error fetching blog by slug ${slug}:`, error);
      return null;
    }
  }

  // Get published blogs
  static async getPublishedBlogs() {
    return this.blogs.filter(blog => blog.status === 'published');
  }

  // Search blogs
  static async searchBlogs(query: string) {
    const searchTerm = query.toLowerCase();
    return this.blogs.filter(blog => 
      blog.title.toLowerCase().includes(searchTerm) ||
      blog.content.toLowerCase().includes(searchTerm) ||
      blog.excerpt.toLowerCase().includes(searchTerm) ||
      blog.author.toLowerCase().includes(searchTerm) ||
      blog.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }
}

export default BlogService;