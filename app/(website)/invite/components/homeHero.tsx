'use client';

import Image from 'next/image';

interface HomeHeroProps {
  title: string;
  subtitle: string;
  background: string;
  theme: {
    titleColor: string;
    nameColor: string;
    buttonColor: string;
    buttonHoverColor: string;
  };
}

export default function HomeHero({ title, subtitle, background, theme }: HomeHeroProps) {
  return (
    <section
      className="relative h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
        <h2 
          className="font-dancing-script text-5xl md:text-7xl mb-4" 
          style={{ color: theme.titleColor }}
        >
          {title}
        </h2>
        <p 
          className="text-lg md:text-xl opacity-90" 
          style={{ color: theme.nameColor }}
        >
          {subtitle}
        </p>
      </div>
    </section>
  );

}