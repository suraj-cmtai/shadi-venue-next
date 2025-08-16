// lib/firebase-client.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { 
  getStorage, 
  FirebaseStorage, 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  StorageReference,
  UploadTask,
  UploadTaskSnapshot,
  UploadResult
} from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

// Initialize Firebase (avoid multiple initialization)
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const storage: FirebaseStorage = getStorage(app);

// Initialize Analytics (only in browser environment)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Type definitions
type ProgressCallback = (progress: number) => void;

export const uploadImageClient = async (
  file: File, 
  onProgress?: ProgressCallback
): Promise<string> => {
  try {
    // Create file reference
    const fileName = `images/${Date.now()}_${file.name}`;
    const storageRef: StorageReference = ref(storage, fileName);
    
    // Upload original file without resizing - uploadBytes returns UploadResult
    const snapshot: UploadResult = await uploadBytes(storageRef, file, {
      contentType: file.type
    });
    
    const downloadURL: string = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
    
  } catch (error: any) {
    throw new Error(`Error uploading image: ${error.message}`);
  }
};

export const uploadPDFClient = async (
  file: File, 
  onProgress?: ProgressCallback
): Promise<string> => {
  try {
    const fileName = `pdfs/${Date.now()}_${file.name}`;
    const storageRef: StorageReference = ref(storage, fileName);
    
    // uploadBytes returns UploadResult
    const snapshot: UploadResult = await uploadBytes(storageRef, file, {
      contentType: file.type
    });
    
    const downloadURL: string = await getDownloadURL(snapshot.ref);
    return downloadURL;
    
  } catch (error: any) {
    throw new Error(`Error uploading PDF: ${error.message}`);
  }
};

export const replaceImageClient = async (
  file: File | null, 
  oldImageUrl?: string
): Promise<string | null> => {
  try {
    // Delete old image if exists
    if (oldImageUrl) {
      try {
        // Extract file path from URL
        let filePath: string | undefined;
        
        if (oldImageUrl.includes('/o/')) {
          // Handle download URL format
          const url = new URL(oldImageUrl);
          const pathMatch = url.pathname.match(/\/o\/(.+)$/);
          if (pathMatch) {
            filePath = decodeURIComponent(pathMatch[1]);
          }
        } else if (oldImageUrl.includes('storage.googleapis.com')) {
          // Handle other URL formats
          const urlParts = oldImageUrl.split('storage.googleapis.com/')[1].split('?')[0];
          filePath = urlParts.split('/').slice(1).join('/');
        }
        
        if (filePath) {
          const oldFileRef: StorageReference = ref(storage, filePath);
          await deleteObject(oldFileRef);
          console.log('Old image deleted successfully');
        }
      } catch (deleteError: any) {
        console.warn('Failed to delete old image:', deleteError);
        // Don't throw error here, continue with upload
      }
    }
    
    // Upload new image
    if (file) {
      return await uploadImageClient(file);
    }
    
    return null;
  } catch (error: any) {
    throw new Error(`Error replacing image: ${error.message}`);
  }
};

// Upload with progress tracking
export const uploadImageWithProgress = async (
  file: File, 
  onProgress?: ProgressCallback
): Promise<string> => {
  try {
    const fileName = `images/${Date.now()}_${file.name}`;
    const storageRef: StorageReference = ref(storage, fileName);
    
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type
    });
    
    return new Promise<string>((resolve, reject) => {
      uploadTask.on('state_changed', 
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error: any) => reject(error),
        async () => {
          try {
            const downloadURL: string = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error: any) {
            reject(error);
          }
        }
      );
    });
    
  } catch (error: any) {
    throw new Error(`Error uploading image: ${error.message}`);
  }
};

// Upload PDF with progress tracking
export const uploadPDFWithProgress = async (
  file: File, 
  onProgress?: ProgressCallback
): Promise<string> => {
  try {
    const fileName = `pdfs/${Date.now()}_${file.name}`;
    const storageRef: StorageReference = ref(storage, fileName);
    
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type
    });
    
    return new Promise<string>((resolve, reject) => {
      uploadTask.on('state_changed', 
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error: any) => reject(error),
        async () => {
          try {
            const downloadURL: string = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error: any) {
            reject(error);
          }
        }
      );
    });
    
  } catch (error: any) {
    throw new Error(`Error uploading PDF: ${error.message}`);
  }
};

// Export storage and app for other uses
export { storage, app, analytics };