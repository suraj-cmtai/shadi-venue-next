"use client";

import React, { Component } from "react";
import {Phone,Mail,Instagram,MessageCircle,Facebook,Twitter,ChevronLeft,ChevronRight,Minus,Plus,} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";

interface BookingFormState {
    selectedDate?: Date;
    currentMonth: Date;
    adults: number;
    children: number;
    room: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    captchaAnswer: string;
    activeTab: "availability" | "contact";
}

class BusinessInfo extends Component {
    render() {
        return (
            <div className="bg-luxury-cream h-full p-8 flex flex-col mt-10 sticky top-10 sm:items-center sm:text-left ">
                <div className="lg:ml-24 sm:ml-20">
                    <div className="mb-8">
                        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                            LUXURY B&B EXPERIENCE
                        </h2>
                        <h1 className="text-2xl font-bold text-foreground mb-6">Address</h1>
                        <div className="space-y-1 text-sm text-muted-foreground">
                            <p>Baker Street 567, Los Angeles 11023</p>
                            <p>California - US</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-luxury-warm flex items-center justify-center">
                                <Phone className="h-4 w-4 text-luxury-brown" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                    BOOKINGS
                                </p>
                                <p className="font-medium">+41 934 121 1334</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-luxury-warm flex items-center justify-center">
                                <Mail className="h-4 w-4 text-luxury-brown" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                                    QUESTIONS
                                </p>
                                <p className="font-medium">info@domain.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class GuestSelector extends Component<{
    adults: number;
    childCount: number;
    onAdultsChange: (val: number) => void;
    onChildrenChange: (val: number) => void;
}> {
    render() {
        const { adults, childCount, onAdultsChange, onChildrenChange } = this.props;
        return (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-1 sm:gap-3">
                {[
                    { label: "Adults", value: adults, setValue: onAdultsChange, min: 1 },
                    { label: "Children", value: childCount, setValue: onChildrenChange, min: 0 },
                ].map((item, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between bg-card rounded-lg p-3 border sm:flex-col sm:items-stretch sm:gap-2"
                    >
                        <span className="text-sm font-medium">{item.label}</span>
                        <div className="flex items-center gap-3 sm:justify-between sm:gap-2">
                            <button
                                onClick={() => item.setValue(Math.max(item.min, item.value - 1))}
                                className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-luxury-warm transition-colors sm:w-7 sm:h-7"
                                disabled={item.value <= item.min}
                                type="button"
                            >
                                <Minus className="h-4 w-4 sm:h-3 sm:w-3" />
                            </button>
                            <span className="w-8 text-center font-medium sm:w-6">{item.value}</span>
                            <button
                                onClick={() => item.setValue(item.value + 1)}
                                className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-luxury-warm transition-colors sm:w-7 sm:h-7"
                                type="button"
                            >
                                <Plus className="h-4 w-4 sm:h-3 sm:w-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}

export default class BookingPage extends Component<Record<string, never>, BookingFormState> {
    constructor(props: Record<string, never>) {
        super(props);
        this.state = {
            selectedDate: undefined,
            currentMonth: new Date(),
            adults: 1,
            children: 0,
            room: "",
            name: "",
            email: "",
            phone: "",
            message: "",
            captchaAnswer: "",
            activeTab: "availability", // "availability" or "contact"
        };
    }

    nextMonth = () => {
        this.setState(({ currentMonth }) => ({
            currentMonth: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
        }));
    };

    prevMonth = () => {
        this.setState(({ currentMonth }) => ({
            currentMonth: new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
        }));
    };

    handleDateSelect = (date?: Date) => {
        this.setState({ selectedDate: date });
    };

    handleAdultsChange = (val: number) => {
        this.setState({ adults: val });
    };

    handleChildrenChange = (val: number) => {
        this.setState({ children: val });
    };

    handleRoomChange = (val: string) => {
        this.setState({ room: val });
    };

    handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ name: e.target.value });
    };

    handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ email: e.target.value });
    };

    handleCaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ captchaAnswer: e.target.value });
    };

    handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ phone: e.target.value });
    };

    handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ message: e.target.value });
    };

    showToast = (
        title: string,
        description: string,
        variant: "destructive" | "default" = "default"
    ) => {
        alert(`${title}\n${description}`);
    };

    handleBookingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { selectedDate, room, name, email, captchaAnswer, adults, children } = this.state;
        if (!selectedDate || !room || !name || !email) {
            this.showToast(
                "Missing Information",
                "Please fill in all required fields.",
                "destructive"
            );
            return;
        }
        if (captchaAnswer !== "4") {
            this.showToast(
                "Verification Failed",
                "Please answer the verification question correctly.",
                "destructive"
            );
            return;
        }
        // Send booking details (simulate)
        this.showToast(
            "Booking Request Sent",
            `Details:\nDate: ${selectedDate?.toLocaleDateString()}\nRoom: ${room}\nAdults: ${adults}\nChildren: ${children}\nName: ${name}\nEmail: ${email}`,
            "default"
        );
    };

    handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, email, phone, message } = this.state;
        if (!name || !email || !message) {
            this.showToast(
                "Missing Information",
                "Please fill in all required fields.",
                "destructive"
            );
            return;
        }
        // Send contact message (simulate)
        this.showToast(
            "Message Sent",
            `Thank you, ${name}! We'll get back to you soon.`,
            "default"
        );
    };

    setActiveTab = (tab: "availability" | "contact") => {
        this.setState({ activeTab: tab });
    };

    render() {
        const {
            selectedDate,
            currentMonth,
            adults,
            children,
            room,
            name,
            email,
            captchaAnswer,
            phone,
            message,
            activeTab,
        } = this.state;

        return (
            <div className="min-h-screen bg-luxury-cream flex flex-col md:flex-row">
                {/* Make the booking form sticky on desktop */}
                <div className="w-3xl md:w-1/2 sm:w-full">
                    <BusinessInfo />
                </div>

                <div className="w-full md:w-2/3 p-8 sm:p-4 flex justify-center items-start">
                    <div
                        className="
                            bg-card p-8 rounded-lg shadow-elegant w-[400px] sm:w-full sm:p-4
                            md:sticky md:top-10
                        "
                        style={{
                            // fallback for sticky on desktop, not on mobile
                            maxHeight: "calc(100vh - 2.5rem)",
                            overflowY: "auto",
                        }}
                    >
                        {/* Tab Buttons Row */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            <Button
                                type="button"
                                className={`w-full sm:w-1/2 bg-black hover:text-white hover:bg-black/90  ${activeTab === "availability"
                                    ? "ring-2 ring-black text-white"
                                    : "bg-opacity-60 text-black"}
  `}
                                onClick={() => this.setActiveTab("availability")}
                                variant="default"
                            >
                                Check Availability
                            </Button>

                            <Button
                                type="button"
                                className={`w-full sm:w-1/2 bg-black hover:text-white hover:bg-black/90  ${activeTab === "contact"
                                    ? "ring-2 ring-black text-white"
                                    : "bg-opacity-60 text-black"}
  `}
                                onClick={() => this.setActiveTab("contact")}
                                variant="default"
                            >
                                Contact Us
                            </Button>
                        </div>

                        {/* Contact Form */}
                        {activeTab === "contact" && (
                            <form
                                onSubmit={this.handleContactSubmit}
                                className="mt-6 space-y-4 border-t border-gray-200 pt-4"
                            >
                                <Input
                                    placeholder="Name"
                                    value={name}
                                    onChange={this.handleNameChange}
                                />
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={this.handleEmailChange}
                                />
                                <Input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={phone || ""}
                                    onChange={this.handlePhoneChange}
                                />
                                <textarea
                                    placeholder="Message"
                                    value={message || ""}
                                    onChange={this.handleMessageChange}
                                    className="w-full p-2 border rounded"
                                    rows={4}
                                />
                                <Button type="submit" className="w-full bg-black text-white hover:bg-black/90">
                                    Send Message
                                </Button>
                            </form>
                        )}

                        {/* Booking Form */}
                        {activeTab === "availability" && (
                            <form onSubmit={this.handleBookingSubmit} className="space-y-6 sm:space-y-4 mt-6">
                                {/* Calendar Navigation */}
                                <div className="w-full">
                                    <div className="flex items-center justify-between mb-4 sm:mb-2">
                                        <button
                                            onClick={this.prevMonth}
                                            type="button"
                                            className="p-2 rounded-md hover:bg-luxury-warm transition-colors sm:p-1"
                                        >
                                            <ChevronLeft className="h-4 w-4 sm:h-3 sm:w-3" />
                                        </button>
                                        <h3 className="text-lg font-medium sm:text-base">
                                            {currentMonth.toLocaleDateString("en-US", {
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </h3>
                                        <button
                                            onClick={this.nextMonth}
                                            type="button"
                                            className="p-2 rounded-md hover:bg-luxury-warm transition-colors sm:p-1"
                                        >
                                            <ChevronRight className="h-4 w-4 sm:h-3 sm:w-3" />
                                        </button>
                                    </div>

                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={this.handleDateSelect}
                                        month={currentMonth}
                                        onMonthChange={(date) => this.setState({ currentMonth: date })}
                                        className={cn("w-full pointer-events-auto")}
                                        showOutsideDays
                                        disableNavigation
                                    />
                                </div>

                                {/* Room Selector */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 sm:mb-1">
                                        Select Room
                                    </label>
                                    <Select value={room} onValueChange={this.handleRoomChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Room" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="deluxe">Deluxe Suite</SelectItem>
                                            <SelectItem value="premium">Premium Room</SelectItem>
                                            <SelectItem value="standard">Standard Room</SelectItem>
                                            <SelectItem value="family">Family Suite</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <GuestSelector
                                    adults={adults}
                                    childCount={children}
                                    onAdultsChange={this.handleAdultsChange}
                                    onChildrenChange={this.handleChildrenChange}
                                />

                                {/* Name & Email */}
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-1 sm:gap-3">
                                    <Input
                                        placeholder="Name and Last Name"
                                        value={name}
                                        onChange={this.handleNameChange}
                                    />
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={this.handleEmailChange}
                                    />
                                </div>

                                {/* Captcha */}
                                <div className="flex items-center gap-4 sm:flex-col sm:items-stretch sm:gap-2">
                                    <span className="text-sm">Are you human?</span>
                                    <span className="text-sm font-medium">3 + 1 = ?</span>
                                    <Input
                                        value={captchaAnswer}
                                        onChange={this.handleCaptchaChange}
                                        className="w-16 text-center sm:w-full"
                                        maxLength={2}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-black text-white hover:bg-black/90 py-3 rounded-lg font-medium sm:py-2"
                                >
                                    Check Now
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
