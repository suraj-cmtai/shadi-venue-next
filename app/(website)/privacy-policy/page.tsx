"use client"

import { useState } from "react"
import { ChevronDown, Shield, Eye, Lock, Users, FileText, Clock, Globe, Phone, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const privacySections = [
    {
        id: "information-we-collect",
        title: "Information We Collect",
        icon: <Eye className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    <h4 className="font-semibold text-[#212D47] mb-2">1.1 Personal Information</h4>
                    <p className="text-[#212D47]/80 mb-2">
                        This includes any information that can identify you directly or indirectly, such as:
                    </p>
                    <ul className="list-disc list-inside text-[#212D47]/80 space-y-1">
                        <li>Full name</li>
                        <li>Email address</li>
                        <li>Phone number</li>
                        <li>Billing and shipping address</li>
                        <li>Payment information (processed via secure payment gateways)</li>
                    </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-[#212D47] mb-2">1.2 Non-Personal Information</h4>
                    <p className="text-[#212D47]/80 mb-2">This includes:</p>
                    <ul className="list-disc list-inside text-[#212D47]/80 space-y-1">
                        <li>IP address</li>
                        <li>Browser type and version</li>
                        <li>Device type and operating system</li>
                        <li>Pages visited, time spent, and browsing patterns</li>
                    </ul>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                    <h4 className="font-semibold text-[#212D47] mb-2">1.3 Sensitive Personal Data</h4>
                    <p className="text-[#212D47]/80 mb-2">As per Indian IT Rules, this includes:</p>
                    <ul className="list-disc list-inside text-[#212D47]/80 space-y-1">
                        <li>Passwords</li>
                        <li>Financial information (like bank account, credit/debit card details)</li>
                        <li>Health information (if applicable)</li>
                    </ul>
                    <p className="text-[#212D47]/80 mt-2 font-medium">
                        We only collect such data when necessary and with your explicit consent.
                    </p>
                </div>
            </div>
        ),
    },
    // --- Hotel/Resort Privacy Policy Agreement Section ---
    {
        id: "hotel-privacy-policy-agreement",
        title: "Privacy Policy Agreement for Hotels & Resorts",
        icon: <Shield className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4">
                    <h4 className="font-semibold text-[#212D47] mb-2">Privacy Policy Agreement</h4>
                    <p className="text-[#212D47]/80 mb-2">
                        By registering your resort on this platform, you acknowledge and agree to the following:
                    </p>
                    <ul className="list-decimal list-inside text-[#212D47]/80 space-y-2 pl-4">
                        <li>
                            <span className="font-semibold">Data Collection:</span> We collect personal information, including your name, contact details, and resort information, to facilitate your registration and communicate with wedding planners and clients.
                        </li>
                        <li>
                            <span className="font-semibold">Use of Information:</span> Your information will be used to display your resort profile, respond to inquiries, and improve our services. We may also send updates about platform features or promotions.
                        </li>
                        <li>
                            <span className="font-semibold">Third-Party Sharing:</span> We do not share your personal information with third parties without your consent, except as required by law or to process transactions necessary for the platform's operation.
                        </li>
                        <li>
                            <span className="font-semibold">Data Security:</span> We employ industry-standard security measures to protect your data. However, we cannot guarantee complete security due to the nature of online communication.
                        </li>
                        <li>
                            <span className="font-semibold">Your Rights:</span> You can request access to, update, or delete your information at any time. For any questions regarding your data, please contact us at <span className="underline">privacy@shadivenue.com</span>.
                        </li>
                    </ul>
                    <div className="bg-pink-100 border border-pink-200 rounded-lg p-4 mt-4 flex items-start space-x-3">
                        <input type="checkbox" disabled className="mt-1 accent-pink-500" />
                        <span className="text-[#212D47]/80">
                            By checking this box, you confirm that you have read, understood, and agree to our Privacy Policy.
                        </span>
                    </div>
                </div>
            </div>
        ),
    },
    // --- End Hotel/Resort Section ---
    {
        id: "how-we-collect",
        title: "How We Collect Information",
        icon: <Users className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <p className="text-[#212D47]/80">We collect information through:</p>
                <div className="grid gap-4">
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#212D47] mb-2">Direct Interactions</h4>
                        <p className="text-[#212D47]/80">When you sign up, contact us, or make a booking</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#212D47] mb-2">Automated Technologies</h4>
                        <p className="text-[#212D47]/80">Cookies, analytics tools, and similar technologies</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#212D47] mb-2">Third-Party Integrations</h4>
                        <p className="text-[#212D47]/80">Payment gateways, social media logins, and other services</p>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: "use-of-information",
        title: "Use of Information",
        icon: <FileText className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <p className="text-[#212D47]/80 mb-4">We use your information for:</p>
                <div className="grid gap-3">
                    {[
                        "Providing and managing our services",
                        "Processing payments and bookings",
                        "Personalising your experience on the Site",
                        "Sending service updates, offers, and promotions (only if you opt-in)",
                        "Improving website performance and security",
                        "Complying with legal obligations",
                    ].map((use, index) => (
                        <div key={index} className="flex items-center space-x-3 bg-white/50 rounded-lg p-3 border border-pink-100">
                            <div className="w-2 h-2 bg-pink-400 rounded-full flex-shrink-0"></div>
                            <span className="text-[#212D47]/80">{use}</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: "cookies-tracking",
        title: "Cookies and Tracking",
        icon: <Globe className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <p className="text-[#212D47]/80">We use cookies and similar technologies to:</p>
                <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#212D47] mb-2">Remember Your Preferences</h4>
                        <p className="text-[#212D47]/80">Keep track of your settings and choices for a better experience</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#212D47] mb-2">Measure Site Performance</h4>
                        <p className="text-[#212D47]/80">Analyze how our website performs and identify areas for improvement</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#212D47] mb-2">Analyse User Behaviour</h4>
                        <p className="text-[#212D47]/80">
                            Understand how visitors interact with our site to enhance user experience
                        </p>
                    </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <p className="text-[#212D47]/80">
                        <strong>Note:</strong> You can disable cookies in your browser settings, but this may affect your experience
                        on our Site.
                    </p>
                </div>
            </div>
        ),
    },
    {
        id: "disclosure-information",
        title: "Disclosure of Information",
        icon: <Shield className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <p className="text-[#212D47]/80 mb-4">We may share your information:</p>
                <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#212D47] mb-2">With Service Providers</h4>
                        <p className="text-[#212D47]/80">Payment processors, hosting providers, marketing platforms</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#212D47] mb-2">With Legal Authorities</h4>
                        <p className="text-[#212D47]/80">When required by law or in response to valid legal requests</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#212D47] mb-2">In Case of Business Transfer</h4>
                        <p className="text-[#212D47]/80">During merger, acquisition, or business transfer</p>
                    </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <p className="text-[#212D47] font-semibold">We never sell your personal data to third parties.</p>
                </div>
            </div>
        ),
    },
    {
        id: "data-security",
        title: "Data Security",
        icon: <Lock className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <p className="text-[#212D47]/80">
                    We follow industry-standard security measures, including encryption, secure servers, and access controls, to
                    protect your data.
                </p>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-[#212D47]/80">
                        <strong>Important:</strong> However, no method of transmission or storage is 100% secure, and we cannot
                        guarantee absolute security.
                    </p>
                </div>
            </div>
        ),
    },
    {
        id: "data-retention",
        title: "Data Retention",
        icon: <Clock className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <p className="text-[#212D47]/80">
                    We retain your personal data only as long as necessary to fulfil the purposes for which it was collected or as
                    required by law.
                </p>
            </div>
        ),
    },
    {
        id: "your-rights",
        title: "Your Rights",
        icon: <Users className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <p className="text-[#212D47]/80 mb-4">
                    As per Indian law and applicable international standards, you have the right to:
                </p>
                <div className="grid gap-3">
                    {[
                        "Access, correct, or update your personal information",
                        "Withdraw consent for data processing",
                        "Request deletion of your data",
                        "Opt-out of marketing communications",
                    ].map((right, index) => (
                        <div key={index} className="flex items-center space-x-3 bg-white/50 rounded-lg p-3 border border-pink-100">
                            <div className="w-2 h-2 bg-pink-400 rounded-full flex-shrink-0"></div>
                            <span className="text-[#212D47]/80">{right}</span>
                        </div>
                    ))}
                </div>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mt-4">
                    <p className="text-[#212D47]/80">
                        To exercise these rights, contact us at <strong>privacy@shadivenue.com</strong>
                    </p>
                </div>
            </div>
        ),
    },
    {
        id: "third-party-links",
        title: "Third-Party Links",
        icon: <Globe className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <p className="text-[#212D47]/80">
                    Our Site may contain links to third-party websites. We are not responsible for the privacy practices or
                    content of such external sites.
                </p>
            </div>
        ),
    },
    {
        id: "childrens-privacy",
        title: "Children's Privacy",
        icon: <Shield className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <p className="text-[#212D47]/80">
                    Our services are not intended for individuals under the age of 18. We do not knowingly collect data from
                    minors.
                </p>
            </div>
        ),
    },
    {
        id: "policy-changes",
        title: "Changes to This Policy",
        icon: <FileText className="w-5 h-5" />,
        content: (
            <div className="space-y-4">
                <p className="text-[#212D47]/80">
                    We may update this Privacy Policy from time to time. Changes will be posted on this page with the updated
                    date.
                </p>
            </div>
        ),
    },
]

