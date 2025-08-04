import sharp from "sharp";
import { adminStorage } from "../config/firebase";

const UploadImage = async (file: any, width: number, height: number) => {
  try {
    const arrayBuffer = await file.arrayBuffer(); // Convert Blob to ArrayBuffer
    const buffer = Buffer.from(arrayBuffer); // Convert to Buffer

    const bucket = adminStorage.bucket();
    const filePath = `images/${Date.now()}_${file.name}`; // Generate unique file path
    const firebaseFile = bucket.file(filePath);

    // Convert width & height to numbers
    const imgWidth = parseInt(width.toString());
    const imgHeight = parseInt(height.toString());

    // Resize image using sharp
    const resizedBuffer = await sharp(buffer)
      .resize(imgWidth, imgHeight, { fit: sharp.fit.cover })
      .toBuffer();

    const blobStream = firebaseFile.createWriteStream({
      metadata: { contentType: file.type },
    });

    return new Promise((resolve, reject) => {
      blobStream.on("error", reject);
      blobStream.on("finish", async () => {
        const [url] = await firebaseFile.getSignedUrl({ action: "read", expires: "03-09-2491" });
        resolve(url);
      });
      blobStream.end(resizedBuffer);
    });
  } catch (error: any) {
    throw new Error("Error uploading image: " + error.message);
  }
};

const ReplaceImage = async (file: any, oldImageUrl: string, width: number, height: number) => {
  try {
    const bucket = adminStorage.bucket();

    // Delete old image if exists
    if (oldImageUrl) {
      try {
        // console.log("Old Image URL:", oldImageUrl); // Debugging

        let oldFilePath;
        if (oldImageUrl.includes("/o/")) {
          // Handle public URL format
          oldFilePath = oldImageUrl.split("/o/")[1].split("?")[0];
        } else if (oldImageUrl.includes("storage.googleapis.com")) {
          // Handle signed URL format
          const urlParts = oldImageUrl.split("storage.googleapis.com/")[1].split("?")[0];
          // Remove the bucket name from the file path
          oldFilePath = urlParts.split("/").slice(1).join("/");
        } else {
          throw new Error("Invalid old image URL format");
        }

        const decodedOldFilePath = decodeURIComponent(oldFilePath);
        
        // Delete the old image
        await bucket.file(decodedOldFilePath).delete();
        // console.log("Old image deleted:", decodedOldFilePath);
      } catch (deleteError: any) {
        console.warn("Failed to delete old image:", deleteError.message);
        throw new Error("Failed to delete old image: " + deleteError.message);
      }
    }

    // Upload new image if provided
    if (file) {
      return await UploadImage(file, width, height);
    } else {
      return null; // Return null if no new image is provided
    }
  } catch (error: any) {
    throw new Error("Error replacing image: " + error.message);
  }
};

export { UploadImage, ReplaceImage };