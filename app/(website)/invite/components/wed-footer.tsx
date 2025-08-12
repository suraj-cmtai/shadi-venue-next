"use client";

import Image from "next/image";
import { FaInstagram, FaTwitter, FaFacebookF } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store"; // adjust this path

interface WeddingFooterProps {
    backgroundImage: string;
    coupleNames: string;
    subtitle: string;
    socials: {
        instagram: string;
        twitter: string;
        facebook: string;
    };
}

export default function WeddingFooter({ backgroundImage, coupleNames, subtitle, socials }: WeddingFooterProps) {

    return (
        <footer className="relative bg-white/60 backdrop-blur-md text-center text-[#212d47] py-12 px-4">
            {/* Background image */}
            <div className="absolute inset-0 -z-10 opacity-20">
                <Image
                    src={backgroundImage}
                    alt="Footer background"
                    fill
                    className="object-cover"
                />
            </div>

            {/* Names and subtitle */}
            <h2 className="font-dancing-script text-3xl sm:text-4xl text-[#212d47] mb-1">
                {coupleNames}
            </h2>
            <p className="text-sm text-[#555] italic mb-6">
                {subtitle}
            </p>
             {/* Divider */}
            <div className="h-px bg-gray-300 w-3/4 mx-auto my-6" />

            {/* Social icons */}
            <div className="flex justify-center items-center gap-6 text-[#212d47] mb-6 text-xl">
                {socials.instagram && (
                    <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-pink-600 transition">
                        <FaInstagram />
                    </a>
                )}
                {socials.twitter && (
                    <a href={socials.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-blue-400 transition">
                        <FaTwitter />
                    </a>
                )}
                {socials.facebook && (
                    <a href={socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-blue-600 transition">
                        <FaFacebookF />
                    </a>
                )}
            </div>

           

           
        </footer>
    );
}