export default function PrivacyPolicy() {
    const [openSections, setOpenSections] = useState<string[]>([])

    const toggleSection = (sectionId: string) => {
        setOpenSections((prev) => (prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]))
    }

    return (
        <div className="space-y-6">
            {/* Header Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-pink-200 shadow-lg">
                <CardContent className="p-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full">
                            <Shield className="w-6 h-6 text-[#212D47]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[#212D47]">Privacy Policy</h2>
                            <p className="text-[#212D47]/60">Shadi Venue</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4 border border-pink-200">
                            <div className="flex items-center space-x-2 mb-2">
                                <Clock className="w-4 h-4 text-[#212D47]" />
                                <span className="font-semibold text-[#212D47]">Effective Date</span>
                            </div>
                            <p className="text-[#212D47]/80">Aug 15, 2025</p>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center space-x-2 mb-2">
                                <FileText className="w-4 h-4 text-[#212D47]" />
                                <span className="font-semibold text-[#212D47]">Last Updated</span>
                            </div>
                            <p className="text-[#212D47]/80">Aug 15, 2025</p>
                        </div>
                    </div>

                    <p className="text-[#212D47]/80 leading-relaxed">
                        Shadi Venue ("we," "our," "us") is committed to protecting your privacy. This Privacy Policy explains how we
                        collect, use, disclose, and safeguard your personal information when you visit our website{" "}
                         (the "Site") and use our services. By accessing or using our Site, you
                        agree to the terms of this Privacy Policy.
                    </p>
                </CardContent>
            </Card>

            {/* Privacy Sections */}
            <div className="space-y-4">
                {privacySections.map((section, index) => (
                    <Card key={section.id} className="bg-white/80 backdrop-blur-sm border-pink-200 shadow-lg overflow-hidden">
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full p-6 text-left hover:bg-pink-50/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-inset"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full text-[#212D47]">
                                        {section.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#212D47]">
                                            {index + 1}. {section.title}
                                        </h3>
                                    </div>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 text-[#212D47] transition-transform duration-200 ${openSections.includes(section.id) ? "rotate-180" : ""
                                        }`}
                                />
                            </div>
                        </button>

                        {openSections.includes(section.id) && (
                            <CardContent className="px-6 pb-6 pt-0">
                                <div className="pl-14">{section.content}</div>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    )
}
