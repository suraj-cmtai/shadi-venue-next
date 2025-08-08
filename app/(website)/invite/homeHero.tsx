'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';

export default function HomeHero() {
    const wedding = useSelector((state: RootState) => state.wedding);

    if (!wedding) return null; // or show a fallback/loading

    const { theme, invite } = wedding;

    return (
        <section className="relative h-[480px] bg-gray-100 text-white flex flex-col items-center justify-center px-4 text-center overflow-visible">
            <div className="absolute inset-0 w-full h-full flex">
                <div className="relative w-1/2 h-full">
                    <Image
                        src={invite.leftImage}
                        alt="Left Background"
                        fill
                        className="object-cover"
                        sizes="50vw"
                        priority
                    />
                </div>

                <div className="relative w-1/2 h-full">
                    <Image
                        src={invite.rightImage}
                        alt="Right Background"
                        fill
                        className="object-cover"
                        sizes="50vw"
                        priority
                    />
                </div>

                <div className="absolute inset-0 z-[5]"></div>
            </div>

            <div className="relative z-20 mt-10">
                <h1 className="text-2xl md:text-3xl mb-4" style={{ color: theme.titleColor }}>
                    {invite.title}
                </h1>
                <p className="text-2xl md:text-6xl font-bold mb-8" style={{ color: theme.nameColor }}>
                    {invite.names}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href={invite.linkHref}
                        className="text-black font-semibold px-6 py-3 rounded-md transition"
                        style={{
                            backgroundColor: theme.buttonColor,
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = theme.buttonHoverColor)
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = theme.buttonColor)
                        }
                    >
                        {invite.linkText}
                    </Link>
                </div>
            </div>
        </section>
    );
}
