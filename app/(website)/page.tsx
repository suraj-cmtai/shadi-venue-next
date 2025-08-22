"use client";
import Hero from '@/components/(website)/home/Hero'
import HeroExtension from '@/components/(website)/home/HeroExtension'
import AllLogos from '@/components/(website)/home/AllLogos'
import About from '@/components/(website)/home/About'
import Venue from '@/components/(website)/home/Venue'
import VideoSection from '@/components/(website)/home/VideoSection'
import Hotels from '@/components/(website)/home/Hotels'
import Award from '@/components/(website)/home/Award'
import React from 'react'
import Wedding from '@/components/(website)/home/Wedding'
import Gallery from '@/components/(website)/home/Gallery'
import Testimonials from '@/components/(website)/home/Testimonials'
import Offer from '@/components/(website)/home/Offer'
import Blog from '@/components/(website)/home/Blog'
import GetInTouch from '@/components/(website)/home/GetInTouch'
import HotelByCity from '@/components/(website)/home/HotelByCity'

const HomePage = () => {
  return (
   <>
   <Hero />
   <HeroExtension />
   <AllLogos />
   <HotelByCity />
   <About />
   {/* <Venue /> */}
   <VideoSection />
   <Hotels />
   <Award />
   <Wedding />
   <Gallery />
   <Blog />
   <Testimonials />
   <GetInTouch />
   <Offer />
   </>
  )
}

export default HomePage