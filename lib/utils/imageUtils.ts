import { adminStorage } from "@/app/api/config/firebase";

// Upload multiple image files to Firebase Storage (App Router version)
export const UploadMultipleImages = async (files: File[]): Promise<string[]> => {
    const bucket = adminStorage.bucket();

    const uploadPromises = files.map((file) => {
        const filePath = `products/${Date.now()}_${file.name}`;
        const firebaseFile = bucket.file(filePath);

        return new Promise<string>((resolve, reject) => {
            const blobStream = firebaseFile.createWriteStream({
                metadata: {
                    contentType: file.type || "application/octet-stream",
                },
            });

            blobStream.on("error", reject);
            blobStream.on("finish", async () => {
                try {
                    const [url] = await firebaseFile.getSignedUrl({
                        action: "read",
                        expires: "03-09-2491",
                    });
                    resolve(url);
                } catch (err) {
                    reject(err);
                }
            });

            // Convert File to stream and pipe to Firebase
            file.stream().pipeTo(new WritableStream({
                write(chunk) {
                    blobStream.write(chunk);
                },
                close() {
                    blobStream.end();
                },
                abort(err) {
                    blobStream.destroy(err);
                }
            })).catch(reject);
        });
    });

    return Promise.all(uploadPromises);
};

// Alternative version using arrayBuffer (more compatible)
export const UploadMultipleImagesBuffer = async (files: File[]): Promise<string[]> => {
    const bucket = adminStorage.bucket();

    const uploadPromises = files.map(async (file) => {
        const filePath = `products/${Date.now()}_${file.name}`;
        const firebaseFile = bucket.file(filePath);
        
        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise<string>((resolve, reject) => {
            const blobStream = firebaseFile.createWriteStream({
                metadata: {
                    contentType: file.type || "application/octet-stream",
                },
            });

            blobStream.on("error", reject);
            blobStream.on("finish", async () => {
                try {
                    const [url] = await firebaseFile.getSignedUrl({
                        action: "read",
                        expires: "03-09-2491",
                    });
                    resolve(url);
                } catch (err) {
                    reject(err);
                }
            });

            blobStream.end(buffer);
        });
    });

    return Promise.all(uploadPromises);
};

// Replace specific images and return the list of retained ones
export const replaceImages = async (
    originalImages: readonly string[],
    imagesToDelete: readonly (string | null | undefined)[]
): Promise<string[]> => {
    const bucket = adminStorage.bucket();
    const retainedImages: string[] = [];

    for (const imageUrl of originalImages) {
        const shouldDelete = imagesToDelete.includes(imageUrl?.trim());

        if (!imageUrl || shouldDelete) {
            try {
                let filePath: string;

                if (imageUrl.includes("/o/")) {
                    filePath = imageUrl.split("/o/")[1].split("?")[0];
                } else if (imageUrl.includes("storage.googleapis.com")) {
                    const urlParts = imageUrl.split("storage.googleapis.com/")[1].split("?")[0];
                    filePath = urlParts.split("/").slice(1).join("/");
                } else {
                    console.warn("Skipping unknown image format:", imageUrl);
                    continue;
                }

                const decodedPath = decodeURIComponent(filePath);
                await bucket.file(decodedPath).delete();
                console.log("🗑️ Deleted from Firebase:", decodedPath);
            } catch (error: any) {
                console.error("⚠️ Error deleting image:", imageUrl, error.message);
            }
        } else {
            retainedImages.push(imageUrl);
        }
    }

    return retainedImages;
};