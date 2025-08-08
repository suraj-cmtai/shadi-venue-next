import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SocialLinks {
    instagram: string;
    facebook: string;
    twitter?: string;
}

interface LoveStoryItem {
    id: number;
    date: string;
    title: string;
    description: string;
    image: string;
}

interface EventItem {
    id: number;
    type: string;
    date: string;
    venue: string;
    time: string;
    phone: string;
    icon: string;
}

interface PlanningSection {
    mapIframeUrl: string;
    title: string;
    subtitle: string;
    events: EventItem[];
}

export interface WeddingState {
    theme: {
        titleColor: string;
        nameColor: string;
        buttonColor: string;
        buttonHoverColor: string;
    };
    invite: {
        leftImage: string;
        rightImage: string;
        title: string;
        names: string;
        linkHref: string;
        linkText: string;
    };
    about: {
        subtitle: string;
        title: string;
        groom: {
            name: string;
            description: string;
            image: string;
            socials: SocialLinks;
        };
        bride: {
            name: string;
            description: string;
            image: string;
            socials: SocialLinks;
        };
        coupleImage: string;
    };
    weddingDay: {
        backgroundColor: string;
        headingTop: string;
        headingMain: string;
        date: string;
        images: string[];
    };
    loveStory: {
        sectionTitle: string;
        sectionSubtitle: string;
        stories: LoveStoryItem[];
    };
    planning: PlanningSection;
    rsvp: {
        backgroundImage: string;
    };
    footer: {
        backgroundImage: string;
        coupleNames: string;
        subtitle: string;
        socials: {
            instagram: string;
            twitter: string;
            facebook: string;
        };
    };
}

