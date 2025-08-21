'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/redux/store';
import { notFound } from 'next/navigation';
import { fetchUserById } from '@/lib/redux/features/userSlice';
import { submitRSVP } from '@/lib/redux/features/rsvpSlice';
import { toast } from 'sonner';
import Image from 'next/image';
import { Instagram, Facebook } from 'lucide-react';
import { FaInstagram, FaTwitter, FaFacebookF } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { fetchActiveHotels, selectActiveHotels } from '@/lib/redux/features/hotelSlice';

interface InvitePageProps {
  params: Promise<{
    userId: string;
  }>;
}

const InvitePage = ({ params }: InvitePageProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.selectedUser);
  const loading = useSelector((state: RootState) => state.user.loading);
  const error = useSelector((state: RootState) => state.user.error);
  const hotels = useSelector(selectActiveHotels);
  const [userId, setUserId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // RSVP Form State
  const [rsvpFormData, setRsvpFormData] = useState({
    name: "",
    email: "",
    attendance: "yes",
    numberOfGuests: 1,
    message: "",
    phone: ""
  });
  const [isSubmittingRSVP, setIsSubmittingRSVP] = useState(false);

  // Wedding Day State
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const getUserId = async () => {
      try {
        const resolvedParams = await params;
        const { userId: paramUserId } = resolvedParams;
        setUserId(paramUserId);
        await dispatch(fetchUserById(paramUserId));
        setIsInitialized(true);
      } catch (error) {
        console.error('Error resolving params:', error);
        setIsInitialized(true);
      }
    };

    getUserId();
  }, [dispatch, params]);

  useEffect(() => {
    dispatch(fetchActiveHotels());
  }, [dispatch]);

  // Countdown timer effect
  useEffect(() => {
    if (!user?.invite?.weddingEvents?.[0]?.date) return;

    const targetDate = new Date(user.invite.weddingEvents[0].date);
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user?.invite?.weddingEvents]);

  // RSVP Form Handlers
  const handleRSVPInputChange = (field: string, value: string | number) => {
    setRsvpFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRSVP(true);
    try {
      await dispatch(submitRSVP({ 
        inviteId: userId,
        userId: userId,
        name: rsvpFormData.name,
        email: rsvpFormData.email,
        numberOfGuests: rsvpFormData.numberOfGuests,
        message: rsvpFormData.message || undefined,
        attending: rsvpFormData.attendance === "yes"
      }));
      toast.success("RSVP submitted successfully!");
      setRsvpFormData({
        name: "",
        email: "",
        attendance: "yes",
        numberOfGuests: 1,
        message: "",
        phone: ""
      });
    } catch (error) {
      toast.error("Failed to submit RSVP. Please try again.");
    } finally {
      setIsSubmittingRSVP(false);
    }
  };

  // Show loading while initializing or fetching user data
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading wedding invitation...</div>
      </div>
    );
  }

  // Show error if there was an error fetching user data
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-red-500 text-xl">Error loading invitation: {error}</div>
      </div>
    );
  }

  // Check if user exists and has invite data
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">User not found</div>
      </div>
    );
  }

  // Check if invite exists and is enabled
  if (!user.invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Wedding invitation not set up yet</div>
      </div>
    );
  }

  // If invite is disabled, show not found
  if (!user.invite.isEnabled) {
    notFound();
    return null;
  }

  const { theme, about, weddingEvents, loveStory, planning, invitation } = user.invite;

  // Provide default values for theme
  const safeTheme = {
    primaryColor: theme?.primaryColor || '#212d47',
    secondaryColor: theme?.secondaryColor || '#7d88a3', 
    titleColor: theme?.titleColor || theme?.primaryColor || '#212d47',
    nameColor: theme?.nameColor || theme?.secondaryColor || '#7d88a3',
    backgroundColor: theme?.backgroundColor || '#ffffff',
    textColor: theme?.textColor || '#333333',
    buttonColor: theme?.primaryColor || '#212d47',
    buttonHoverColor: theme?.secondaryColor || '#7d88a3',
  };

  // Safe data with fallbacks
  const safeAbout = about ? {
    title: about.title || 'About Us',
    subtitle: about.subtitle || 'Our Story',
    groom: {
      name: about.groom?.name || 'Groom',
      description: about.groom?.description || 'The amazing groom',
      image: about.groom?.image || '/api/placeholder/280/360',
      socials: {
        instagram: about.groom?.socials?.instagram || '',
        facebook: about.groom?.socials?.facebook || '',
        twitter: about.groom?.socials?.twitter || ''
      }
    },
    bride: {
      name: about.bride?.name || 'Bride',
      description: about.bride?.description || 'The beautiful bride',
      image: about.bride?.image || '/api/placeholder/280/360',
      socials: {
        instagram: about.bride?.socials?.instagram || '',
        facebook: about.bride?.socials?.facebook || '',
        twitter: about.bride?.socials?.twitter || ''
      }
    },
    coupleImage: about.coupleImage || '/api/placeholder/320/240'
  } : null;

  const safeInvitation = invitation ? {
    heading: invitation.heading || 'You\'re Invited',
    subheading: invitation.subheading || 'To Our Wedding',
    message: invitation.message || 'Join us for our special day',
    backgroundImage: invitation.backgroundImage || '/api/placeholder/1920/700'
  } : null;

  const safeLoveStory = (loveStory && loveStory.length > 0) ? loveStory.map((story, index) => ({
    id: index + 1,
    title: story.title || 'Our Story',
    date: story.date || '',
    description: story.description || '',
    image: story.image || '/api/placeholder/400/300'
  })) : null;

  const safeWeddingEvents = (weddingEvents && weddingEvents.length > 0) ? weddingEvents : null;

  const safePlanning = (planning && planning.length > 0) ? planning.map((item, index) => ({
    id: index + 1,
    type: item.title || 'Event',
    date: new Date().toLocaleDateString(),
    venue: item.description || '',
    time: item.time || '02:00 PM',
    phone: item.phone || '+1 234 567 8900',
    icon: item.icon || '/api/placeholder/56/56'
  })) : null;

  const countdownItems = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  // Ensure Image src is a valid path or absolute URL; otherwise, use placeholder
  const getValidSrc = (src?: string, fallback: string = '/placeholder.svg') => {
    if (typeof src !== 'string') return fallback;
    const trimmed = src.trim();
    if (!trimmed) return fallback;
    if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return fallback;
  };

  const getVenueName = (venueId: string) => {
    const venue = hotels.find((hotel) => hotel.id === venueId);
    return venue?.name || '';
  };

  console.log(user);

  return (
    <section className="bg-black text-white">
      {/* HOME HERO SECTION */}
      {safeInvitation && (
        <section
          className="relative h-screen w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${safeInvitation.backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
            <h2 
              className="font-dancing-script text-5xl md:text-7xl mb-4" 
              style={{ color: safeTheme.titleColor }}
            >
              {safeInvitation.heading}
            </h2>
            <p 
              className="text-lg md:text-xl opacity-90" 
              style={{ color: safeTheme.nameColor }}
            >
              {safeInvitation.subheading}
            </p>
          </div>
        </section>
      )}

      {/* ABOUT SECTION */}
      {safeAbout && (
        <section className="bg-white py-16 px-6 md:px-20 text-center relative">
          <h4 className="italic text-lg mb-2" style={{ color: safeTheme.titleColor }}>
            {safeAbout.subtitle}
          </h4>
          <h2 className="text-4xl md:text-5xl font-bold mb-28" style={{ color: safeTheme.titleColor }}>
            {safeAbout.title}
          </h2>

          {/* Desktop Layout */}
          <div className="relative max-w-6xl mx-auto hidden lg:flex justify-between items-start">
            {/* Groom Section */}
            <div className="flex flex-col items-center w-[280px]">
              <div className="w-[280px] h-[360px] relative shadow-md ml-80">
                <Image src={getValidSrc(safeAbout.groom.image, '/placeholder.svg')} alt={safeAbout.groom.name} fill className="object-cover rounded" />
              </div>
              <div className="absolute left-[460px] top-[1px] text-left max-w-xs">
                <h3 className="text-xl font-semibold italic mb-1" style={{ color: safeTheme.nameColor }}>
                  {safeAbout.groom.name}
                </h3>
                <p className="text-gray-600 text-sm">{safeAbout.groom.description}</p>
                <div className="flex gap-4 mt-4 text-gray-500">
                  {safeAbout.groom.socials.instagram && (
                    <a href={safeAbout.groom.socials.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {safeAbout.groom.socials.facebook && (
                    <a href={safeAbout.groom.socials.facebook} target="_blank" rel="noopener noreferrer">
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
              <Image src={getValidSrc(safeAbout.coupleImage, '/placeholder.svg')} alt="Couple" fill className="object-cover rounded" />
            </div>
          </div>

          {/* Bride Section */}
          <div
            className="hidden lg:flex flex-col items-center w-[280px] mx-auto mt-40 relative"
            style={{
              top: `calc(55% + -20px)`,
              left: `calc(30% + -50px)`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="w-[280px] h-[360px] relative shadow-md">
              <Image src={getValidSrc(safeAbout.bride.image, '/placeholder.svg')} alt={safeAbout.bride.name} fill className="object-cover rounded" />
            </div>
            <div
              className="absolute text-left max-w-xs"
              style={{
                top: `calc(55% + 40px)`,
                left: `calc(50% + 0px - 320px)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <h3 className="text-xl font-semibold italic text-right mr-3 mb-1" style={{ color: safeTheme.nameColor }}>
                {safeAbout.bride.name}
              </h3>
              <p className="text-gray-600 text-sm">{safeAbout.bride.description}</p>
              <div className="w-full flex justify-end gap-4 mr-3 mt-4 text-gray-500">
                {safeAbout.bride.socials.instagram && (
                  <a href={safeAbout.bride.socials.instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {safeAbout.bride.socials.facebook && (
                  <a href={safeAbout.bride.socials.facebook} target="_blank" rel="noopener noreferrer">
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
                <Image src={getValidSrc(safeAbout.groom.image, '/placeholder.svg')} alt={safeAbout.groom.name} fill className="object-cover rounded" />
              </div>
              <div className="mt-6 text-center max-w-xs">
                <h3 className="text-xl font-semibold italic mb-1" style={{ color: safeTheme.nameColor }}>
                  {safeAbout.groom.name}
                </h3>
                <p className="text-gray-600 text-sm">{safeAbout.groom.description}</p>
                <div className="flex justify-center gap-4 mt-4 text-gray-500">
                  {safeAbout.groom.socials.instagram && (
                    <a href={safeAbout.groom.socials.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {safeAbout.groom.socials.facebook && (
                    <a href={safeAbout.groom.socials.facebook} target="_blank" rel="noopener noreferrer">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Couple Image */}
            <div className="w-[280px] h-[200px] shadow-2xl border-4 border-white bg-white rounded mx-auto relative">
              <Image src={getValidSrc(safeAbout.coupleImage, '/placeholder.svg')} alt="Couple" fill className="object-cover rounded" />
            </div>

            {/* Bride */}
            <div className="flex flex-col items-center w-full max-w-xs mx-auto">
              <div className="w-[280px] h-[360px] relative shadow-md mx-auto">
                <Image src={getValidSrc(safeAbout.bride.image, '/placeholder.svg')} alt={safeAbout.bride.name} fill className="object-cover rounded" />
              </div>
              <div className="mt-6 text-center max-w-xs">
                <h3 className="text-xl font-semibold italic mb-1" style={{ color: safeTheme.nameColor }}>
                  {safeAbout.bride.name}
                </h3>
                <p className="text-gray-600 text-sm">{safeAbout.bride.description}</p>
                <div className="flex justify-center gap-4 mt-4 text-gray-500">
                  {safeAbout.bride.socials.instagram && (
                    <a href={safeAbout.bride.socials.instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {safeAbout.bride.socials.facebook && (
                    <a href={safeAbout.bride.socials.facebook} target="_blank" rel="noopener noreferrer">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* WEDDING DAY SECTION */}
      {safeWeddingEvents && safeWeddingEvents.map((event, eventIndex) => (
        <section key={`event-${eventIndex}`} className="relative w-full overflow-hidden bg-white">
          <div
            className="absolute top-0 left-0 w-full h-[40%] z-0"
            style={{ backgroundColor: safeTheme.buttonColor }}
          />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
            <div className="hidden md:flex flex-col md:flex-row gap-10 items-stretch relative">
              <div className="flex-1 flex flex-col justify-center">
                <motion.h3
                  className="font-cormorant text-xl text-white mb-4 text-center md:text-left ml-52 -mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Save the Date
                </motion.h3>
                <motion.h2
                  className="font-dancing-script text-5xl md:text-5xl text-white mb-20 text-center md:text-left ml-24"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  {event.title}
                </motion.h2>

                <motion.div
                  className="flex justify-center md:justify-start items-center gap-4 sm:gap-6 -mt-4"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  {countdownItems.map(({ label, value }) => (
                    <div
                      key={label}
                      className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center w-28 sm:w-36 md:w-40 h-28 sm:h-32 md:h-36 flex flex-col justify-center -translate-y-10"
                    >
                      <div className="font-outfit font-semibold text-3xl sm:text-4xl text-[#212d47] mb-2">
                        {value.toString().padStart(2, "0")}
                      </div>
                      <div className="font-cinzel font-black text-sm sm:text-base text-[#3f3f3f] uppercase">
                        {label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {event.image && (
                <motion.div
                  className="flex-1 h-64 flex justify-end gap-6 relative z-10 overflow-visible mt-28 -mr-28"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  <div className="relative w-full h-full overflow-hidden border-4 border-white shadow-lg -translate-y-10">
                    <Image
                      src={getValidSrc(event.image, '/placeholder.svg')}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Event Details */}
            <div className="mt-8 text-center text-black">
              <p className="text-lg font-medium">{event.date} at {event.time}</p>
              <p className="text-md">{getVenueName(event.venue)}</p>
              <p className="text-sm text-gray-600">{event.description}</p>
            </div>
          </div>
        </section>
      ))}

      {/* LOVE STORY SECTION */}
      {safeLoveStory && (
        <section className="relative w-full bg-white py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <motion.h3
                className="font-cormorant font-medium text-2xl sm:text-3xl lg:text-4xl mb-4"
                style={{ color: safeTheme.titleColor }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Our Love Story
              </motion.h3>
              <motion.h2
                className="font-cormorant font-bold text-4xl sm:text-5xl lg:text-6xl"
                style={{ color: safeTheme.nameColor }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                How we met and fell in love
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
              {safeLoveStory.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  className="relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * index }}
                >
                  {index < 3 && (
                    <div className="mb-6">
                      <motion.div
                        className="font-cormorant font-medium text-xl sm:text-2xl lg:text-3xl text-[#212d47] mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        {milestone.date}
                      </motion.div>
                      <motion.h3
                        className="font-cormorant font-bold text-3xl sm:text-4xl lg:text-5xl text-[#212d47] mb-4"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        {milestone.title}
                      </motion.h3>
                      <motion.p
                        className="font-cormorant font-medium text-lg sm:text-xl lg:text-2xl text-black leading-relaxed"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        {milestone.description}
                      </motion.p>
                    </div>
                  )}

                  <motion.div
                    className="relative h-64 sm:h-80 md:h-96 w-full bg-[#d9d9d9] border border-black overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                  >
                    <Image
                      src={getValidSrc(milestone.image, '/placeholder.svg')}
                      alt={milestone.title}
                      fill
                      className="object-cover"
                    />
                  </motion.div>

                  {index >= 3 && (
                    <div className="mt-6">
                      <motion.div
                        className="font-cormorant font-medium text-xl sm:text-2xl lg:text-3xl text-[#212d47] mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        {milestone.date}
                      </motion.div>
                      <motion.h3
                        className="font-cormorant font-bold text-3xl sm:text-4xl lg:text-5xl text-[#212d47] mb-4"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        {milestone.title}
                      </motion.h3>
                      <motion.p
                        className="font-cormorant font-medium text-lg sm:text-xl lg:text-2xl text-black leading-relaxed"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        {milestone.description}
                      </motion.p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PLANNING SECTION */}
      {safePlanning && (
        <section className="relative w-full bg-white py-16 sm:py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              <div className="w-full lg:w-1/2 flex flex-col space-y-8 items-center lg:items-start text-center lg:text-left">
                <div>
                  <motion.h3
                    className="font-cormorant text-2xl sm:text-3xl lg:text-4xl text-black mb-2 uppercase"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    Wedding Planning
                  </motion.h3>
                  <motion.h2
                    className="font-cormorant font-bold text-4xl sm:text-5xl lg:text-6xl text-[#212d47]"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    Our Journey
                  </motion.h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full justify-items-center lg:justify-items-start">
                  {safePlanning.map((event, index) => (
                    <motion.div
                      key={event.id}
                      className="flex flex-col gap-2.5 items-center lg:items-start text-center lg:text-left"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                    >
                      <div className="h-14 w-14 relative rounded-full overflow-hidden bg-[#212d47]">
                        <Image
                          src={getValidSrc(event.icon, '/placeholder.svg')}
                          alt={event.type}
                          fill
                          className="object-contain bg-white"
                        />
                      </div>

                      <h3 className="font-cormorant font-bold text-lg sm:text-xl text-[#212d47]">
                        {event.type}
                      </h3>
                      <p className="font-cormorant font-medium text-sm text-black">{event.date}</p>
                      <p className="font-cormorant font-semibold text-sm text-[#212d47] leading-relaxed">
                        {getVenueName(event.venue)}
                      </p>
                      <p className="font-cormorant font-semibold text-sm text-[#212d47]">
                        {event.time}
                      </p>
                      <p className="font-cormorant font-medium text-sm text-black">{event.phone}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Map placeholder */}
              <motion.div
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] w-full rounded-[20px] overflow-hidden bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500 text-lg">Map will be displayed here</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* RSVP SECTION */}
      <section
        className="relative w-full h-[700px] bg-cover bg-right bg-no-repeat mb-10"
        style={{ backgroundImage: `url('${safeInvitation?.backgroundImage || '/api/placeholder/1920/700'}')` }}
      >
        <div className="absolute inset-0" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="p-8 rounded-lg shadow-none -mt-7">
            <h4 className="font-dancing-script text-xl text-[#333] mb-2 italic">
              Invitation
            </h4>
            <h2 className="text-4xl font-bold text-[#212d47] mb-8">
              Will You Attend?
            </h2>

            <form className="space-y-5" onSubmit={handleRSVPSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={rsvpFormData.name}
                onChange={(e) => handleRSVPInputChange('name', e.target.value)}
                required
                className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-[#212d47] placeholder-gray-700 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={rsvpFormData.email}
                onChange={(e) => handleRSVPInputChange('email', e.target.value)}
                required
                className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-[#212d47] placeholder-gray-700 focus:outline-none"
              />

              <div className="flex items-center gap-6 text-sm text-[#212d47]">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="attendance"
                    value="yes"
                    checked={rsvpFormData.attendance === "yes"}
                    onChange={(e) => handleRSVPInputChange('attendance', e.target.value)}
                  />
                  Yes, I will come
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="attendance"
                    value="no"
                    checked={rsvpFormData.attendance === "no"}
                    onChange={(e) => handleRSVPInputChange('attendance', e.target.value)}
                  />
                  Sorry, I can't come
                </label>
              </div>

              {rsvpFormData.attendance === "yes" && (
                <>
                  <input
                    type="number"
                    placeholder="Number of Guests"
                    value={rsvpFormData.numberOfGuests}
                    onChange={(e) => handleRSVPInputChange('numberOfGuests', parseInt(e.target.value))}
                    min="1"
                    className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-[#212d47] placeholder-gray-700 focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number (Optional)"
                    value={rsvpFormData.phone}
                    onChange={(e) => handleRSVPInputChange('phone', e.target.value)}
                    className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-[#212d47] placeholder-gray-700 focus:outline-none"
                  />
                </>
              )}

              <textarea
                placeholder="Message for the Couple"
                value={rsvpFormData.message}
                onChange={(e) => handleRSVPInputChange('message', e.target.value)}
                className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-[#212d47] placeholder-gray-700 focus:outline-none resize-none"
                rows={3}
              />

              <button
                type="submit"
                className="mt-4 px-6 py-2 bg-[#7d88a3] text-white font-semibold rounded-md hover:bg-[#5a6480] transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmittingRSVP}
              >
                {isSubmittingRSVP ? 'Submitting...' : 'Submit RSVP'}
              </button>
            </form>
          </div>

          <div className="hidden md:block" />
        </div>
      </section>

      {/* FOOTER SECTION */}
      {safeAbout && safeInvitation && (
        <footer className="relative bg-white/60 backdrop-blur-md text-center text-[#212d47] py-12 px-4">
          <div className="absolute inset-0 -z-10 opacity-20">
            <Image
              src={getValidSrc(safeInvitation.backgroundImage, '/placeholder.svg')}
              alt="Footer background"
              fill
              className="object-cover"
            />
          </div>

          <h2 className="font-dancing-script text-3xl sm:text-4xl text-[#212d47] mb-1">
            {`${safeAbout.groom.name} & ${safeAbout.bride.name}`}
          </h2>
          <p className="text-sm text-[#555] italic mb-6">
            {safeInvitation.subheading}
          </p>

          <div className="h-px bg-gray-300 w-3/4 mx-auto my-6" />

          <div className="flex justify-center items-center gap-6 text-[#212d47] mb-6 text-xl">
            {(safeAbout.groom.socials.instagram || safeAbout.bride.socials.instagram) && (
              <a 
                href={safeAbout.groom.socials.instagram || safeAbout.bride.socials.instagram || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram" 
                className="hover:text-pink-600 transition"
              >
                <FaInstagram />
              </a>
            )}
            {(safeAbout.groom.socials.twitter || safeAbout.bride.socials.twitter) && (
              <a 
                href={safeAbout.groom.socials.twitter || safeAbout.bride.socials.twitter || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Twitter" 
                className="hover:text-blue-400 transition"
              >
                <FaTwitter />
              </a>
            )}
            {(safeAbout.groom.socials.facebook || safeAbout.bride.socials.facebook) && (
              <a 
                href={safeAbout.groom.socials.facebook || safeAbout.bride.socials.facebook || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook" 
                className="hover:text-blue-600 transition"
              >
                <FaFacebookF />
              </a>
            )}
          </div>
        </footer>
      )}

      {/* Fallback message if no data is available */}
      {!safeInvitation && !safeAbout && (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Wedding Invitation</h1>
            <p className="text-gray-600">This invitation is being prepared. Please check back soon!</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default InvitePage;