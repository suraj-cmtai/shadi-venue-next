/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { RootState } from "@/lib/redux/store";
import { AppDispatch } from "@/lib/redux/store";
import { submitRSVP } from "@/lib/redux/features/rsvpSlice";

interface RSVPSectionProps {
    userId: string;
}

interface RSVPResponse {
    id: string;
    inviteId: string;
    userId: string;
    name: string;
    email: string;
    phone?: string;
    numberOfGuests: number;
    message?: string;
    attending: boolean;
    createdAt: string;
    status: 'pending' | 'confirmed' | 'declined';
}

export default function RSVPSection({ userId }: RSVPSectionProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        attendance: "yes", // Used only for form state
        numberOfGuests: 1,
        message: "",
        phone: "" // Optional field from the interface
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get dynamic background from Redux
    const backgroundImage = useSelector(
        (state: RootState) => state.wedding.rsvp.backgroundImage
    );

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await dispatch(submitRSVP({ 
                inviteId: userId,
                userId: userId, // Added as required by the interface
                name: formData.name,
                email: formData.email,
                numberOfGuests: formData.numberOfGuests,
                message: formData.message || undefined,
                attending: formData.attendance === "yes"
            }));
            toast.success("RSVP submitted successfully!");
        } catch (error) {
            toast.error("Failed to submit RSVP. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section
            className="relative w-full h-[700px] bg-cover bg-right bg-no-repeat mb-10"
            style={{ backgroundImage: `url('${backgroundImage}')` }}
        >
            <div className="absolute inset-0" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Form Left */}
                <div className="p-8 rounded-lg shadow-none -mt-7">
                    <h4 className="font-dancing-script text-xl text-[#333] mb-2 italic">
                        Invitation
                    </h4>
                    <h2 className="text-4xl font-bold text-[#212d47] mb-8">
                        Will You Attend?
                    </h2>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                            className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-[#212d47] placeholder-gray-700 focus:outline-none"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-[#212d47] placeholder-gray-700 focus:outline-none"
                        />

                        <div className="flex items-center gap-6 text-sm text-[#212d47]">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="attendance"
                                    value="yes"
                                    checked={formData.attendance === "yes"}
                                    onChange={(e) => handleInputChange('attendance', e.target.value)}
                                />
                                Yes, I will come
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="attendance"
                                    value="no"
                                    checked={formData.attendance === "no"}
                                    onChange={(e) => handleInputChange('attendance', e.target.value)}
                                />
                                Sorry, I can't come
                            </label>
                        </div>

                        {formData.attendance === "yes" && (
                            <>
                                <input
                                    type="number"
                                    placeholder="Number of Guests"
                                    value={formData.numberOfGuests}
                                    onChange={(e) => handleInputChange('numberOfGuests', parseInt(e.target.value))}
                                    min="1"
                                    className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-[#212d47] placeholder-gray-700 focus:outline-none"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number (Optional)"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-[#212d47] placeholder-gray-700 focus:outline-none"
                                />
                            </>
                        )}

                        <textarea
                            placeholder="Message for the Couple"
                            value={formData.message}
                            onChange={(e) => handleInputChange('message', e.target.value)}
                            className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-[#212d47] placeholder-gray-700 focus:outline-none resize-none"
                            rows={3}
                        />

                        <button
                            type="submit"
                            className="mt-4 px-6 py-2 bg-[#7d88a3] text-white font-semibold rounded-md hover:bg-[#5a6480] transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
                        </button>
                    </form>
                </div>

                {/* Right side just to show background */}
                <div className="hidden md:block" />
            </div>
        </section>
    );
}
