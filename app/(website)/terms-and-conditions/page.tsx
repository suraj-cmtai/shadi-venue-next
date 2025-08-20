"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Heart,
    FileText,
    Calendar,
    CreditCard,
    Ban,
    Clock,
    Utensils,
    Music,
    Shield,
    Camera,
    Umbrella,
    Sparkles,
    Gavel,
    CheckCircle,
    Hotel
} from "lucide-react"

const termsData = [
    // Existing T&C for event clients...
    {
        id: "definitions",
        title: "Definitions",
        icon: <FileText className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">For clarity:</p>
                <div className="space-y-3">
                    <div>
                        <strong>1.1 Client / You</strong> – The individual(s) or organization booking the venue.
                    </div>
                    <div>
                        <strong>1.2 Venue / We / Us</strong> – Shadi Venue, including staff, management, and representatives.
                    </div>
                    <div>
                        <strong>1.3 Event</strong> – Any wedding, reception, ceremony, party, or other gathering held at the venue.
                    </div>
                    <div>
                        <strong>1.4 Vendors</strong> – Any third-party service provider engaged by the client (e.g., photographers,
                        caterers, decorators, entertainment).
                    </div>
                    <div>
                        <strong>1.5 Contract</strong> – The legally binding agreement formed by these Terms, the booking
                        confirmation, and any supplemental written agreements.
                    </div>
                </div>
            </div>
        ),
    },
    // ... (other existing terms unchanged)
    // Inserted T&C for Hotels/Resorts
    {
        id: "hotel-tnc",
        title: "Terms & Conditions for Hotels/Resorts",
        icon: <Hotel className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                    Registering your resort on this platform, you agree to the following terms and conditions:
                </p>
                <div className="space-y-3">
                    <div>
                        <strong>1. Accuracy of Information:</strong> You confirm that all information provided is accurate, up-to-date, and complete. You are responsible for maintaining the accuracy of your resort profile.
                    </div>
                    <div>
                        <strong>2. Service Agreement:</strong> You agree to offer services as described in your registration. Any changes to the services or pricing must be updated promptly.
                    </div>
                    <div>
                        <strong>3. Communication:</strong> You consent to receive communication from wedding planners, customers, and the platform regarding your resort listing and related inquiries.
                    </div>
                    <div>
                        <strong>4. Intellectual Property:</strong> You retain ownership of any images, logos, and content you upload. By submitting them, you grant the platform permission to use this content for promotional purposes.
                    </div>
                    <div>
                        <strong>5. Liability:</strong> The platform is not liable for any disputes, cancellations, or damages related to bookings or services between resort owners and clients.
                    </div>
                    <div>
                        <strong>6. Privacy:</strong> Your personal and resort information will be handled in accordance with our Privacy Policy. We do not share your details with third parties without your consent.
                    </div>
                    <div>
                        <strong>7. Modification or Termination:</strong> The platform reserves the right to modify or terminate your listing if it is deemed to violate any terms or for any operational reasons.
                    </div>
                    <div>
                        <strong>8. Governing Law:</strong> These terms are governed by the laws of [Country/Region].
                    </div>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-300 mt-4">
                    <p className="text-sm font-medium text-[#212D47]">
                        By checking this box, you confirm that you have read, understood, and agree to the terms and conditions outlined above.
                    </p>
                </div>
            </div>
        ),
    },
    // Continue with the rest of the original terms...
    {
        id: "booking",
        title: "Booking Procedure",
        icon: <Calendar className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>2.1.</strong> All booking requests must be submitted via our official booking form, email, or website.
                </div>
                <div>
                    <strong>2.2.</strong> A non-refundable deposit of 25% is required within 30 days to secure your
                    date.
                </div>
                <div>
                    <strong>2.3.</strong> Dates are allocated on a first-come, first-served basis upon receipt of deposit.
                </div>
                <div>
                    <strong>2.4.</strong> We reserve the right to decline bookings without explanation if we believe the event
                    conflicts with our policies, reputation, or legal obligations.
                </div>
                <div>
                    <strong>2.5.</strong> The client must be at least 18 years old to make a booking.
                </div>
            </div>
        ),
    },
    {
        id: "payments",
        title: "Payments & Pricing",
        icon: <CreditCard className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>3.1.</strong> All prices are listed in Rupees and include applicable taxes unless otherwise
                    stated.
                </div>
                <div>
                    <strong>3.2.</strong> The final payment is due no later than 15 days before the event.
                </div>
                <div>
                    <strong>3.3.</strong> If payment deadlines are missed, we may cancel your booking without refund.
                </div>
                <div>
                    <strong>3.4.</strong> Any extra charges incurred on the event day (overtime, additional services, damages)
                    must be settled before leaving the venue.
                </div>
                <div>
                    <strong>3.5.</strong> We reserve the right to adjust our pricing at any time for future bookings.
                </div>
            </div>
        ),
    },
    {
        id: "cancellation",
        title: "Cancellation Policy",
        icon: <Ban className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>4.1.</strong> All deposits are non-refundable under any circumstances.
                </div>
                <div>
                    <strong>4.2.</strong> Written notice is required for all cancellations.
                </div>
                <div>
                    <strong>4.3.</strong> Cancellation charges:
                </div>
                <div className="ml-4 space-y-2 bg-pink-50 p-4 rounded-lg">
                    <div>• More than 6 months before event: Deposit forfeited.</div>
                    <div>• Between 3–6 months: 50% of total contract value.</div>
                    <div>• Less than 30 days: 100% of total contract value.</div>
                </div>
                <div>
                    <strong>4.4.</strong> If we cancel due to circumstances beyond our control (see Section 14 – Force Majeure),
                    we will refund payments made, excluding services already rendered.
                </div>
            </div>
        ),
    },
    {
        id: "timing",
        title: "Event Timing & Access",
        icon: <Clock className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>5.1.</strong> Venue access begins strictly at the time stated in your booking confirmation. Early access is subject to prior approval, availability, and may incur additional charges.
                </div>
                <div>
                    <strong>5.2.</strong>As per Noise Pollution (Regulation and Control) Rules, 2000 and local municipal laws, all loud music and amplified sound must end by 10:00 PM. Events with music or entertainment must therefore conclude by this time unless special written permission from local authorities has been obtained in advance.
                </div>
                <div>
                    <strong>5.3.</strong> . All guests, vendors, and personal belongings must be removed from the premises no later than 11:00 PM to allow for proper closing and security procedures.
                </div>
                <div>
                    <strong>5.4.</strong> Overtime usage of the venue beyond the agreed time will incur an additional charge of ₹5,000 per hour (or part thereof), subject to availability and management approval.
                </div>
            </div>
        ),
    },
    {
        id: "setup",
        title: "Setup, Decoration & Restrictions",
        icon: <Sparkles className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>6.1.</strong> All decoration plans, including vendor details and material lists, must be submitted for approval at least <strong>15 days before the event</strong>.
                </div>
                <div>
                    <strong>6.2.</strong> The following items are strictly prohibited within the venue premises unless specifically approved in writing:
                </div>
                <div className="ml-4 space-y-2 bg-red-50 p-4 rounded-lg">
                    <div>• Confetti (unless biodegradable)</div>
                    <div>• Glitter, powder, or dye</div>
                    <div>• Nails, staples, or adhesives that may damage walls, floors, or furniture</div>
                    <div>• Smoke machines, pyrotechnics, or firecrackers (unless approved and licensed as per local regulations)</div>
                </div>
                <div>
                    <strong>6.3.</strong> Open flames, including candles, diyas, and fire-based decor, are prohibited unless contained in enclosed holders and pre-approved by management in compliance with local fire safety rules.
                </div>
                <div>
                    <strong>6.4.</strong> The client is responsible for removing all decorations, props, and personal items immediately after the event, ensuring no damage or litter remains.
                </div>
                <div>
                    <strong>6.5.</strong> Any damages caused by decorations, installation, or removal will be charged to the client as per the venue’s repair cost policy.
                </div>
            </div>
        ),
    },
    {
        id: "catering",
        title: "Catering & Beverages",
        icon: <Utensils className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>7.1.</strong> Catering must be provided by approved vendors or our in-house service unless otherwise
                    agreed.
                </div>
                <div>
                    <strong>7.2.</strong> External catering is subject to an external vendor fee and compliance with hygiene and
                    licensing laws.
                </div>
                <div>
                    <strong>7.3.</strong> Alcohol may only be served to guests aged 18+.
                </div>
                <div>
                    <strong>7.4.</strong> We reserve the right to stop alcohol service to intoxicated guests.
                </div>
                <div>
                    <strong>7.5.</strong> If you wish to bring your own alcohol, corkage fees apply.
                </div>
            </div>
        ),
    },
    {
        id: "entertainment",
        title: "Music, Sound & Entertainment",
        icon: <Music className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>8.1.</strong> Music must be kept within local noise limits.
                </div>
                <div>
                    <strong>8.2.</strong> DJs, live bands, and entertainment providers must be approved and insured.
                </div>
                <div>
                    <strong>8.3.</strong> The event must end by [time] to comply with local regulations.
                </div>
                <div>
                    <strong>8.4.</strong> We may use sound limiters to monitor volume.
                </div>
            </div>
        ),
    },
    {
        id: "conduct",
        title: "Guest Conduct & Security",
        icon: <Shield className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>9.1.</strong> The client is responsible for guest behavior.
                </div>
                <div>
                    <strong>9.2.</strong> Aggressive, unsafe, or disruptive conduct will result in removal from the premises.
                </div>
                <div>
                    <strong>9.3.</strong> Children must be supervised at all times.
                </div>
                <div>
                    <strong>9.4.</strong> Any illegal activity will be reported to law enforcement.
                </div>
            </div>
        ),
    },
    {
        id: "liability",
        title: "Damage, Loss & Liability",
        icon: <Shield className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>10.1.</strong> You are liable for any damage to the venue, furniture, fixtures, or grounds caused by
                    you, your guests, or vendors.
                </div>
                <div>
                    <strong>10.2.</strong> You will be billed for repairs or replacements.
                </div>
                <div>
                    <strong>10.3.</strong> We are not liable for loss or damage to personal property.
                </div>
                <div>
                    <strong>10.4.</strong> All vendors must carry their own insurance.
                </div>
            </div>
        ),
    },
    {
        id: "photography",
        title: "Photography & Videography",
        icon: <Camera className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>11.1.</strong> We reserve the right to use images of the venue during your event for promotional
                    purposes unless you request otherwise in writing.
                </div>
                <div>
                    <strong>11.2.</strong> Drones may only be used with prior approval and must comply with aviation laws.
                </div>
            </div>
        ),
    },
    {
        id: "insurance",
        title: "Insurance",
        icon: <Umbrella className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>12.1.</strong> We strongly recommend that clients obtain wedding/event insurance to cover
                    cancellations, damages, and liabilities.
                </div>
                <div>
                    <strong>12.2.</strong> Vendors must provide a certificate of insurance before the event.
                </div>
            </div>
        ),
    },
    {
        id: "cleaning",
        title: "Cleaning & Waste Disposal",
        icon: <Sparkles className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>13.1.</strong> The venue will be provided in a clean and prepared condition.
                </div>
                <div>
                    <strong>13.2.</strong> Clients are responsible for removing all personal belongings and decorations.
                </div>
                <div>
                    <strong>13.3.</strong> Waste must be disposed of in designated bins.
                </div>
                <div>
                    <strong>13.4.</strong> Excessive cleaning will result in a cleaning fee.
                </div>
            </div>
        ),
    },
    {
        id: "force-majeure",
        title: "Force Majeure",
        icon: <Umbrella className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>14.1.</strong> We are not responsible for delays or cancellations caused by circumstances beyond our
                    control, including:
                </div>
                <div className="ml-4 space-y-2 bg-amber-50 p-4 rounded-lg">
                    <div>• Severe weather</div>
                    <div>• Natural disasters</div>
                    <div>• Strikes or labor disputes</div>
                    <div>• Government restrictions</div>
                </div>
                <div>
                    <strong>14.2.</strong> In such cases, we will attempt to reschedule or provide alternative arrangements.
                </div>
            </div>
        ),
    },
    {
        id: "safety",
        title: "Health & Safety Compliance",
        icon: <Shield className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>15.1.</strong> You must comply with all safety regulations, including fire safety rules.
                </div>
                <div>
                    <strong>15.2.</strong> Emergency exits must remain clear at all times.
                </div>
                <div>
                    <strong>15.3.</strong> First aid assistance is available on request.
                </div>
            </div>
        ),
    },
    {
        id: "privacy",
        title: "Privacy & Data Protection",
        icon: <Shield className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>16.1.</strong> We respect your privacy and process personal data in accordance with applicable laws.
                </div>
                <div>
                    <strong>16.2.</strong> Your data will not be sold or shared except as required for booking management or legal
                    compliance.
                </div>
            </div>
        ),
    },
    {
        id: "governing-law",
        title: "Governing Law",
        icon: <Gavel className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    <strong>17.1.</strong> These Terms are governed by the laws of [Your State/Country].
                </div>
                <div>
                    <strong>17.2.</strong> Any disputes will be settled in the courts of [Your Location].
                </div>
            </div>
        ),
    },
    {
        id: "acceptance",
        title: "Acceptance",
        icon: <CheckCircle className="w-5 h-5" />,
        content: (
            <div className="space-y-3">
                <div>
                    By booking with Shadi Venue, you confirm that you have read, understood, and agreed to these Terms &
                    Conditions.
                </div>
                <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-300">
                    <p className="text-sm font-medium text-[#212D47]">
                        <Heart className="w-4 h-4 inline mr-2 text-pink-500" />
                        Thank you for choosing Shadi Venue for your special day. We look forward to creating magical memories with
                        you.
                    </p>
                </div>
            </div>
        ),
    },
]

export default function TermsAndConditions() {
    return (
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-[#212D47] text-white rounded-t-lg">
                <CardTitle className="text-2xl md:text-3xl font-bold text-center flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-pink-300" />
                    Terms & Conditions
                </CardTitle>
                <p className="text-pink-100 text-center mt-2">Please review all sections carefully before booking your event or registering your resort</p>
            </CardHeader>
            <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                    {termsData.map((section, index) => (
                        <AccordionItem key={section.id} value={section.id} className="border-b border-pink-100 last:border-b-0">
                            <AccordionTrigger className="px-6 py-4 hover:bg-pink-50/50 transition-colors duration-200 text-left">
                                <div className="flex items-center gap-3 text-[#212D47]">
                                    <div className="text-pink-500">{section.icon}</div>
                                    <span className="font-semibold text-base md:text-lg">
                                        {index + 1}. {section.title}
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 pt-2">
                                <div className="text-[#212D47]/90 leading-relaxed">{section.content}</div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <div className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 border-t border-pink-100">
                    <div className="text-center">
                        <p className="text-sm text-[#212D47]/70 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
                        <div className="flex items-center justify-center gap-2 text-pink-600">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm font-medium">Shadi Venue - Where Dreams Come True</span>
                            <Heart className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
