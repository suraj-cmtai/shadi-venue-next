'use client';

import HotelHero from './hero';
import About from './about'
import OurRooms from './roomCards';
import HotelRooms from "./hotelRooms"
import HotelGallery from "./hotel-gallery"
import BookingPage from './hotel-booking';

// import WeddingSection from './weddingSection';

const AboutPage = () => {
    return (
        <section className="">
            <HotelHero />
            <About />
            <OurRooms />
            <HotelRooms/>
            <HotelGallery/>
            <BookingPage/>
        </section>
    );
};

export default AboutPage;
