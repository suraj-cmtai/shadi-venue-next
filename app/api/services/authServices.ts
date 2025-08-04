import { db } from "../config/firebase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import consoleManager from "../utils/consoleManager";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

class AuthService {
    static async signupUser(email: string, password: string, name: string) {
        try {
            consoleManager.log("🔍 Checking if user exists:", email);

            // Check if user already exists
            const existingUser = await db.collection("users").where("email", "==", email).get();
            if (!existingUser.empty) {
                throw new Error("User already exists with this email.");
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            // Create new user document
            const userData = {
                email,
                password: hashedPassword,
                name,
                role: "user", // Fixed role for signup
                status: "active",
                createdOn: new Date().toISOString(),
                updatedOn: new Date().toISOString()
            };

            const userRef = await db.collection("users").add(userData);

            // Generate JWT token
            const token = jwt.sign(
                { uid: userRef.id, email, role: "user" },
                SECRET_KEY,
                { expiresIn: "7d" }
            );

            consoleManager.log("✅ User created successfully:", userRef.id);
            return {
                token,
                user: {
                    id: userRef.id,
                    email,
                    name,
                    role: "user"
                }
            };

        } catch (error: any) {
            consoleManager.error("❌ Error creating user:", error.message);
            throw new Error(error.message || "Failed to create user");
        }
    }

    static async loginUser(email: string, password: string) {
        try {
            consoleManager.log("🔍 Checking user:", email);

            // Fetch user from Firestore
            const userSnapshot = await db.collection("users").where("email", "==", email).get();

            if (userSnapshot.empty) {
                throw new Error("User not found. Please check your email.");
            }

            const userDoc = userSnapshot.docs[0];
            const userData = userDoc.data();

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, userData.password);
            if (!isPasswordValid) {
                throw new Error("Incorrect password. Please try again.");
            }

            // Check if user is active
            if (userData.status !== "active") {
                throw new Error("Your account is not active. Please contact support.");
            }

            // Generate JWT token
            const token = jwt.sign(
                { uid: userDoc.id, email: userData.email, role: userData.role },
                SECRET_KEY,
                { expiresIn: "7d" }
            );

            consoleManager.log("✅ User logged in successfully:", userDoc.id);
            return {
                token,
                user: {
                    id: userDoc.id,
                    email: userData.email,
                    name: userData.name,
                    role: userData.role
                }
            };

        } catch (error: any) {
            consoleManager.error("❌ Error logging in user:", error.message);
            throw new Error(error.message || "Login failed");
        }
    }

    static async verifyToken(token: string) {
        try {
            const decoded = jwt.verify(token, SECRET_KEY) as { uid: string; email: string; role: string };
            const userDoc = await db.collection("users").doc(decoded.uid).get();
            
            if (!userDoc.exists) {
                throw new Error("User not found");
            }

            const userData = userDoc.data();
            if (userData?.status !== "active") {
                throw new Error("Account is not active");
            }

            return {
                id: userDoc.id,
                email: userData?.email,
                name: userData?.name,
                role: userData?.role
            };

        } catch (error: any) {
            consoleManager.error("❌ Error verifying token:", error.message);
            throw new Error("Invalid or expired token");
        }
    }
}

export default AuthService;
