"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { notFound } from "next/navigation";
import { fetchUserById } from "@/lib/redux/features/userSlice";
import { fetchHotelById } from "@/lib/redux/features/hotelSlice";

import { submitRSVP } from "@/lib/redux/features/rsvpSlice";
import { toast } from "sonner";
import Image from "next/image";
import {
  Instagram,
  Facebook,
  Twitter,
  MapPin,
  Calendar,
  Clock,
  Heart,
  Star,
} from "lucide-react";
import { FaInstagram, FaTwitter, FaFacebookF } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// --- Hotel interface for venue details ---
export interface Hotel {
  id: string;
  name: string;
  category: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  priceRange: {
    startingPrice: number;
    currency: 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR';
  };
  rating: number;
  status: 'active' | 'draft' | 'archived';
  description: string;
  amenities: string[];
  rooms: {
    type: string;
    capacity: number;
    pricePerNight: number;
    available: number;
  }[];
  images: string[];
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
  };
  createdAt: string;
  updatedAt: string;
  googleLocation?: string;
  isPremium?: boolean;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  venueType?: string;
  position?: string;
  websiteLink?: string;
  offerWeddingPackages?: 'Yes' | 'No';
  resortCategory?: string;
  weddingPackagePrice?: string;
  servicesOffered?: string[];
  maxGuestCapacity?: string;
  numberOfRooms?: string;
  venueAvailability?: string;
  allInclusivePackages?: ('Yes' | 'No' | 'Partially')[];
  staffAccommodation?: ('Yes' | 'No' | 'Limited')[];
  diningOptions?: string[];
  otherAmenities?: string[];
  bookingLeadTime?: string;
  preferredContactMethod?: string[];
  weddingDepositRequired?: string;
  refundPolicy?: string;
  referralSource?: string;
  partnershipInterest?: string;
  uploadResortPhotos?: string[];
  uploadMarriagePhotos?: string[];
  uploadWeddingBrochure?: string[];
  uploadCancelledCheque?: string[];
  agreeToTerms?: boolean;
  agreeToPrivacy?: boolean;
  signature?: string;
}

// Helper to check if a string is a valid absolute or root-relative URL for Next.js Image
function getSafeImageUrl(url: string | undefined, fallback: string): string {
  if (!url || typeof url !== "string") return fallback;
  // Accept root-relative, protocol-relative, or absolute URLs
  if (
    url.startsWith("/") ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:image")
  ) {
    return url;
  }
  // If it's a relative path (e.g. "images/foo.jpg"), prepend slash
  if (!url.startsWith("/")) {
    return "/" + url;
  }
  // Fallback
  return fallback;
}

interface InvitePageProps {
  params: Promise<{
    userId: string;
  }>;
}

// --- VenueDetails type for local state ---
type VenueDetails = {
  address?: string;
  googleLocation?: string;
  name?: string;
};

