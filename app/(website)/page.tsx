"use client";

import React, { Suspense } from "react";
import Hero from '@/components/(website)/home/Hero'
import HeroExtension from '@/components/(website)/home/HeroExtension'
import AllLogos from '@/components/(website)/home/AllLogos'
import About from '@/components/(website)/home/About'
import Process from "@/components/(website)/home/Process";
import VideoSection from '@/components/(website)/home/VideoSection'
import Hotels from '@/components/(website)/home/Hotels'
import Award from '@/components/(website)/home/Award'
import Wedding from '@/components/(website)/home/Wedding'
import Gallery from '@/components/(website)/home/Gallery'
import Testimonials from '@/components/(website)/home/Testimonials'
import Offer from '@/components/(website)/home/Offer'
import Blog from '@/components/(website)/home/Blog'
import GetInTouch from '@/components/(website)/home/GetInTouch'
import HotelByCity from '@/components/(website)/home/HotelByCity'
import Loading from "../loading"
import Vendor from "@/components/(website)/home/Vendor";
import VendorsByCity from "@/components/(website)/home/VendorByCity";


const HomePage = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Hero />
      <HeroExtension />
      <AllLogos />
      <HotelByCity />
      <VendorsByCity />
      <About />
      <VideoSection />
      <Hotels />
      <Vendor />
      <Process />
      <Award />
      <Wedding />
      <Gallery />
      <Blog />
      <Testimonials />
      <GetInTouch />
      <Offer />
    </Suspense>
  );
};

export default HomePage;