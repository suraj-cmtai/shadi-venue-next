import { NextRequest, NextResponse } from "next/server";
import { UploadMultipleImagesBuffer } from "@/lib/utils/imageUtils";
import WeddingService from "@/app/api/services/inviteService"; 
import { WeddingState } from "@/lib/redux/features/inviteSlice";

// Helper to extract string safely from FormData
const getString = (formData: FormData, key: string): string => {
    const val = formData.get(key);
    return typeof val === "string" ? val : "";
};

// Helper to get File from FormData
const getFile = (formData: FormData, key: string): File | null => {
    const val = formData.get(key);
    return val instanceof File ? val : null;
};

export async function GET() {
    try {
        const data = await WeddingService.getWeddingData();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch wedding data" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // Collect files to upload
        const imageKeys = [
            "invite.leftImage",
            "invite.rightImage", 
            "about.groom.image",
            "about.bride.image",
            "about.coupleImage",
            "weddingDay.images.0",
            "weddingDay.images.1", 
            "weddingDay.images.2",
            "rsvp.backgroundImage",
            "footer.backgroundImage",
        ];

        const imageFiles: File[] = [];

        for (const key of imageKeys) {
            const file = getFile(formData, key);
            if (file) {
                imageFiles.push(file);
            }
        }

        const uploadedUrls = await UploadMultipleImagesBuffer(imageFiles);
        let index = 0;

        // Get user-selected color and apply it to all theme fields
        const selectedColor = getString(formData, "theme.color");

        const weddingData: WeddingState = {
            theme: {
                titleColor: selectedColor,
                nameColor: selectedColor,
                buttonColor: selectedColor,
                buttonHoverColor: selectedColor,
            },
            invite: {
                leftImage: uploadedUrls[index++],
                rightImage: uploadedUrls[index++],
                title: getString(formData, "invite.title"),
                names: getString(formData, "invite.names"),
                linkHref: getString(formData, "invite.linkHref"),
                linkText: getString(formData, "invite.linkText"),
            },
            about: {
                subtitle: getString(formData, "about.subtitle"),
                title: getString(formData, "about.title"),
                groom: {
                    name: getString(formData, "about.groom.name"),
                    description: getString(formData, "about.groom.description"),
                    image: uploadedUrls[index++],
                    socials: JSON.parse(getString(formData, "about.groom.socials") || "[]"),
                },
                bride: {
                    name: getString(formData, "about.bride.name"),
                    description: getString(formData, "about.bride.description"),
                    image: uploadedUrls[index++],
                    socials: JSON.parse(getString(formData, "about.bride.socials") || "[]"),
                },
                coupleImage: uploadedUrls[index++],
            },
            weddingDay: {
                backgroundColor: getString(formData, "weddingDay.backgroundColor"),
                headingTop: getString(formData, "weddingDay.headingTop"),
                headingMain: getString(formData, "weddingDay.headingMain"),
                date: getString(formData, "weddingDay.date"),
                images: [
                    uploadedUrls[index++],
                    uploadedUrls[index++],
                    uploadedUrls[index++],
                ],
            },
            loveStory: {
                sectionTitle: getString(formData, "loveStory.sectionTitle"),
                sectionSubtitle: getString(formData, "loveStory.sectionSubtitle"),
                stories: JSON.parse(getString(formData, "loveStory.stories") || "[]"),
            },
            planning: JSON.parse(getString(formData, "planning") || "{}"),
            rsvp: {
                backgroundImage: uploadedUrls[index++],
            },
            footer: {
                backgroundImage: uploadedUrls[index++],
                coupleNames: getString(formData, "footer.coupleNames"),
                subtitle: getString(formData, "footer.subtitle"),
                socials: JSON.parse(getString(formData, "footer.socials") || "[]"),
            },
        };

        const saved = await WeddingService.createWeddingData(weddingData);
        return NextResponse.json(saved, { status: 201 });
    } catch (error) {
        console.error("POST Error:", error);
        return NextResponse.json({ error: "Failed to process wedding data" }, { status: 500 });
    }
}