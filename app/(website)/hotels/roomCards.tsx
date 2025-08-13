'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import Link from 'next/link'

const rooms = [
    { id: '1', name: 'Double Room', price: '$150', image: '/images/rooms/room1.jpg' },
    { id: '2', name: 'Deluxe Room', price: '$190', image: '/images/rooms/room2.jpg' },
    { id: '3', name: 'Superior Room', price: '$240', image: '/images/rooms/room3.jpg' },
    { id: '4', name: 'Premium Suite', price: '$300', image: '/images/rooms/room4.jpg' },
    { id: '5', name: 'Executive Room', price: '$270', image: '/images/rooms/room5.jpg' },
]


const features = [
    {
        image: "/images/hotels/icons/bathroom.png",
        title: "Large Bath Room",
        desc: "Enjoy a spacious, elegant bath area designed for comfort, relaxation, and everyday luxury.",
    },
    {
        image: "/images/hotels/icons/wifi.png",
        title: "High Speed Wifi",
        desc: "Stay connected seamlessly with fast, reliable internet available throughout your entire stay.",
    },
    {
        image: "/images/hotels/icons/ac.png",
        title: "Air Condition",
        desc: "Experience perfect room climate with quiet, efficient air conditioning for ultimate comfort.",
    },
    {
        image: "/images/hotels/icons/wm.png",
        title: "Wahsing Machine",
        desc: "Convenient in-room washer lets you clean clothes easily during longer or busy stays.",
    },
];

export default function OurRooms() {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 400
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            })
        }
    }

    return (
        <div className="relative bg-[#fefcf9] py-12 sm:py-20">
            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4">
                <h2 className="text-2xl sm:text-4xl font-bold mb-8 sm:mb-12 text-gray-800 text-center sm:text-left">
                    Our Rooms
                </h2>

                {/* Navigation Buttons (Hidden on mobile) */}
                <div className="absolute left-2 sm:left-4 top-[40%] sm:top-[50%] z-20 hidden md:block">
                    <button
                        onClick={() => scroll('left')}
                        className="bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-sm"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>
                <div className="absolute right-2 sm:right-4 top-[40%] sm:top-[50%] z-20 hidden md:block">
                    <button
                        onClick={() => scroll('right')}
                        className="bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full shadow-sm"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Scrollable Room Cards */}
                <div
                    ref={scrollRef}
                    className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
                >
                    {rooms.map((room) => (
                        <Link
                            key={room.id}
                            href={`/hotels/${room.id}`}
                            className="relative w-[250px] sm:w-[350px] min-w-[250px] sm:min-w-[350px] h-[350px] sm:h-[450px] rounded-2xl overflow-hidden shadow-sm group flex-shrink-0"
                        >
                            <Image
                                src={room.image}
                                alt={room.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />
                            <div className="absolute bottom-4 left-4 z-20 text-white">
                                <p className="text-xs sm:text-sm uppercase tracking-wide font-medium">
                                    From {room.price}/night
                                </p>
                                <h3 className="text-lg sm:text-xl font-semibold">{room.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Facilities */}
            <div className="bg-[#fefcf9] py-10 sm:py-12">
                <h2 className='text-[#000] text-2xl sm:text-4xl font-bold text-center mt-4 sm:mt-8 mb-6'>Main Facilities</h2>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-center divide-y md:divide-y-0 md:divide-x divide-gray-300">
                        {features.map((item, index) => (
                            <div key={index} className="flex flex-col items-center space-y-2 sm:space-y-4 px-2 sm:px-4 py-4 md:py-0">
                                <div className="w-[60px] h-[50px] sm:w-[100px] sm:h-[80px] relative">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        sizes="80px, (min-width: 640px) 128px"
                                        className="object-contain"
                                    />
                                </div>
                                <h4 className="text-black text-sm sm:text-xl font-bold">{item.title}</h4>
                                <p className="font-cormorant text-xs sm:text-xl text-[#888] text-center">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollbar Hide CSS */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}