const InvitePage = ({ params }: InvitePageProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.selectedUser);
  const loading = useSelector((state: RootState) => state.user.loading);
  const error = useSelector((state: RootState) => state.user.error);

  // Venue details for each event
  const [venueDetails, setVenueDetails] = useState<VenueDetails[]>([]);

  const [userId, setUserId] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // RSVP Form State
  const [rsvpFormData, setRsvpFormData] = useState({
    name: "",
    email: "",
    attendance: "yes",
    numberOfGuests: 1,
    message: "",
    phone: "",
    selectedEvents: [] as number[], // store event indices
  });
  const [isSubmittingRSVP, setIsSubmittingRSVP] = useState(false);

  // Wedding Day State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Gallery State
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);
  // Timeline image load state to avoid rendering before data on small screens
  const [timelineLoaded, setTimelineLoaded] = useState<Record<number, boolean>>({});

  // Fetch user and wedding event venue details
  useEffect(() => {
    const getUserId = async () => {
      try {
        const resolvedParams = await params;
        const { userId: paramUserId } = resolvedParams;
        setUserId(paramUserId);
        await dispatch(fetchUserById(paramUserId));
        setIsInitialized(true);
      } catch (error) {
        console.error("Error resolving params:", error);
        setIsInitialized(true);
      }
    };

    getUserId();
  }, [dispatch, params]);

  // Fetch venue details for each event
  useEffect(() => {
    const fetchVenues = async () => {
      if (
        user &&
        user.invite &&
        Array.isArray(user.invite.weddingEvents) &&
        user.invite.weddingEvents.length > 0
      ) {
        const venues: VenueDetails[] = await Promise.all(
          user.invite.weddingEvents.map(async (event) => {
            // If event.venue is an id, fetch details, else if it's an object, use directly
            if (typeof event.venue === "string" && event.venue) {
              try {
                // fetchHotelById returns a thunk, so we need to dispatch and get the result
                const result = await dispatch(fetchHotelById(event.venue));
                // result.payload should have the hotel details
                const hotel: Hotel | undefined = (result as any).payload;
                if (hotel) {
                  return {
                    address: hotel.location?.address || "",
                    googleLocation: hotel.googleLocation || "",
                    name: hotel.name || "",
                  };
                }
              } catch (e) {
                return { address: "", googleLocation: "", name: "" };
              }
            } else if (
              typeof event.venue === "object" &&
              event.venue !== null
            ) {
              // Defensive: event.venue may not be Hotel, but try to extract
              return {
                address:
                  (event.venue as any).address ||
                  (event.venue as any).location?.address ||
                  "",
                googleLocation: (event.venue as any).googleLocation || "",
                name: (event.venue as any).name || "",
              };
            }
            return { address: "", googleLocation: "", name: "" };
          })
        );
        setVenueDetails(venues);
      } else {
        setVenueDetails([]);
      }
    };
    fetchVenues();
    // Only run when user.invite.weddingEvents changes
  }, [dispatch, user?.invite?.weddingEvents]);

  // Countdown timer effect
  useEffect(() => {
    if (
      !user ||
      !user.invite ||
      !Array.isArray(user.invite.weddingEvents) ||
      !user.invite.weddingEvents[selectedEventIndex] ||
      !user.invite.weddingEvents[selectedEventIndex].date
    )
      return;

    // Calculate the distance using the user's local time in "en-IN" (India Standard Time)
    const targetDate = new Date(
      new Date(user.invite.weddingEvents[selectedEventIndex].date)
    );
    const timer = setInterval(() => {
      const now = new Date(
        new Date().toLocaleString("en-IN")
      ).getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user?.invite?.weddingEvents, selectedEventIndex, user]);

  // Auto-rotate gallery images
  useEffect(() => {
    if (!user?.invite?.loveStory?.length) return;

    const interval = setInterval(() => {
      setSelectedImageIndex(
        (prev) => (prev + 1) % (user?.invite?.loveStory?.length || 1)
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.invite?.loveStory]);

  // RSVP Form Handlers
  const handleRSVPInputChange = (field: string, value: string | number | number[]) => {
    setRsvpFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle event selection for RSVP
  const handleEventCheckboxChange = (eventIndex: number) => {
    setRsvpFormData((prev) => {
      const selected = prev.selectedEvents.includes(eventIndex)
        ? prev.selectedEvents.filter((i) => i !== eventIndex)
        : [...prev.selectedEvents, eventIndex];
      return { ...prev, selectedEvents: selected };
    });
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingRSVP(true);
    try {
      // Compose message with selected events
      let eventMsg = "";
      if (
        Array.isArray(rsvpFormData.selectedEvents) &&
        rsvpFormData.selectedEvents.length > 0 &&
        Array.isArray(user?.invite?.weddingEvents)
      ) {
        eventMsg =
          "\nEvents to attend: " +
          rsvpFormData.selectedEvents
            .map(
              (idx) =>
                user.invite!.weddingEvents[idx]?.title ||
                `Event ${idx + 1}`
            )
            .join(", ");
      }
      await dispatch(
        submitRSVP({
          inviteId: userId,
          userId: userId,
          name: rsvpFormData.name,
          email: rsvpFormData.email,
          numberOfGuests: rsvpFormData.numberOfGuests,
          message:
            (rsvpFormData.message ? rsvpFormData.message + "\n" : "") +
            eventMsg,
          attending: rsvpFormData.attendance === "yes",
          phone: rsvpFormData.phone,
        })
      );
      toast.success("RSVP submitted successfully!");
      setRsvpFormData({
        name: "",
        email: "",
        attendance: "yes",
        numberOfGuests: 1,
        message: "",
        phone: "",
        selectedEvents: [],
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <div className="text-gray-700 text-xl">
            Loading wedding invitation...
          </div>
        </div>
      </div>
    );
  }

  // Show error if there was an error fetching user data
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            ⚠️ Error loading invitation
          </div>
          <div className="text-red-400">{error}</div>
        </div>
      </div>
    );
  }

  // Check if user exists and has invite data
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-gray-500 text-xl">👤 User not found</div>
          <p className="text-gray-400 mt-2">Please check the invitation link</p>
        </div>
      </div>
    );
  }

  // Check if invite exists and is enabled
  if (!user.invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-gray-500 text-xl">
            💒 Wedding invitation not set up yet
          </div>
          <p className="text-gray-400 mt-2">
            The couple is still preparing their invitation
          </p>
        </div>
      </div>
    );
  }

  // If invite is disabled, show not found
  if (!user.invite.isEnabled) {
    notFound();
    return null;
  }

  const { theme, about, weddingEvents, loveStory, planning, invitation } =
    user.invite;

  // Enhanced theme with fallbacks
  const safeTheme = {
    primaryColor: theme?.primaryColor || "#2c5282",
    secondaryColor: theme?.secondaryColor || "#63b3ed",
    titleColor: theme?.titleColor || theme?.primaryColor || "#2c5282",
    nameColor: theme?.nameColor || theme?.secondaryColor || "#63b3ed",
    backgroundColor: theme?.backgroundColor || "#ffffff",
    textColor: theme?.textColor || "#2d3748",
    buttonColor: theme?.primaryColor || "#2c5282",
    buttonHoverColor: theme?.secondaryColor || "#63b3ed",
  };

  // Enhanced safe data with more comprehensive fallbacks
  const safeAbout = about
    ? {
      title: about.title || "About Us",
      subtitle: about.subtitle || "Our Story",
      groom: {
        name: about.groom?.name || "Groom",
        description:
          about.groom?.description ||
          "The amazing groom who brings joy and laughter to every moment.",
        image: getSafeImageUrl(
          about.groom?.image,
          "/api/placeholder/280/360"
        ),
        socials: {
          instagram: about.groom?.socials?.instagram || "",
          facebook: about.groom?.socials?.facebook || "",
          twitter: about.groom?.socials?.twitter || "",
        },
      },
      bride: {
        name: about.bride?.name || "Bride",
        description:
          about.bride?.description ||
          "The beautiful bride who lights up every room with her presence.",
        image: getSafeImageUrl(
          about.bride?.image,
          "/api/placeholder/280/360"
        ),
        socials: {
          instagram: about.bride?.socials?.instagram || "",
          facebook: about.bride?.socials?.facebook || "",
          twitter: about.bride?.socials?.twitter || "",
        },
      },
      coupleImage: getSafeImageUrl(
        about.coupleImage,
        "/api/placeholder/320/240"
      ),
    }
    : null;

  const safeInvitation = invitation
    ? {
      heading: invitation.heading || "You're Invited",
      subheading: invitation.subheading || "To Our Wedding",
      message:
        invitation.message ||
        "Join us as we begin our journey together in love and happiness",
      rsvpLink: invitation.rsvpLink || "",
      backgroundImage: getSafeImageUrl(
        invitation.backgroundImage,
        "/api/placeholder/1920/800"
      ),
    }
    : null;

  const safeLoveStory =
    loveStory && loveStory.length > 0
      ? loveStory.map((story, index) => ({
        id: index + 1,
        title: story.title || `Chapter ${index + 1}`,
        date: story.date || new Date().toLocaleDateString(),
        description:
          story.description || "A beautiful moment in our love story.",
        image: getSafeImageUrl(story.image, "/images/wedding/00.png"),
      }))
      : [];

  // --- ENHANCED: Each event has its own venue details (address, googleLocation, name) ---
  const safeWeddingEvents =
    Array.isArray(weddingEvents) && weddingEvents.length > 0
      ? weddingEvents.map((event, idx) => {
        // Check if venue is custom (ID = "0") and use selfVenue details
        if (event.venue === "0" && event.selfVenue) {
          return {
            ...event,
            date: event.date || new Date().toLocaleDateString(),
            time: event.time || "12:00 PM",
            address: event.selfVenue.address || "Custom Venue Address",
            googleLocation: event.selfVenue.googleLocation || "",
            venueName: event.selfVenue.name || "Custom Venue",
            landmark: event.selfVenue.landmark || "",
            description: event.description || "Join us for this special celebration",
            image: getSafeImageUrl(event.image, "/api/placeholder/600/400"),
            title: event.title || `Event ${idx + 1}`,
          };
        }

        // Try to get venue details from venueDetails state for regular venues
        const venue = venueDetails[idx] || {};
        // Defensive: event.venue may be string or object
        let eventVenueObj: any = typeof event.venue === "object" && event.venue !== null ? event.venue : {};
        return {
          ...event,
          date: event.date || new Date().toLocaleDateString(),
          time: event.time || "12:00 PM",
          address:
            venue.address ||
            eventVenueObj.address ||
            eventVenueObj.location?.address ||
            "Venue Address",
          googleLocation:
            venue.googleLocation ||
            eventVenueObj.googleLocation ||
            "",
          venueName:
            venue.name ||
            eventVenueObj.name ||
            "Venue",
          landmark: "", // Regular venues don't have landmark info
          description:
            event.description || "Join us for this special celebration",
          image: getSafeImageUrl(event.image, "/images/wedding/00.png"),
          title: event.title || `Event ${idx + 1}`,
        };
      })
      : [];

  const safePlanning =
    planning && planning.length > 0
      ? planning.map((item, index) => ({
        id: index + 1,
        title: item.title || "Planning Item",
        description:
          item.description || "Important wedding preparation detail",
        icon: getSafeImageUrl(item.icon, "/api/placeholder/56/56"),
        completed: item.completed || false,
        type: item.title || "Event",
        date: new Date().toLocaleDateString(),
        venue: item.description || "To be confirmed",
        time: "12:00 PM",
        phone: "+1 (555) 123-4567",
      }))
      : [];

  const countdownItems = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  // For gallery modal, ensure the selected image is a safe URL
  const safeSelectedGalleryImage = selectedGalleryImage
    ? getSafeImageUrl(selectedGalleryImage, "/api/placeholder/400/300")
    : null;

  // --- ENHANCED: Map logic for RSVP event checkboxes ---
  const rsvpEventCheckboxes =
    safeWeddingEvents.length > 0
      ? safeWeddingEvents.map((event, idx) => (
        <label key={idx} className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={rsvpFormData.selectedEvents.includes(idx)}
            onChange={() => handleEventCheckboxChange(idx)}
            className="w-5 h-5"
          />
          <span>
            {event.title}{" "}
            <span className="text-xs text-gray-500">
              ({event.date}, {event.time})
            </span>
          </span>
        </label>
      ))
      : null;

  return (
    <section
      style={{
        backgroundColor: safeTheme.backgroundColor,
        color: safeTheme.textColor,
      }}
    >
      {/* ENHANCED HERO SECTION */}
      {safeInvitation && (
        <section
          className="relative h-screen w-full bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url(${safeInvitation.backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/30" />

          {/* Floating hearts animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-white/20"
                initial={{
                  y: "100vh",
                  x:
                    Math.random() *
                    (typeof window !== "undefined" ? window.innerWidth : 1920),
                }}
                animate={{
                  y: "-10vh",
                  x:
                    Math.random() *
                    (typeof window !== "undefined" ? window.innerWidth : 1920),
                }}
                transition={{
                  duration: Math.random() * 3 + 5,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              >
                <Heart className="w-6 h-6" />
              </motion.div>
            ))}
          </div>

          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <motion.h2
              className="font-dancing-script text-6xl md:text-8xl mb-6 text-white drop-shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {safeInvitation.heading}
            </motion.h2>

            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-4 drop-shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              {safeInvitation.subheading}
            </motion.p>

            {safeAbout && (
              <motion.p
                className="text-lg md:text-xl text-white/80 mb-8 drop-shadow-md font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.1 }}
              >
                {safeAbout.groom.name} & {safeAbout.bride.name}
              </motion.p>
            )}

            <motion.p
              className="text-md text-white/70 max-w-2xl leading-relaxed drop-shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.4 }}
            >
              {safeInvitation.message}
            </motion.p>

            {/* Scroll indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <motion.div
                className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ENHANCED ABOUT SECTION */}
      {safeAbout && (
        <section className="bg-white py-20 px-6 md:px-20 text-center relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute top-10 left-10 w-32 h-32 rounded-full"
              style={{ backgroundColor: safeTheme.primaryColor }}
            ></div>
            <div
              className="absolute bottom-10 right-10 w-24 h-24 rounded-full"
              style={{ backgroundColor: safeTheme.secondaryColor }}
            ></div>
          </div>

          <div className="relative z-10">
            <motion.h4
              className="italic text-lg mb-2"
              style={{ color: safeTheme.titleColor }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {safeAbout.subtitle}
            </motion.h4>

            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-32"
              style={{ color: safeTheme.titleColor }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {safeAbout.title}
            </motion.h2>

            {/* Desktop Layout - Enhanced - Images Touching Corners */}
            {/* Desktop Layout - Enhanced */}
            <div className="relative max-w-7xl mx-auto hidden lg:flex justify-between items-start">
              {/* Groom Section - Enhanced */}
              <motion.div
                className="flex flex-col items-center w-[300px]"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="w-[300px] h-[380px] relative shadow-2xl ml-80 rounded-lg overflow-hidden group">
                  <Image
                    src={safeAbout.groom.image}
                    alt={safeAbout.groom.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 300px"
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="absolute left-[480px] top-[1px] text-left max-w-sm">
                  <h3
                    className="text-2xl font-semibold italic mb-3"
                    style={{ color: safeTheme.nameColor }}
                  >
                    {safeAbout.groom.name}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed mb-6">
                    {safeAbout.groom.description}
                  </p>
                  <div className="flex gap-4 text-gray-500">
                    {safeAbout.groom.socials.instagram && (
                      <motion.a
                        href={safeAbout.groom.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{
                          scale: 1.2,
                          color: safeTheme.primaryColor,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <Instagram className="w-6 h-6" />
                      </motion.a>
                    )}
                    {safeAbout.groom.socials.facebook && (
                      <motion.a
                        href={safeAbout.groom.socials.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{
                          scale: 1.2,
                          color: safeTheme.primaryColor,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <Facebook className="w-6 h-6" />
                      </motion.a>
                    )}
                    {safeAbout.groom.socials.twitter && (
                      <motion.a
                        href={safeAbout.groom.socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{
                          scale: 1.2,
                          color: safeTheme.primaryColor,
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <Twitter className="w-6 h-6" />
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Couple Center Image - Enhanced */}
              <motion.div
                className="absolute w-[350px] h-[260px] shadow-2xl border-4 border-white z-10 bg-white rounded-lg overflow-hidden"
                style={{
                  top: `calc(98% + -30px)`,
                  left: `calc(50% + -50px)`,
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                {safeAbout.coupleImage && !safeAbout.coupleImage.includes("/api/placeholder/") ? (
                  <>
                    <Image
                      src={safeAbout.coupleImage}
                      alt="Couple"
                      fill
                      sizes="(max-width: 1024px) 60vw, 350px"
                      unoptimized
                      className="object-cover transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
              </motion.div>
            </div>

            {/* Bride Section - Enhanced */}
            <motion.div
              className="hidden lg:flex flex-col items-center w-[300px] mx-auto mt-40 relative"
              style={{
                top: `calc(55% + -20px)`,
                left: `calc(30% + -50px)`,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="w-[300px] h-[380px] relative shadow-2xl rounded-lg overflow-hidden group">
                <Image
                  src={safeAbout.bride.image}
                  alt={safeAbout.bride.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 300px"
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div
                className="absolute text-left max-w-sm"
                style={{
                  top: `calc(55% + 40px)`,
                  left: `calc(50% + 0px - 350px)`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <h3
                  className="text-2xl font-semibold italic text-right mr-3 mb-3"
                  style={{ color: safeTheme.nameColor }}
                >
                  {safeAbout.bride.name}
                </h3>
                <p className="text-gray-600 text-base leading-relaxed mb-6">
                  {safeAbout.bride.description}
                </p>
                <div className="w-full flex justify-end gap-4 mr-3 text-gray-500">
                  {safeAbout.bride.socials.instagram && (
                    <motion.a
                      href={safeAbout.bride.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, color: safeTheme.primaryColor }}
                      transition={{ duration: 0.2 }}
                    >
                      <Instagram className="w-6 h-6" />
                    </motion.a>
                  )}
                  {safeAbout.bride.socials.facebook && (
                    <motion.a
                      href={safeAbout.bride.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, color: safeTheme.primaryColor }}
                      transition={{ duration: 0.2 }}
                    >
                      <Facebook className="w-6 h-6" />
                    </motion.a>
                  )}
                  {safeAbout.bride.socials.twitter && (
                    <motion.a
                      href={safeAbout.bride.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, color: safeTheme.primaryColor }}
                      transition={{ duration: 0.2 }}
                    >
                      <Twitter className="w-6 h-6" />
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Enhanced Mobile Layout */}
            <div className="flex flex-col gap-20 items-center lg:hidden">
              {/* Groom */}
              <motion.div
                className="flex flex-col items-center w-full max-w-sm mx-auto"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="w-[280px] h-[360px] relative shadow-2xl mx-auto rounded-lg overflow-hidden group">
                  <Image
                    src={safeAbout.groom.image}
                    alt={safeAbout.groom.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-8 text-center max-w-sm">
                  <h3
                    className="text-2xl font-semibold italic mb-3"
                    style={{ color: safeTheme.nameColor }}
                  >
                    {safeAbout.groom.name}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed mb-6">
                    {safeAbout.groom.description}
                  </p>
                  <div className="flex justify-center gap-4 text-gray-500">
                    {safeAbout.groom.socials.instagram && (
                      <motion.a
                        href={safeAbout.groom.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.2 }}
                      >
                        <Instagram className="w-6 h-6" />
                      </motion.a>
                    )}
                    {safeAbout.groom.socials.facebook && (
                      <motion.a
                        href={safeAbout.groom.socials.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.2 }}
                      >
                        <Facebook className="w-6 h-6" />
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Couple Image */}
              <motion.div
                className="w-[300px] h-[220px] shadow-2xl border-4 border-white bg-white rounded-lg mx-auto relative overflow-hidden"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                whileHover={{ scale: 1.05 }}
              >
                {safeAbout.coupleImage && !safeAbout.coupleImage.includes("/api/placeholder/") ? (
                  <Image
                    src={safeAbout.coupleImage}
                    alt="Couple"
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
              </motion.div>

              {/* Bride */}
              <motion.div
                className="flex flex-col items-center w-full max-w-sm mx-auto"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="w-[280px] h-[360px] relative shadow-2xl mx-auto rounded-lg overflow-hidden group">
                  <Image
                    src={safeAbout.bride.image}
                    alt={safeAbout.bride.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 280px"
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-8 text-center max-w-sm">
                  <h3
                    className="text-2xl font-semibold italic mb-3"
                    style={{ color: safeTheme.nameColor }}
                  >
                    {safeAbout.bride.name}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed mb-6">
                    {safeAbout.bride.description}
                  </p>
                  <div className="flex justify-center gap-4 text-gray-500">
                    {safeAbout.bride.socials.instagram && (
                      <motion.a
                        href={safeAbout.bride.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.2 }}
                      >
                        <Instagram className="w-6 h-6" />
                      </motion.a>
                    )}
                    {safeAbout.bride.socials.facebook && (
                      <motion.a
                        href={safeAbout.bride.socials.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.2 }}
                      >
                        <Facebook className="w-6 h-6" />
                      </motion.a>
                    )}
                    {safeAbout.bride.socials.twitter && (
                      <motion.a
                        href={safeAbout.bride.socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.2 }}
                      >
                        <Twitter className="w-6 h-6" />
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ENHANCED WEDDING EVENTS SECTION */}
      {safeWeddingEvents.length > 0 && (
        <section className="relative w-full overflow-hidden bg-white">
          <div
            className="absolute top-0 left-0 w-full h-[40%] z-0"
            style={{ backgroundColor: safeTheme.buttonColor }}
          />

          {/* Event Navigation */}
          {safeWeddingEvents.length > 1 && (
            <div className="relative z-10 pt-8 px-4">
              <div className="flex gap-3 overflow-x-auto w-full whitespace-nowrap scrollbar-hide snap-x snap-mandatory justify-center items-center">
                {safeWeddingEvents.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`inline-flex shrink-0 snap-start px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedEventIndex === index
                        ? "bg-white text-gray-800 shadow-lg"
                        : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                    onClick={() => setSelectedEventIndex(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {safeWeddingEvents[index]?.title || `Event ${index + 1}`}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Simplified animation to avoid mobile rendering issues */}
          <motion.div
              className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <div className="hidden md:flex flex-col md:flex-row gap-10 items-stretch relative">
                <div className="flex-1 flex flex-col justify-center">
                  <motion.h3
                    className="font-cormorant text-xl text-white mb-4 text-center md:text-left ml-52 -mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    Save the Date
                  </motion.h3>

                  <motion.h2
                    className="font-dancing-script text-5xl md:text-5xl text-white mb-20 text-center md:text-left ml-24"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    {safeWeddingEvents[selectedEventIndex].title}
                  </motion.h2>

                  <motion.div
                    className="flex justify-center md:justify-start items-center gap-4 sm:gap-6 -mt-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    {countdownItems.map(({ label, value }) => (
                      <motion.div
                        key={label}
                        className="bg-white rounded-xl shadow-xl p-4 sm:p-6 text-center w-28 sm:w-36 md:w-40 h-28 sm:h-32 md:h-36 flex flex-col justify-center -translate-y-10"
                        whileHover={{ scale: 1.05, y: -15 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div
                          className="font-outfit font-bold text-3xl sm:text-4xl mb-2"
                          style={{ color: safeTheme.primaryColor }}
                        >
                          {value.toString().padStart(2, "0")}
                        </div>
                        <div className="font-cinzel font-black text-sm sm:text-base text-gray-600 uppercase">
                          {label}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {safeWeddingEvents[selectedEventIndex].image && (
                  <motion.div
                    className="flex-1 h-80 flex justify-end gap-6 relative z-10 overflow-visible mt-28 -mr-28"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                  >
                    <div className="relative w-full h-full overflow-hidden border-4 border-white shadow-2xl -translate-y-10 rounded-lg group">
                      <Image
                        src={safeWeddingEvents[selectedEventIndex].image!}
                        alt={safeWeddingEvents[selectedEventIndex].title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Enhanced Event Details */}
              <motion.div
                className="mt-12 bg-white/90 backdrop-blur-sm rounded-2xl p-8 mx-4 shadow-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <Calendar
                      className="w-8 h-8 mb-2"
                      style={{ color: safeTheme.primaryColor }}
                    />
                    <h4
                      className="font-semibold text-lg mb-1"
                      style={{ color: safeTheme.titleColor }}
                    >
                      Date
                    </h4>
                    <p className="text-gray-600">
                      {new Date(
                        safeWeddingEvents[selectedEventIndex].date
                      ).toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <Clock
                      className="w-8 h-8 mb-2"
                      style={{ color: safeTheme.primaryColor }}
                    />
                    <h4
                      className="font-semibold text-lg mb-1"
                      style={{ color: safeTheme.titleColor }}
                    >
                      Time
                    </h4>
                    <p className="text-gray-600">
                      {safeWeddingEvents[selectedEventIndex].time}
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <MapPin
                      className="w-8 h-8 mb-2"
                      style={{ color: safeTheme.primaryColor }}
                    />
                    <h4
                      className="font-semibold text-lg mb-1"
                      style={{ color: safeTheme.titleColor }}
                    >
                      Address
                    </h4>
                    <p className="text-gray-600">
                      {safeWeddingEvents[selectedEventIndex].address}
                    </p>
                    {safeWeddingEvents[selectedEventIndex].landmark && (
                      <p className="text-gray-500 text-sm mt-1">
                        Near: {safeWeddingEvents[selectedEventIndex].landmark}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-center">
                    <Star
                      className="w-8 h-8 mb-2"
                      style={{ color: safeTheme.primaryColor }}
                    />
                    <h4
                      className="font-semibold text-lg mb-1"
                      style={{ color: safeTheme.titleColor }}
                    >
                      Details
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {safeWeddingEvents[selectedEventIndex].description}
                    </p>
                  </div>
                </div>
                {/* Show Google Map link if available */}
                {safeWeddingEvents[selectedEventIndex].googleLocation && (
                  <div className="mt-6 flex flex-col items-center">
                    {safeWeddingEvents[selectedEventIndex].googleLocation.includes(
                      "https://www.google.com/maps/embed"
                    ) ? (
                      <iframe
                        src={safeWeddingEvents[selectedEventIndex].googleLocation}
                        width="100%"
                        height="300"
                        style={{ border: 0, borderRadius: "1rem" }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    ) : (
                      <a
                        href={safeWeddingEvents[selectedEventIndex].googleLocation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 mt-2 text-blue-600 hover:underline"
                      >
                        <MapPin className="w-5 h-5" />
                        View on Google Maps
                      </a>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Mobile Layout for Events */}
              <div className="md:hidden space-y-8 mt-8">
                <div className="text-center text-white">
                  <h3 className="text-lg mb-2">Save the Date</h3>
                  <h2 className="font-dancing-script text-4xl mb-8">
                    {safeWeddingEvents[selectedEventIndex].title}
                  </h2>

                  <div className="grid grid-cols-2 gap-4 px-4">
                    {countdownItems.map(({ label, value }) => (
                      <motion.div
                        key={label}
                        className="bg-white rounded-xl shadow-xl p-4 text-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div
                          className="font-bold text-2xl mb-1"
                          style={{ color: safeTheme.primaryColor }}
                        >
                          {value.toString().padStart(2, "0")}
                        </div>
                        <div className="text-sm text-gray-600 uppercase">
                          {label}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {safeWeddingEvents[selectedEventIndex].image && (
                  <div className="px-4">
                    <div className="relative h-64 w-full rounded-lg overflow-hidden shadow-xl">
                      <Image
                        src={safeWeddingEvents[selectedEventIndex].image!}
                        alt={safeWeddingEvents[selectedEventIndex].title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        unoptimized
                        className="object-cover"
                        priority={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
        </section>
      )}

      {/* ENHANCED LOVE STORY SECTION */}
      {safeLoveStory.length > 0 && (
        <section className="relative w-full bg-white py-20 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0">
            <div
              className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-5"
              style={{ backgroundColor: safeTheme.primaryColor }}
            ></div>
            <div
              className="absolute bottom-20 right-10 w-48 h-48 rounded-full opacity-5"
              style={{ backgroundColor: safeTheme.secondaryColor }}
            ></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16 px-2">
              <motion.h3
                className="font-cormorant font-medium text-2xl sm:text-3xl lg:text-4xl mb-4 leading-snug break-words"
                style={{ color: safeTheme.titleColor }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                The Story of Us
              </motion.h3>
              <motion.h2
                className="font-cormorant font-bold text-4xl sm:text-5xl lg:text-6xl leading-snug break-words"
                style={{ color: safeTheme.nameColor }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                The Beginning of Our Journey Together
              </motion.h2>
              <div
                className="mx-auto mt-6 rounded-full h-[2px] w-16 sm:w-24 md:w-32"
                style={{ backgroundColor: safeTheme.primaryColor }}
              />
            </div>

            {/* Timeline Layout for Love Story */}
            <div className="relative">
              {/* Timeline line */}
              <div
                className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full rounded-full hidden lg:block"
                style={{ backgroundColor: safeTheme.secondaryColor }}
              ></div>

              <div className="space-y-16">
                {safeLoveStory.map((milestone, index) => (
                  <motion.div
                    key={milestone.id}
                    className={`relative flex items-center ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                      } flex-col lg:gap-16 gap-8`}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-4 border-white shadow-lg z-10 hidden lg:block"
                      style={{ backgroundColor: safeTheme.primaryColor }}
                    ></div>

                    {/* Content */}
                    <div
                      className={`flex-1 ${index % 2 === 0
                          ? "lg:text-right lg:pr-8"
                          : "lg:text-left lg:pl-8"
                        } text-center lg:text-left`}
                    >
                      <motion.div
                        className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
                        style={{
                          backgroundColor: safeTheme.secondaryColor + "20",
                          color: safeTheme.primaryColor,
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {milestone.date}
                      </motion.div>
                      <h3
                        className="text-3xl font-bold mb-4"
                        style={{ color: safeTheme.titleColor }}
                      >
                        {milestone.title}
                      </h3>
                      <p className="text-lg text-gray-600 leading-relaxed mb-6">
                        {milestone.description}
                      </p>
                    </div>

                    {/* Image */}
                    <motion.div
                      className="flex-1 max-w-md"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative h-80 w-full rounded-2xl overflow-hidden shadow-2xl z-10">
                        {!timelineLoaded[milestone.id] && (
                          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                        )}
                        {milestone.image && !milestone.image.includes("/images/wedding/00.png") && (
                          <img
                            src={milestone.image}
                            alt={milestone.title}
                            className="object-cover w-full h-full"
                            style={{ opacity: timelineLoaded[milestone.id] ? 1 : 0 }}
                            loading="lazy"
                            onLoad={() => setTimelineLoaded((prev) => ({ ...prev, [milestone.id]: true }))}
                            onError={() => setTimelineLoaded((prev) => ({ ...prev, [milestone.id]: true }))}
                          />
                        )}
                        {timelineLoaded[milestone.id] && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Image Gallery Thumbnails - Combined Love Story + Event Images */}
            {(safeLoveStory.length > 0 || safeWeddingEvents.length > 0) && (
              <motion.div
                className="mt-20 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h4
                  className="text-2xl font-semibold mb-8"
                  style={{ color: safeTheme.titleColor }}
                >
                  Our Memories
                </h4>
                <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                  {/* Love Story Images */}
                  {safeLoveStory.map((story, index) => (
                    <motion.div
                      key={`love-${story.id}`}
                      className="relative w-48 h-48 rounded-lg overflow-hidden cursor-pointer shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedGalleryImage(story.image)}
                    >
                      <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        unoptimized
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-200"></div>
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        Love Story
                      </div>
                    </motion.div>
                  ))}

                  {/* Wedding Event Images */}
                  {safeWeddingEvents.map((event, index) => {
                    if (event.image && event.image !== "/images/wedding/00.png") {
                      return (
                        <motion.div
                          key={`event-${index}`}
                          className="relative w-48 h-48 rounded-lg overflow-hidden cursor-pointer shadow-lg"
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedGalleryImage(event.image)}
                        >
                          <Image
                            src={event.image}
                            alt={event.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 25vw"
                            unoptimized
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-200"></div>
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {event.title}
                          </div>
                        </motion.div>
                      );
                    }
                    return null;
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Image Modal - simple motion only */}
          {safeSelectedGalleryImage && (
            <motion.div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelectedGalleryImage(null)}
            >
              <motion.div
                className="relative max-w-4xl max-h-[90vh] w-full h-full"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={safeSelectedGalleryImage}
                  alt="Gallery image"
                  fill
                  className="object-contain"
                />
                <button
                  className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                  onClick={() => setSelectedGalleryImage(null)}
                >
                  ✕
                </button>
              </motion.div>
            </motion.div>
          )}
        </section>
      )}

      {/* ENHANCED PLANNING SECTION */}
      {safePlanning.length > 0 && (
        <section className="relative w-full bg-gradient-to-br from-gray-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              <div className="w-full lg:w-1/2 flex flex-col space-y-8 items-center lg:items-start text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h3 className="font-cormorant text-2xl sm:text-3xl lg:text-4xl text-gray-600 mb-2 uppercase tracking-wide">
                    Wedding Planning
                  </h3>
                  <h2
                    className="font-cormorant font-bold text-4xl sm:text-5xl lg:text-6xl mb-4"
                    style={{ color: safeTheme.primaryColor }}
                  >
                    Our Journey
                  </h2>
                  <div
                    className="w-24 h-1 rounded-full mx-auto lg:mx-0"
                    style={{ backgroundColor: safeTheme.secondaryColor }}
                  ></div>
                  <p className="text-gray-600 mt-6 text-lg leading-relaxed">
                    Follow our wedding planning journey and see how everything
                    comes together for our special day.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                  {/* Venue Details Card */}
                  {(safeWeddingEvents[selectedEventIndex]?.venueName ||
                    safeWeddingEvents[selectedEventIndex]?.address) && (
                      <motion.div
                        className="mt-6 bg-white rounded-2xl p-6 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                      >
                        <h4
                          className="text-xl font-bold mb-4"
                          style={{ color: safeTheme.primaryColor }}
                        >
                          {safeWeddingEvents[selectedEventIndex].venueName}
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <MapPin
                              className="w-5 h-5 mt-1"
                              style={{ color: safeTheme.secondaryColor }}
                            />
                            <div>
                              <p className="font-medium text-gray-800">Address</p>
                              <p className="text-gray-600 text-sm">
                                {safeWeddingEvents[selectedEventIndex].address}
                              </p>
                              {safeWeddingEvents[selectedEventIndex].landmark && (
                                <p className="text-gray-500 text-xs mt-1">
                                  Near: {safeWeddingEvents[selectedEventIndex].landmark}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                </div>
              </div>

              {/* Enhanced Map placeholder */}
              {/* Enhanced Map with Venue Location for selected event */}
              <motion.div
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="relative h-96 lg:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl">
                  {safeWeddingEvents[selectedEventIndex]?.googleLocation &&
                    safeWeddingEvents[selectedEventIndex].googleLocation.includes(
                      "https://www.google.com/maps/embed"
                    ) ? (
                    <iframe
                      src={safeWeddingEvents[selectedEventIndex].googleLocation}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : safeWeddingEvents[selectedEventIndex]?.googleLocation ? (
                    <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-full flex items-center justify-center">
                      <a
                        href={safeWeddingEvents[selectedEventIndex].googleLocation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center"
                      >
                        <MapPin
                          className="w-12 h-12 mx-auto mb-4"
                          style={{ color: safeTheme.primaryColor }}
                        />
                        <p className="text-gray-600 text-lg font-medium">
                          {safeWeddingEvents[selectedEventIndex].venueName ||
                            "Venue Location"}
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                          {safeWeddingEvents[selectedEventIndex].address ||
                            "Address will be displayed here"}
                        </p>
                        <span className="text-blue-600 underline mt-2">
                          View on Google Maps
                        </span>
                      </a>
                    </div>
                  ) : (
                    // Fallback map interface
                    <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-full flex items-center justify-center">
                      <div className="text-center">
                        <MapPin
                          className="w-12 h-12 mx-auto mb-4"
                          style={{ color: safeTheme.primaryColor }}
                        />
                        <p className="text-gray-600 text-lg font-medium">
                          {safeWeddingEvents[selectedEventIndex].venueName ||
                            "Venue Location"}
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                          {safeWeddingEvents[selectedEventIndex].address ||
                            "Address will be displayed here"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ENHANCED RSVP SECTION */}
      <section
        className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat flex items-center"
        style={{
          backgroundImage: `url('${safeInvitation?.backgroundImage || "/api/placeholder/1920/800"
            }')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            className="bg-white/95 backdrop-blur-sm p-8 lg:p-12 rounded-3xl shadow-2xl"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <h4
                className="font-dancing-script text-2xl mb-2 italic"
                style={{ color: safeTheme.secondaryColor }}
              >
                Invitation
              </h4>
              <h2
                className="text-4xl lg:text-5xl font-bold mb-4"
                style={{ color: safeTheme.primaryColor }}
              >
                Will You Attend?
              </h2>
              <p className="text-gray-600 text-lg">
                Your presence would make our special day even more memorable.
                Please let us know if you can join us.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleRSVPSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-700 font-medium mb-1" htmlFor="rsvp-name">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <motion.input
                    id="rsvp-name"
                    type="text"
                    placeholder="Your Full Name"
                    value={rsvpFormData.name}
                    onChange={(e) =>
                      handleRSVPInputChange("name", e.target.value)
                    }
                    required
                    className="w-full border-2 border-gray-200 rounded-xl bg-white py-3 px-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-colors"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-700 font-medium mb-1" htmlFor="rsvp-email">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <motion.input
                    id="rsvp-email"
                    type="email"
                    placeholder="Email Address"
                    value={rsvpFormData.email}
                    onChange={(e) =>
                      handleRSVPInputChange("email", e.target.value)
                    }
                    required
                    className="w-full border-2 border-gray-200 rounded-xl bg-white py-3 px-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-colors"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              </div>

              {rsvpFormData.attendance === "yes" && (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-700 font-medium mb-1" htmlFor="rsvp-number-of-guests">
                      Number of Guests <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="rsvp-number-of-guests"
                      type="number"
                      placeholder="Number of Guests"
                      value={rsvpFormData.numberOfGuests}
                      onChange={(e) =>
                        handleRSVPInputChange(
                          "numberOfGuests",
                          parseInt(e.target.value)
                        )
                      }
                      min="1"
                      max="10"
                      className="w-full border-2 border-gray-200 rounded-xl bg-white py-3 px-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-700 font-medium mb-1" htmlFor="rsvp-phone">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="rsvp-phone"
                      type="tel"
                      placeholder="Phone Number"
                      value={rsvpFormData.phone}
                      onChange={(e) =>
                        handleRSVPInputChange("phone", e.target.value)
                      }
                      className="w-full border-2 border-gray-200 rounded-xl bg-white py-3 px-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                </motion.div>
              )}

              <div className="bg-gray-50 rounded-xl p-6">
                <p className="font-medium text-gray-800 mb-4">
                  Will you be attending?
                </p>
                <div className="flex gap-6">
                  <motion.label
                    className="flex items-center gap-3 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <input
                      type="radio"
                      name="attendance"
                      value="yes"
                      checked={rsvpFormData.attendance === "yes"}
                      onChange={(e) =>
                        handleRSVPInputChange("attendance", e.target.value)
                      }
                      className="w-5 h-5"
                    />
                    <span className="text-gray-700 font-medium">
                      ✨ Yes, I'll be there!
                    </span>
                  </motion.label>
                  <motion.label
                    className="flex items-center gap-3 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <input
                      type="radio"
                      name="attendance"
                      value="no"
                      checked={rsvpFormData.attendance === "no"}
                      onChange={(e) =>
                        handleRSVPInputChange("attendance", e.target.value)
                      }
                      className="w-5 h-5"
                    />
                    <span className="text-gray-700 font-medium">
                      💔 Sorry, can't make it
                    </span>
                  </motion.label>
                </div>
              </div>

              {/* RSVP Event Selection */}
              {rsvpFormData.attendance === "yes" && safeWeddingEvents.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="font-medium text-gray-800 mb-2">
                    Which event(s) will you attend?
                  </p>
                  <div className="flex flex-col gap-1">{rsvpEventCheckboxes}</div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-gray-700 font-medium mb-1" htmlFor="rsvp-message">
                  Special message for the couple (Optional)
                </label>
                <textarea
                  id="rsvp-message"
                  placeholder="Special message for the couple"
                  value={rsvpFormData.message}
                  onChange={(e) =>
                    handleRSVPInputChange("message", e.target.value)
                  }
                  className="w-full border-2 border-gray-200 rounded-xl bg-white py-3 px-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-400 transition-colors resize-none h-32"
                  rows={4}
                />
              </div>

              <motion.button
                type="submit"
                className="w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: safeTheme.buttonColor,
                  backgroundImage: `linear-gradient(45deg, ${safeTheme.buttonColor}, ${safeTheme.buttonHoverColor})`,
                }}
                disabled={isSubmittingRSVP}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmittingRSVP ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5" />
                    Send RSVP
                  </span>
                )}
              </motion.button>

              <p className="text-sm text-gray-500 text-center">
                * Required fields. We'll send you a confirmation email once
                received.
              </p>
            </form>
          </motion.div>

          {/* Right side - Wedding details */}
          <motion.div
            className="text-white space-y-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
              <h3 className="text-3xl font-bold mb-6">Event Details</h3>

              {safeWeddingEvents.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-6 h-6 text-white/80" />
                    <div>
                      <p className="font-semibold">
                        {new Date(safeWeddingEvents[0].date).toLocaleDateString(
                          "en-IN",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                      <p className="text-white/80 text-sm">Wedding Date</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Clock className="w-6 h-6 text-white/80" />
                    <div>
                      <p className="font-semibold">
                        {safeWeddingEvents[0].time}
                      </p>
                      <p className="text-white/80 text-sm">Ceremony Time</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <MapPin className="w-6 h-6 text-white/80" />
                    <div>
                      <p className="font-semibold">
                        {safeWeddingEvents[0].address}
                      </p>
                      {safeWeddingEvents[0].landmark && (
                        <p className="text-white/70 text-xs">
                          Near: {safeWeddingEvents[0].landmark}
                        </p>
                      )}
                      <p className="text-white/80 text-sm">Address</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Countdown display */}
            {safeWeddingEvents.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
                <h4 className="text-2xl font-bold mb-6 text-center">
                  Time Until Our Big Day
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {countdownItems.map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <div className="bg-white/20 rounded-xl p-4 mb-2">
                        <div className="text-2xl sm:text-3xl font-bold">
                          {value.toString().padStart(2, "0")}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-white/80 uppercase">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
              <h4 className="text-xl font-bold mb-4">Need Help?</h4>
              <p className="text-white/80 mb-4">
                If you have any questions about the wedding or need assistance
                with your RSVP, please don't hesitate to reach out.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:wedding@example.com"
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                >
                  <span className="bg-white/20 p-2 rounded-full">📧</span>
                  wedding@example.com
                </a>
                <a
                  href="tel:+1234567890"
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                >
                  <span className="bg-white/20 p-2 rounded-full">📞</span>
                  (123) 456-7890
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ENHANCED FOOTER SECTION */}
      {safeAbout && safeInvitation && (
        <footer className="relative bg-white/95 backdrop-blur-md text-center py-16 px-4 overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-10">
            <Image
              src={safeInvitation.backgroundImage}
              alt="Footer background"
              fill
              className="object-cover"
            />
          </div>

          {/* Decorative elements */}
          <div
            className="absolute top-8 left-8 w-32 h-32 rounded-full opacity-5"
            style={{ backgroundColor: safeTheme.primaryColor }}
          ></div>
          <div
            className="absolute bottom-8 right-8 w-24 h-24 rounded-full opacity-5"
            style={{ backgroundColor: safeTheme.secondaryColor }}
          ></div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2
                className="font-dancing-script text-5xl sm:text-6xl mb-2"
                style={{ color: safeTheme.primaryColor }}
              >
                {`${safeAbout.groom.name} & ${safeAbout.bride.name}`}
              </h2>
              <p className="text-lg text-gray-600 italic mb-8">
                {safeInvitation.subheading}
              </p>

              {/* Wedding date */}
              {safeWeddingEvents.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 inline-block">
                  <div className="flex items-center justify-center gap-4">
                    <Calendar
                      className="w-6 h-6"
                      style={{ color: safeTheme.primaryColor }}
                    />
                    <span
                      className="text-xl font-semibold"
                      style={{ color: safeTheme.titleColor }}
                    >
                      {new Date(safeWeddingEvents[0].date).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="h-px bg-gray-300 w-3/4 mx-auto my-8" />

              {/* Social media links */}
              <div className="flex justify-center items-center gap-6 mb-8 text-2xl">
                {(safeAbout.groom.socials.instagram ||
                  safeAbout.bride.socials.instagram) && (
                    <motion.a
                      href={
                        safeAbout.groom.socials.instagram ||
                        safeAbout.bride.socials.instagram ||
                        "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="transition-colors duration-300 p-3 rounded-full bg-gray-100 hover:bg-pink-100"
                      style={{ color: safeTheme.primaryColor }}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                    >
                      <FaInstagram />
                    </motion.a>
                  )}
                {(safeAbout.groom.socials.twitter ||
                  safeAbout.bride.socials.twitter) && (
                    <motion.a
                      href={
                        safeAbout.groom.socials.twitter ||
                        safeAbout.bride.socials.twitter ||
                        "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Twitter"
                      className="transition-colors duration-300 p-3 rounded-full bg-gray-100 hover:bg-blue-100"
                      style={{ color: safeTheme.primaryColor }}
                      whileHover={{ scale: 1.2, rotate: -5 }}
                    >
                      <FaTwitter />
                    </motion.a>
                  )}
                {(safeAbout.groom.socials.facebook ||
                  safeAbout.bride.socials.facebook) && (
                    <motion.a
                      href={
                        safeAbout.groom.socials.facebook ||
                        safeAbout.bride.socials.facebook ||
                        "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="transition-colors duration-300 p-3 rounded-full bg-gray-100 hover:bg-blue-100"
                      style={{ color: safeTheme.primaryColor }}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                    >
                      <FaFacebookF />
                    </motion.a>
                  )}
              </div>

              {/* Thank you message */}
              <motion.div
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  className="w-8 h-8 mx-auto mb-4"
                  style={{ color: safeTheme.primaryColor }}
                />
                <p className="text-lg text-gray-700 leading-relaxed">
                  Thank you for being part of our love story. Your presence and
                  support mean the world to us as we begin this beautiful
                  journey together.
                </p>
              </motion.div>

              {/* Copyright */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  © 2024 Wedding Invitation. Made with ❤️ for{" "}
                  {safeAbout.groom.name} & {safeAbout.bride.name}
                </p>
              </div>
            </motion.div>
          </div>
        </footer>
      )}

      {/* Fallback message with enhanced design */}
      {!safeInvitation && !safeAbout && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <motion.div
            className="text-center bg-white p-12 rounded-3xl shadow-2xl max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              <Heart className="w-10 h-10 text-pink-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Wedding Invitation
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              This beautiful invitation is being prepared with love and care.
              Please check back soon!
            </p>
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-2">
                <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
};

export default InvitePage;
