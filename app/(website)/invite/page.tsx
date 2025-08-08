'use client';

import HomeHero from './homeHero';
import About from "./about";
import WeddingDay from './wedding-day';
import LoveStory from './love-story';
import Planning from './planning';
import Invitation from './invitation';
import WedFooter from './wed-footer';

// import WeddingSection from './weddingSection';

const AboutPage = () => {
    return (
        <section className="bg-black text-white">
            <HomeHero />
            <About />
            <WeddingDay/>
            <LoveStory/>
            <Planning/>
            <Invitation/>
            <WedFooter/>
        </section>
    );
};

export default AboutPage;
