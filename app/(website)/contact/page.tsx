'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useState } from "react";

const Contact = () => {
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setSuccess(null);
        setError(null);
        try {
            const form = e.currentTarget;
            const formData = new FormData(form);
            // Map existing placeholders to API field names
            // message field is captured from textarea named additionalDetails
            const res = await fetch('/api/routes/contact', {
                method: 'POST',
                body: formData,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.errorMessage || 'Failed to submit');
            setSuccess('Thanks! We will contact you shortly.');
            form.reset();
        } catch (err: any) {
            setError(err.message || 'Something went wrong.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Get In Touch Section */}
            <div className="relative bg-background py-20 px-4 sm:px-8">
             
                {/* Decorative Leaves Left */}
                <div className="absolute -left-12 top-2/4 transform -translate-y-1/2 rotate-12 hidden md:block opacity-30">
                    <div className="relative w-[560px] h-[420px]">
                        <Image
                            src="/images/wedding/Vector_4.png"
                            alt="Decorative leaf"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Decorative Leaves Right */}
                <div className="absolute -right-12 top-2/2 transform -translate-y-1/2 hidden md:block opacity-30">
                    <div className="relative w-[500px] h-[420px]">
                        <Image
                            src="/images/wedding/Vector_4.png"
                            alt="Decorative leaf"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                <div className="relative z-10 max-w-2xl mx-auto text-center">
                    <h1 className="text-5xl font-light text-foreground mb-6 font-serif">
                        Get In Touch
                    </h1>
                    <p className="text-muted-foreground mb-12 leading-relaxed max-w-md mx-auto">
                        Have questions or just want to say hello? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
                    </p>

                    {/* Contact Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                type="text"
                                name="name"
                                placeholder="Full Name*"
                                required
                                className="bg-background border-muted placeholder:text-muted-foreground text-foreground"
                            />
                            <Input
                                type="email"
                                name="email"
                                placeholder="Email Address*"
                                required
                                className="bg-background border-muted placeholder:text-muted-foreground text-foreground"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                type="tel"
                                name="phone"
                                placeholder="Phone Number*"
                                required
                                className="bg-background border-muted placeholder:text-muted-foreground text-foreground"
                            />
                            <Input
                                type="date"
                                name="preferredDate"
                                placeholder="Preferred Date of Wedding*"
                                required
                                className="bg-background border-muted placeholder:text-muted-foreground text-foreground"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                type="text"
                                name="locationPreference"
                                placeholder="Location / Destination Preference*"
                                required
                                className="bg-background border-muted placeholder:text-muted-foreground text-foreground"
                            />
                            <Input
                                type="text"
                                name="venueServiceType"
                                placeholder="Type of Venue / Service Needed* (e.g., Banquet Hall)"
                                required
                                className="bg-background border-muted placeholder:text-muted-foreground text-foreground"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                type="number"
                                name="guests"
                                min={1}
                                placeholder="Number of Guests*"
                                required
                                className="bg-background border-muted placeholder:text-muted-foreground text-foreground"
                            />
                            <Input
                                type="text"
                                name="budgetRange"
                                placeholder="Budget Range (Optional)"
                                className="bg-background border-muted placeholder:text-muted-foreground text-foreground"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <select
                                name="contactTimePreference"
                                className="bg-background border border-muted text-foreground rounded-md px-3 py-2"
                                defaultValue=""
                            >
                                <option value="" disabled>Preferred Time to Contact (Optional)</option>
                                <option value="Morning">Morning</option>
                                <option value="Afternoon">Afternoon</option>
                                <option value="Evening">Evening</option>
                            </select>
                            <input type="hidden" name="priority" value="Low" />
                        </div>
                        <Textarea
                            name="additionalDetails"
                            placeholder="Comments*"
                            rows={6}
                            required
                            className="bg-background border-muted placeholder:text-muted-foreground text-foreground resize-none"
                        />
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="bg-[#212D47] hover:bg-[#1a2137] text-white px-12 py-3 text-sm font-medium tracking-wider"
                        >
                            {submitting ? 'Submitting…' : 'SUBMIT NOW ▶'}
                        </Button>
                        {success && <p className="text-green-600 text-sm">{success}</p>}
                        {error && <p className="text-red-600 text-sm">{error}</p>}
                    </form>
                </div>
            </div>

            {/* Find Us Section */}
            <div className="relative bg-background px-4 sm:px-8 overflow-hidden">
                <div className="py-20 px-4 sm:px-8 bg-gray-200 overflow-hidden">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg p-12 shadow-sm">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-light text-foreground mb-4 font-serif">
                                    Find Us Here
                                </h2>
                                <p className="text-muted-foreground">
                                    Locate our office or store on the map and visit us for more details.
                                </p>
                            </div>

                            {/* Grid with dividers */}
                            <div className="flex flex-col md:flex-row text-center mb-8 divide-y-2 md:divide-y-0 md:divide-x-2 divide-muted">
                                <div className="flex-1 px-4 py-6">
                                    <h3 className="text-lg font-medium text-foreground mb-4">Address</h3>
                                    <p className="text-muted-foreground">
                                        Orchid Center,<br />
                                        Golf Course Road, Gurgaon
                                    </p>
                                </div>
                                <div className="flex-1 px-4 py-6">
                                    <h3 className="text-lg font-medium text-foreground mb-4">Phone No.</h3>
                                    <p className="text-muted-foreground">9810703693</p>
                                </div>
                                <div className="flex-1 px-4 py-6">
                                    <h3 className="text-lg font-medium text-foreground mb-4">Email</h3>
                                    <p className="text-muted-foreground">connect@shadivenue.com</p>
                                </div>
                            </div>

                            <div className="text-center">
                                <Button className="bg-[#212D47] hover:bg-[#1a2137] text-white px-8 py-3 text-sm font-medium tracking-wider">
                                    ↗ GET DIRECTION
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Contact;
