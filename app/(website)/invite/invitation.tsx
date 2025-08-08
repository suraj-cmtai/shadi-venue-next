/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

export default function RSVPSection() {
    const [attendance, setAttendance] = useState("yes");

    // Get dynamic background from Redux
    const backgroundImage = useSelector(
        (state: RootState) => state.wedding.rsvp.backgroundImage
    );

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

                    <form className="space-y-5">
                        <input
                            type="text"
                            placeholder="Name"
                            className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-[#212d47] placeholder-gray-700 focus:outline-none"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-[#212d47] placeholder-gray-700 focus:outline-none"
                        />

                        <div className="flex items-center gap-6 text-sm text-[#212d47]">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="attendance"
                                    value="yes"
                                    checked={attendance === "yes"}
                                    onChange={() => setAttendance("yes")}
                                />
                                Yes, I will come
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="attendance"
                                    value="no"
                                    checked={attendance === "no"}
                                    onChange={() => setAttendance("no")}
                                />
                                Sorry, I can't come
                            </label>
                        </div>

                        <input
                            type="number"
                            placeholder="Number of Guests"
                            className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-[#212d47] placeholder-gray-700 focus:outline-none"
                        />
                        <input
                            type="text"
                            placeholder="What Will You Be Attending"
                            className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-[#212d47] placeholder-gray-700 focus:outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Meal Preferences"
                            className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-[#212d47] placeholder-gray-700 focus:outline-none"
                        />

                        <button
                            type="submit"
                            className="mt-4 px-6 py-2 bg-[#7d88a3] text-white font-semibold rounded-md hover:bg-[#5a6480] transition"
                        >
                            Submit RSVP
                        </button>
                    </form>
                </div>

                {/* Right side just to show background */}
                <div className="hidden md:block" />
            </div>
        </section>
    );
}