const initialState: WeddingState = {
    theme: {
        titleColor: '#1E3A8A',
        nameColor: '#1E3A8A',
        buttonColor: '#A4E5F6',
        buttonHoverColor: '#76DCF1',
    },
    invite: {
        leftImage: '/images/wedding/wed5.jpg',
        rightImage: '/images/wedding/wed4.jpg',
        title: 'Wedding Day',
        names: 'Harry & Kate',
        linkHref: '/projects',
        linkText: 'Our Story',
    },
    about: {
        subtitle: 'Couple',
        title: 'About Us',
        groom: {
            name: 'Harry Cavil',
            description: 'Aenean eget mi ullamcorper, vestibulum enim in, fermentum massa. Aenean sit amet velit ligula. Curabitur at scelerisque elit.',
            image: '/images/wedding/wed.jpg',
            socials: {
                instagram: 'https://instagram.com/groom',
                facebook: 'https://facebook.com/groom',
            },
        },
        bride: {
            name: 'Kate Salmon',
            description: 'Etiam venenatis luctus laoreet. Donec et interdum neque. Suspendisse potenti. Quisque vel odio elit.',
            image: '/images/wedding/wed.jpg',
            socials: {
                instagram: 'https://instagram.com/bride',
                facebook: 'https://facebook.com/bride',
            },
        },
        coupleImage: '/images/wedding/wed.jpg',
    },
    weddingDay: {
        backgroundColor: '#212d47',
        headingTop: 'wedding day',
        headingMain: 'Date We Getting Married',
        date: '2025-06-15T18:00:00',
        images: [
            '/images/wedding/wed.jpg',
            '/images/wedding/wed.jpg',
            '/images/wedding3.jpg',
            '/images/wedding4.jpg',
            '/images/wedding4.jpg',
        ],
    },
    loveStory: {
        sectionTitle: 'love story',
        sectionSubtitle: 'Our Love Story',
        stories: [
            {
                id: 1,
                date: '23.jan.2019',
                title: 'How We Met',
                description: 'We first crossed paths at [Location/event]. A shared laugh sparked a friendship that soon blossomed into love',
                image: '/images/love-story-1.jpg',
            },
            {
                id: 2,
                date: '23.jan.2019',
                title: 'First Date',
                description: 'We spent an evening at [place], sipping drinks under fairy lights and realizing we really "clicked."',
                image: '/images/love-story-2.jpg',
            },
            {
                id: 3,
                date: '23.jan.2019',
                title: 'First Anniversary',
                description: 'We recreated our café date at home—fairy lights, handwritten notes, and our favorite song playing softly.',
                image: '/images/love-story-3.jpg',
            },
            {
                id: 4,
                date: '23.jan.2019',
                title: 'Moved in Together',
                description: 'From shared apartment to shared dreams, we built a life filled with laughter—and the occasional debate about who does the dishes',
                image: '/images/love-story-4.jpg',
            },
            {
                id: 5,
                date: '23.jan.2019',
                title: 'Adventures & Trips',
                description: 'One simple question—"Will you marry me?"—became our forever plan.',
                image: '/images/love-story-5.jpg',
            },
            {
                id: 6,
                date: '23.jan.2019',
                title: 'The Proposal',
                description: 'Surrounded by friends (or maybe just the stars), one simple question—"Will you marry me?"—became our forever plan.',
                image: '/images/love-story-6.jpg',
            },
        ],
    },
    planning: {
        mapIframeUrl:
            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.612224823173!2d77.31334703095544!3d28.581404863018054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce459806807e5%3A0xc911586c671c1d4!2sBlock%20E%2C%20Noida%20Sector%203%2C%20Noida%2C%20Uttar%20Pradesh%20201301!5e0!3m2!1sen!2sin!4v1754301278713!5m2!1sen!2sin',
        title: 'Planning',
        subtitle: 'When & Where',
        events: [
            {
                id: 1,
                type: 'The Ceremony',
                date: 'Sunday 12 September 2025',
                venue: 'Jai Mahal Palace, Jacob Road, Civil Lines, Jaipur 302006, Rajasthan, India',
                time: '11AM-2PM',
                phone: '6880765443',
                icon: '/images/wedding/cermony.jpg',
            },
            {
                id: 2,
                type: 'Reception',
                date: 'Sunday 12 September 2025',
                venue: 'Jai Mahal Palace, Jacob Road, Civil Lines, Jaipur 302006, Rajasthan, India',
                time: '11AM-2PM',
                phone: '6880765443',
                icon: '/images/wedding/reception.jpg',
            },
        ],
    },
    rsvp: {
        backgroundImage: '/images/wedding/pre2.jpg',
    },
    footer: {
        backgroundImage: '/images/footer-bg.jpg',
        coupleNames: 'Harry & Kate',
        subtitle: 'Harry & Kate Wedding Day',
        socials: {
            instagram: 'https://instagram.com/groom',
            twitter: 'https://twitter.com/groom',
            facebook: 'https://facebook.com/groom',
        },
    },
};

const weddingSlice = createSlice({
    name: 'wedding',
    initialState,
    reducers: {
        setTheme(state, action: PayloadAction<Partial<WeddingState['theme']>>) {
            state.theme = { ...state.theme, ...action.payload };
        },
        setInviteData(state, action: PayloadAction<Partial<WeddingState['invite']>>) {
            state.invite = { ...state.invite, ...action.payload };
        },
        setAboutData(state, action: PayloadAction<Partial<WeddingState['about']>>) {
            state.about = { ...state.about, ...action.payload };
        },
        setWeddingDay(state, action: PayloadAction<Partial<WeddingState['weddingDay']>>) {
            state.weddingDay = { ...state.weddingDay, ...action.payload };
        },
        setLoveStory(state, action: PayloadAction<Partial<WeddingState['loveStory']>>) {
            state.loveStory = { ...state.loveStory, ...action.payload };
        },
        setPlanning(state, action: PayloadAction<Partial<WeddingState['planning']>>) {
            state.planning = { ...state.planning, ...action.payload };
        },
        setRSVP(state, action: PayloadAction<Partial<WeddingState['rsvp']>>) {
            state.rsvp = { ...state.rsvp, ...action.payload };
        },
        setFooter(state, action: PayloadAction<Partial<WeddingState['footer']>>) {
            state.footer = { ...state.footer, ...action.payload };
        },
    },
});

export const {
    setTheme,
    setInviteData,
    setAboutData,
    setWeddingDay,
    setLoveStory,
    setPlanning,
    setRSVP,
    setFooter,
} = weddingSlice.actions;

export default weddingSlice.reducer;
