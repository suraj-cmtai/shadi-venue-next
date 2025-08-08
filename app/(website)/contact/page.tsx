'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

const Contact = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Get In Touch Section */}
            <div className="relative bg-background py-20 px-4 sm:px-8">
             
                {/* Decorative Leaves Left */}
                <div className="absolute -left-12 top-2/4 transform -translate-y-1/2 rotate-12 hidden md:block opacity-30">
                    <div className="relative w-[560px] h-[420px]">
                        <Image
                            src="/images/wedding/Vector_4.png"
                            alt="Decorative leaf"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Decorative Leaves Right */}
                <div className="absolute -right-12 top-2/2 transform -translate-y-1/2 hidden md:block opacity-30">
                    <div className="relative w-[500px] h-[420px]">
                        <Image
                            src="/images/wedding/Vector_4.png"
                            alt="Decorative leaf"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                <div className="relative z-10 max-w-2xl mx-auto text-center">
                    <h1 className="text-5xl font-light text-foreground mb-6 font-serif">
                        Get In Touch
                    </h1>
                    <p className="text-muted-foreground mb-12 leading-relaxed max-w-md mx-auto">
                        Have questions or just want to say hello? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
                    </p>

                    {/* Contact Form */}
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                type="text"
                                placeholder="Name*"
                                className="bg-background border-muted placeholder:text-muted-foreground text-foreground"
                            />
                            <Input
                                type="email"
                                placeholder="Email*"
                                className="bg-background border-muted placeholder:text-muted-foreground text-foreground"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                type="tel"
                                placeholder="Phone No.*"
                                className="bg-background border-muted placeholder:text-muted-foreground text-foreground"
                            />
                            <Input
                                type="url"
                                placeholder="Website"
                                className="bg-background border-muted placeholder:text-muted-foreground text-foreground"
                            />
                        </div>
                        <Textarea
                            placeholder="Comments*"
                            rows={6}
                            className="bg-background border-muted placeholder:text-muted-foreground text-foreground resize-none"
                        />
                        <Button
                            type="submit"
                            className="bg-[#212D47] hover:bg-[#1a2137] text-white px-12 py-3 text-sm font-medium tracking-wider"
                        >
                            SUBMIT NOW ▶
                        </Button>
                    </form>
                </div>
            </div>

            {/* Find Us Section */}
            <div className="relative bg-background px-4 sm:px-8 overflow-hidden">
                <div className="py-20 px-4 sm:px-8 bg-gray-200 overflow-hidden">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg p-12 shadow-sm">
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-light text-foreground mb-4 font-serif">
                                    Find Us Here
                                </h2>
                                <p className="text-muted-foreground">
                                    Locate our office or store on the map and visit us for more details.
                                </p>
                            </div>

                            {/* Grid with dividers */}
                            <div className="flex flex-col md:flex-row text-center mb-8 divide-y-2 md:divide-y-0 md:divide-x-2 divide-muted">
                                <div className="flex-1 px-4 py-6">
                                    <h3 className="text-lg font-medium text-foreground mb-4">Address</h3>
                                    <p className="text-muted-foreground">
                                        Orchid Center,<br />
                                        Golf Course Road, Gurgaon
                                    </p>
                                </div>
                                <div className="flex-1 px-4 py-6">
                                    <h3 className="text-lg font-medium text-foreground mb-4">Phone No.</h3>
                                    <p className="text-muted-foreground">935019199</p>
                                </div>
                                <div className="flex-1 px-4 py-6">
                                    <h3 className="text-lg font-medium text-foreground mb-4">Email</h3>
                                    <p className="text-muted-foreground">g@hailvenue.com</p>
                                </div>
                            </div>

                            <div className="text-center">
                                <Button className="bg-[#212D47] hover:bg-[#1a2137] text-white px-8 py-3 text-sm font-medium tracking-wider">
                                    ↗ GET DIRECTION
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Contact;
