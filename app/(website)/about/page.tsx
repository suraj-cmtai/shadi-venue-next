'use client';

import AboutHero from './aboutHero';
import About from './about';
import TeamSection from './team';
import ContactUs from './contact-us';
import GetInTouch from '@/components/(website)/home/GetInTouch';

const AboutPage = () => {
    return (
        <section className="bg-black text-white">
            <AboutHero />
            <div className="mt-[-2px]">
                <About />
            </div>
            <TeamSection />
            <GetInTouch />
        </section>
    );
};

export default AboutPage;
