'use client';

import Image from 'next/image';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

interface Person {
  name: string;
  description: string;
  image: string;
  socials: SocialLinks;
}

interface AboutPageProps {
  title: string;
  subtitle: string;
  groom: Person;
  bride: Person;
  coupleImage: string;
  theme: {
    titleColor: string;
    nameColor: string;
    buttonColor: string;
    buttonHoverColor: string;
  };
}

export default function AboutPage({
  title,
  subtitle,
  groom,
  bride,
  coupleImage,
  theme
}: AboutPageProps) {
  return (
        <section className="bg-white py-16 px-6 md:px-20 text-center relative">
            <h4 className="italic text-lg mb-2" style={{ color: theme.titleColor }}>
                {subtitle}
            </h4>
            <h2 className="text-4xl md:text-5xl font-bold mb-28" style={{ color: theme.titleColor }}>
                {title}
            </h2>

            {/* Desktop/Large Screen Layout */}
            <div className="relative max-w-6xl mx-auto hidden lg:flex justify-between items-start">
                {/* Groom Section */}
                <div className="flex flex-col items-center w-[280px]">
                    <div className="w-[280px] h-[360px] relative shadow-md ml-80">
                        <Image src={groom.image} alt={groom.name} fill className="object-cover rounded" />
                    </div>
                    <div className="absolute left-[460px] top-[1px] text-left max-w-xs">
                        <h3 className="text-xl font-semibold italic mb-1" style={{ color: theme.nameColor }}>
                            {groom.name}
                        </h3>
                        <p className="text-gray-600 text-sm">{groom.description}</p>
                        <div className="flex gap-4 mt-4 text-gray-500">
                            {groom.socials.instagram && (
                                <a href={groom.socials.instagram} target="_blank" rel="noopener noreferrer">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {groom.socials.facebook && (
                                <a href={groom.socials.facebook} target="_blank" rel="noopener noreferrer">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Couple Center Image */}
                <div
                    className="absolute w-[320px] h-[240px] shadow-2xl border-4 border-white z-10 bg-white rounded"
                    style={{
                        top: `calc(98% + -30px)`,
                        left: `calc(50% + -50px)`,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <Image src={coupleImage} alt="Couple" fill className="object-cover rounded" />
                </div>
            </div>

            {/* Bride Section (floating right) */}
            <div
                className="hidden lg:flex flex-col items-center w-[280px] mx-auto mt-40 relative"
                style={{
                    top: `calc(55% + -20px)`,
                    left: `calc(30% + -50px)`,
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <div className="w-[280px] h-[360px] relative shadow-md">
                    <Image src={bride.image} alt={bride.name} fill className="object-cover rounded" />
                </div>
                <div
                    className="absolute text-left max-w-xs"
                    style={{
                        top: `calc(55% + 40px)`,
                        left: `calc(50% + 0px - 320px)`,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <h3 className="text-xl font-semibold italic text-right mr-3 mb-1" style={{ color: theme.nameColor }}>
                        {bride.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{bride.description}</p>
                    <div className="w-full flex justify-end gap-4 mr-3 mt-4 text-gray-500">
                        {bride.socials.instagram && (
                            <a href={bride.socials.instagram} target="_blank" rel="noopener noreferrer">
                                <Instagram className="w-5 h-5" />
                            </a>
                        )}
                        {bride.socials.facebook && (
                            <a href={bride.socials.facebook} target="_blank" rel="noopener noreferrer">
                                <Facebook className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex flex-col gap-16 items-center lg:hidden">
                {/* Groom */}
                <div className="flex flex-col items-center w-full max-w-xs mx-auto">
                    <div className="w-[280px] h-[360px] relative shadow-md mx-auto">
                        <Image src={groom.image} alt={groom.name} fill className="object-cover rounded" />
                    </div>
                    <div className="mt-6 text-center max-w-xs">
                        <h3 className="text-xl font-semibold italic mb-1" style={{ color: theme.nameColor }}>
                            {groom.name}
                        </h3>
                        <p className="text-gray-600 text-sm">{groom.description}</p>
                        <div className="flex justify-center gap-4 mt-4 text-gray-500">
                            {groom.socials.instagram && (
                                <a href={groom.socials.instagram} target="_blank" rel="noopener noreferrer">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {groom.socials.facebook && (
                                <a href={groom.socials.facebook} target="_blank" rel="noopener noreferrer">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Couple Image */}
                <div className="w-[280px] h-[200px] shadow-2xl border-4 border-white bg-white rounded mx-auto">
                    <Image src={coupleImage} alt="Couple" fill className="object-cover rounded" />
                </div>

                {/* Bride */}
                <div className="flex flex-col items-center w-full max-w-xs mx-auto">
                    <div className="w-[280px] h-[360px] relative shadow-md mx-auto">
                        <Image src={bride.image} alt={bride.name} fill className="object-cover rounded" />
                    </div>
                    <div className="mt-6 text-center max-w-xs">
                        <h3 className="text-xl font-semibold italic mb-1" style={{ color: theme.nameColor }}>
                            {bride.name}
                        </h3>
                        <p className="text-gray-600 text-sm">{bride.description}</p>
                        <div className="flex justify-center gap-4 mt-4 text-gray-500">
                            {bride.socials.instagram && (
                                <a href={bride.socials.instagram} target="_blank" rel="noopener noreferrer">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {bride.socials.facebook && (
                                <a href={bride.socials.facebook} target="_blank" rel="noopener noreferrer">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}


