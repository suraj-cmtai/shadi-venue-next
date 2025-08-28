import { db } from "../config/firebase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import consoleManager from "../utils/consoleManager";
import { UserRole } from "./userServices";
import { Hotel } from "./hotelServices";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

// Helper: get collection name for role
function getRoleCollection(role: UserRole) {
    switch (role) {
        case "user":
            return "users";
        case "hotel":
            return "hotels";
        case "vendor":
            return "vendors";
        case "blog":
            return "blog";
        case "marketing":
            return "marketing";
        case "admin":
        case "super-admin":
            return "admins";
        default:
            throw new Error("Invalid role");
    }
}

class AuthService {
    /**
     * Signup a new user, hotel, or vendor.
     * - Creates an entry in the "auth" collection (with status "inactive")
     * - Creates a corresponding entry in the role's collection (users, hotels, vendors)
     * - Sets the role-specific id in the auth document
     * @param email
     * @param password
     * @param name
     * @param role
     */
    static async signupUser(email: string, password: string, name: string, role: UserRole) {
        try {
            consoleManager.log("🔍 Checking if user exists in auth:", email);

            // Check if user already exists in auth collection
            const existingAuth = await db.collection("auth").where("email", "==", email).get();
            if (!existingAuth.empty) {
                throw new Error("User already exists with this email.");
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            // Prepare base auth data
            const authData: any = {
                email,
                password: hashedPassword,
                name,
                role,
                status: "inactive", // Always inactive on signup
                createdOn: new Date().toISOString(),
                updatedOn: new Date().toISOString(),
            };

            // Create role-specific entry
            let roleDocRef;
            let roleDocId: string;
            let roleDocData: any = {
                name,
                email,
                role,
                status: "inactive",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Add more fields for hotel/vendor/blog/marketing if needed
            if (role === "hotel") {
                // Minimal hotel doc, can be expanded later
                roleDocData = {
                    ...roleDocData,
                    category: "",
                    location: {
                        address: "",
                        city: "",
                        state: "",
                        country: "",
                        zipCode: "",
                    },
                    priceRange: {
                        startingPrice: 0,
                        currency: "INR",
                    },
                    rating: 0,
                    description: "",
                    amenities: [],
                    rooms: [],
                    images: [],
                    contactInfo: {
                        phone: "",
                        email,
                        website: "",
                    },
                    policies: {
                        checkIn: "",
                        checkOut: "",
                        cancellation: "",
                    },
                };
            } else if (role === "vendor") {
                // Minimal vendor doc, can be expanded later
                roleDocData = {
                    ...roleDocData,
                    company: "",
                    services: [],
                    address: {
                        street: "",
                        city: "",
                        state: "",
                        country: "",
                        zipCode: "",
                    },
                    phoneNumber: "",
                    avatar: "",
                };
            } else if (role === "blog") {
                // Minimal blog doc, can be expanded later
                roleDocData = {
                    ...roleDocData,
                    description: "",
                    posts: [],
                };
            } else if (role === "marketing") {
                // Minimal marketing doc, can be expanded later
                roleDocData = {
                    ...roleDocData,
                    campaigns: [],
                    description: "",
                };
            }

            // Create the role-specific document
            const roleCollection = getRoleCollection(role);
            roleDocRef = await db.collection(roleCollection).add(roleDocData);
            roleDocId = roleDocRef.id;

            // Add the role-specific id to authData
            authData[`${role}Id`] = roleDocId;
            // Also add a generic roleId for easier access
            authData["roleId"] = roleDocId;

            // Create the auth document
            const authRef = await db.collection("auth").add(authData);

            // Generate JWT token (but user is inactive, so up to you if you want to allow login)
            const token = jwt.sign(
                { uid: authRef.id, email, role, roleId: roleDocId },
                SECRET_KEY,
                { expiresIn: "7d" }
            );

            consoleManager.log(`✅ ${role} created successfully:`, authRef.id, "Role doc:", roleDocId);

            return {
                token,
                user: {
                    id: authRef.id,
                    email,
                    name,
                    role,
                    roleId: roleDocId,
                }
            };

        } catch (error: any) {
            consoleManager.error("❌ Error creating user:", error.message);
            throw new Error(error.message || "Failed to create user");
        }
    }

    /**
     * Login user by email and password.
     * - Checks in-memory users for admin/super-admin/vendor/user
     * - Otherwise, checks "auth" collection
     * - Only allows login if status is "active"
     */
    static async loginUser(email: string, password: string) {
        try {
            consoleManager.log("🔍 Checking user:", email);

            // In-memory users array for role checking (for login only)
            const users = [
                {
                    name: "Admin User",
                    email: "admin@example.com",
                    password: "admin123",
                    role: "admin",
                },
                {
                    name: "Super Admin",
                    email: "superadmin@example.com",
                    password: "superadmin123",
                    role: "super-admin",
                },
                
                {
                    name: "Regular User",
                    email: "user@example.com",
                    password: "user123",
                    role: "user",
                },
                {
                    name: "Hotel Manager",
                    email: "hotel@example.com",
                    password:"hotel123",
                    role: "hotel",
                }
                // Add more users as needed
            ];

            // First, check in-memory users array
            const inMemoryUser = users.find(
                (user) => user.email === email && user.password === password
            );

            if (inMemoryUser) {
                // Generate JWT token for in-memory user
                const token = jwt.sign(
                    { uid: inMemoryUser.email, email: inMemoryUser.email, role: inMemoryUser.role },
                    SECRET_KEY,
                    { expiresIn: "7d" }
                );

                consoleManager.log("✅ In-memory user logged in successfully:", inMemoryUser.email);
                return {
                    token,
                    user: {
                        id: inMemoryUser.email,
                        email: inMemoryUser.email,
                        name: inMemoryUser.name,
                        role: inMemoryUser.role,
                        // In-memory users do not have a roleId, so omit it
                    }
                };
            }

            // If not found in in-memory users, check Firestore "auth" collection
            const authSnapshot = await db.collection("auth").where("email", "==", email).get();

            if (authSnapshot.empty) {
                throw new Error("User not found. Please check your email.");
            }

            const authDoc = authSnapshot.docs[0];
            const authData = authDoc.data();

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, authData.password);
            if (!isPasswordValid) {
                throw new Error("Incorrect password. Please try again.");
            }

            // Check if user is active
            if (authData.status !== "active") {
                throw new Error("Your account is not active. Please contact support.");
            }

            // Determine the roleId (userId, hotelId, vendorId) if present
            let roleId: string | undefined = undefined;
            if (authData.userId) {
                roleId = authData.userId;
            } else if (authData.hotelId) {
                roleId = authData.hotelId;
            } else if (authData.vendorId) {
                roleId = authData.vendorId;
            } else if (authData.roleId) {
                // fallback if roleId is present
                roleId = authData.roleId;
            }

            // Generate JWT token
            const token = jwt.sign(
                { uid: authDoc.id, email: authData.email, role: authData.role, ...(roleId && { roleId }) },
                SECRET_KEY,
                { expiresIn: "7d" }
            );

            consoleManager.log("✅ User logged in successfully:", authDoc.id);
            return {
                token,
                user: {
                    id: authDoc.id,
                    email: authData.email,
                    name: authData.name,
                    role: authData.role,
                    status: authData.status,
                    ...(roleId && { roleId }),
                    ...(authData.userId && { userId: authData.userId }),
                    ...(authData.hotelId && { hotelId: authData.hotelId }),
                    ...(authData.vendorId && { vendorId: authData.vendorId }),
                }
            };

        } catch (error: any) {
            consoleManager.error("❌ Error logging in user:", error.message);
            throw new Error(error.message || "Login failed");
        }
    }

    /**
     * Verify JWT token and return user info from "auth" collection.
     */
    static async verifyToken(token: string) {
        try {
            const decoded = jwt.verify(token, SECRET_KEY) as { uid: string; email: string; role: string };
            const authDoc = await db.collection("auth").doc(decoded.uid).get();

            if (!authDoc.exists) {
                throw new Error("User not found");
            }

            const authData = authDoc.data();
            if (authData?.status !== "active") {
                throw new Error("Account is not active");
            }

            return {
                id: authDoc.id,
                email: authData?.email,
                name: authData?.name,
                role: authData?.role,
                status: authData?.status,
                ...(authData?.userId && { userId: authData.userId }),
                ...(authData?.hotelId && { hotelId: authData.hotelId }),
                ...(authData?.vendorId && { vendorId: authData.vendorId }),
            };

        } catch (error: any) {
            consoleManager.error("❌ Error verifying token:", error.message);
            throw new Error("Invalid or expired token");
        }
    }
}

export default AuthService;
