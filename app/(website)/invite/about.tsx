'use client';

import Image from 'next/image';
import { Instagram, Facebook } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { notFound } from 'next/navigation';

export default function AboutPage() {
    const auth = useSelector((state: RootState) => state.auth.auth);
    const user = useSelector((state: RootState) => state.user.users.find(u => auth && u.id === auth.id));
    
    if (!user?.invite?.isEnabled || !user.invite.about || !user.invite.theme) {
        return notFound();
    }

    const { about } = user.invite;
    const { theme } = user.invite;

    return (
        <section className="bg-white py-16 px-6 md:px-20 text-center relative">
            <h4 className="italic text-lg mb-2" style={{ color: theme.titleColor }}>
                {about.subtitle}
            </h4>
            <h2 className="text-4xl md:text-5xl font-bold mb-28" style={{ color: theme.titleColor }}>
                {about.title}
            </h2>

            {/* Desktop/Large Screen Layout */}
            <div className="relative max-w-6xl mx-auto hidden lg:flex justify-between items-start">
                {/* Groom Section */}
                <div className="flex flex-col items-center w-[280px]">
                    <div className="w-[280px] h-[360px] relative shadow-md ml-80">
                        <Image src={about.groom.image} alt={about.groom.name} fill className="object-cover rounded" />
                    </div>
                    <div className="absolute left-[460px] top-[1px] text-left max-w-xs">
                        <h3 className="text-xl font-semibold italic mb-1" style={{ color: theme.nameColor }}>
                            {about.groom.name}
                        </h3>
                        <p className="text-gray-600 text-sm">{about.groom.description}</p>
                        <div className="flex gap-4 mt-4 text-gray-500">
                            {about.groom.socials.instagram && (
                                <a href={about.groom.socials.instagram} target="_blank" rel="noopener noreferrer">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {about.groom.socials.facebook && (
                                <a href={about.groom.socials.facebook} target="_blank" rel="noopener noreferrer">
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
                    <Image src={about.coupleImage} alt="Couple" fill className="object-cover rounded" />
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
                    <Image src={about.bride.image} alt={about.bride.name} fill className="object-cover rounded" />
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
                        {about.bride.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{about.bride.description}</p>
                    <div className="w-full flex justify-end gap-4 mr-3 mt-4 text-gray-500">
                        {about.bride.socials.instagram && (
                            <a href={about.bride.socials.instagram} target="_blank" rel="noopener noreferrer">
                                <Instagram className="w-5 h-5" />
                            </a>
                        )}
                        {about.bride.socials.facebook && (
                            <a href={about.bride.socials.facebook} target="_blank" rel="noopener noreferrer">
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
                        <Image src={about.groom.image} alt={about.groom.name} fill className="object-cover rounded" />
                    </div>
                    <div className="mt-6 text-center max-w-xs">
                        <h3 className="text-xl font-semibold italic mb-1" style={{ color: theme.nameColor }}>
                            {about.groom.name}
                        </h3>
                        <p className="text-gray-600 text-sm">{about.groom.description}</p>
                        <div className="flex justify-center gap-4 mt-4 text-gray-500">
                            {about.groom.socials.instagram && (
                                <a href={about.groom.socials.instagram} target="_blank" rel="noopener noreferrer">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {about.groom.socials.facebook && (
                                <a href={about.groom.socials.facebook} target="_blank" rel="noopener noreferrer">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Couple Image */}
                <div className="w-[280px] h-[200px] shadow-2xl border-4 border-white bg-white rounded mx-auto">
                    <Image src={about.coupleImage} alt="Couple" fill className="object-cover rounded" />
                </div>

                {/* Bride */}
                <div className="flex flex-col items-center w-full max-w-xs mx-auto">
                    <div className="w-[280px] h-[360px] relative shadow-md mx-auto">
                        <Image src={about.bride.image} alt={about.bride.name} fill className="object-cover rounded" />
                    </div>
                    <div className="mt-6 text-center max-w-xs">
                        <h3 className="text-xl font-semibold italic mb-1" style={{ color: theme.nameColor }}>
                            {about.bride.name}
                        </h3>
                        <p className="text-gray-600 text-sm">{about.bride.description}</p>
                        <div className="flex justify-center gap-4 mt-4 text-gray-500">
                            {about.bride.socials.instagram && (
                                <a href={about.bride.socials.instagram} target="_blank" rel="noopener noreferrer">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {about.bride.socials.facebook && (
                                <a href={about.bride.socials.facebook} target="_blank" rel="noopener noreferrer">
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


