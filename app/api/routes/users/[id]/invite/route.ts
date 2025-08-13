import { NextResponse } from "next/server";
import UserService, { Theme, AboutSection, InviteSection, Person, Social, Invite } from "@/app/api/services/userServices";
import consoleManager from "@/app/api/utils/consoleManager";
import { UploadImage } from "@/app/api/controller/imageController";

// Update invite data
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const formData = await req.formData();
        const { id } = await params;

        // Handle basic invite data
        const isEnabled = formData.get("isEnabled") === "true";
        
        // Handle theme data
        const theme: Theme = {
            primaryColor: formData.get("primaryColor")?.toString() || "",
            secondaryColor: formData.get("secondaryColor")?.toString() || "",
            titleColor: formData.get("titleColor")?.toString() || "",
            nameColor: formData.get("nameColor")?.toString() || "",
            backgroundColor: formData.get("backgroundColor")?.toString() || "",
            textColor: formData.get("textColor")?.toString() || ""
        };

        // Create theme object
        // const theme: Theme = {
        //     primaryColor: formData.get("primaryColor")?.toString() || "",
        //     secondaryColor: formData.get("secondaryColor")?.toString() || "",
        //     titleColor: formData.get("titleColor")?.toString() || "",
        //     nameColor: formData.get("nameColor")?.toString() || "",
        //     backgroundColor: formData.get("backgroundColor")?.toString() || "",
        //     textColor: formData.get("textColor")?.toString() || ""
        // };

        // Create social objects
        const groomSocials: Social = {
            instagram: formData.get("groomInstagram")?.toString(),
            facebook: formData.get("groomFacebook")?.toString(),
            twitter: formData.get("groomTwitter")?.toString()
        };

        const brideSocials: Social = {
            instagram: formData.get("brideInstagram")?.toString(),
            facebook: formData.get("brideFacebook")?.toString(),
            twitter: formData.get("brideTwitter")?.toString()
        };

        // Process images
        const groomImageFile = formData.get("groomImage");
        const brideImageFile = formData.get("brideImage");
        const coupleImageFile = formData.get("coupleImage");
        const backgroundImageFile = formData.get("backgroundImage");

        // Handle image uploads
        let groomImageUrl: string | null = null;
        if (groomImageFile && groomImageFile instanceof File) {
            const uploadedUrl = await UploadImage(groomImageFile, 800, 800);
            if (typeof uploadedUrl === 'string') {
                groomImageUrl = uploadedUrl;
                consoleManager.log("Groom image uploaded:", groomImageUrl);
            }
        } else {
            groomImageUrl = formData.get("groomImageUrl")?.toString() || null;
        }

        let brideImageUrl: string | null = null;
        if (brideImageFile && brideImageFile instanceof File) {
            const uploadedUrl = await UploadImage(brideImageFile, 800, 800);
            if (typeof uploadedUrl === 'string') {
                brideImageUrl = uploadedUrl;
                consoleManager.log("Bride image uploaded:", brideImageUrl);
            }
        } else {
            brideImageUrl = formData.get("brideImageUrl")?.toString() || null;
        }

        let coupleImageUrl: string | null = null;
        if (coupleImageFile && coupleImageFile instanceof File) {
            const uploadedUrl = await UploadImage(coupleImageFile, 1200, 800);
            if (typeof uploadedUrl === 'string') {
                coupleImageUrl = uploadedUrl;
                consoleManager.log("Couple image uploaded:", coupleImageUrl);
            }
        } else {
            coupleImageUrl = formData.get("coupleImageUrl")?.toString() || null;
        }

        let backgroundImageUrl: string | null = null;
        if (backgroundImageFile && backgroundImageFile instanceof File) {
            const uploadedUrl = await UploadImage(backgroundImageFile, 1920, 1080);
            if (typeof uploadedUrl === 'string') {
                backgroundImageUrl = uploadedUrl;
                consoleManager.log("Background image uploaded:", backgroundImageUrl);
            }
        } else {
            backgroundImageUrl = formData.get("backgroundImageUrl")?.toString() || null;
        }

        // Create about section with persons
        const about: AboutSection = {
            title: formData.get("aboutTitle")?.toString() || "",
            subtitle: formData.get("aboutSubtitle")?.toString() || "",
            groom: {
                name: formData.get("groomName")?.toString() || "",
                description: formData.get("groomDescription")?.toString() || "",
                image: groomImageUrl,
                socials: groomSocials
            },
            bride: {
                name: formData.get("brideName")?.toString() || "",
                description: formData.get("brideDescription")?.toString() || "",
                image: brideImageUrl,
                socials: brideSocials
            },
            coupleImage: coupleImageUrl
        };

        // Handle invitation section
        const invitation = {
            heading: formData.get("inviteHeading")?.toString() || "",
            subheading: formData.get("inviteSubheading")?.toString() || "",
            message: formData.get("inviteMessage")?.toString() || "",
            rsvpLink: formData.get("rsvpLink")?.toString() || null,
            backgroundImage: backgroundImageUrl
        };

        const inviteData = {
            isEnabled,
            theme,
            about,
            invitation
        };
        
        const updatedUser = await UserService.updateInvite(id, inviteData);

        return NextResponse.json({
            statusCode: 200,
            message: "Invite updated successfully",
            data: updatedUser,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error updating invite:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}