"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { createContact } from "@/lib/redux/features/contactSlice";
import { useAppDispatch } from "@/lib/redux/store";
import { Alert } from "@/components/ui/alert";

const IMAGES_IMG = "/images/getintouch-image-1.png";
const VECTOR_IMG = "/images/getintouch-flower-left-side-vector-1.svg";

export default function GetInTouch() {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Wedding Inquiry",
    message: "",
    weddingDate: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      Alert({
        title: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create FormData object for API
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone || "");
      data.append("subject", formData.subject);
      data.append("message", `Wedding Date: ${formData.weddingDate}\n\n${formData.message}`);

      await dispatch(createContact(data)).unwrap();

      Alert({
        title: "Success",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "Wedding Inquiry",
        message: "",
        weddingDate: ""
      });

    } catch (error: any) {
      Alert({
        title: "Error",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full flex justify-center items-center py-16 md:py-24 bg-white relative">
      {/* Decorative Vector (right side, desktop only) */}
      <motion.img
        src={VECTOR_IMG}
        alt=""
        className="hidden lg:block pointer-events-none select-none absolute right-0 top-0 h-full max-h-[600px] z-10"
        style={{ opacity: 0.12 }}
        aria-hidden="true"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 0.12, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />

      <div className="container mx-auto flex flex-col lg:flex-row items-stretch justify-center gap-8 lg:gap-16 relative z-10 px-4">
        {/* Left: Image */}
        <motion.div
          className="w-full lg:w-[480px] xl:w-[520px] flex-shrink-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="aspect-[16/13] w-full rounded-xs overflow-hidden shadow-sm border border-neutral-100 bg-neutral-100">
            <motion.img
              src={IMAGES_IMG}
              alt="Wedding couple"
              className="object-cover w-full h-full"
              draggable={false}
              initial={false}
              animate={false}
            />
          </div>
        </motion.div>

        {/* Right: Form Card */}
        <motion.div
          className="w-full max-w-xl bg-neutral-50 relative rounded-xs lg:rounded-xs shadow-none px-6 py-8 lg:py-10 flex flex-col justify-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* White border */}
          <motion.div
            className="pointer-events-none absolute inset-0 border-4 border-white z-10"
            style={{ borderRadius: 0 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            aria-hidden="true"
          />

          {/* Form Content */}
          <div className="relative z-20">
            {/* Header */}
            <motion.p
              className="font-dancing-script text-[18px] md:text-[20px] text-black mb-1"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Contact Us
            </motion.p>
            <motion.h2
              className="font-cormorant text-[26px] md:text-[32px] lg:text-[36px] text-[#212d47] mb-8 font-normal"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              Get In Touch
            </motion.h2>

            {/* Form */}
            <motion.form
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              onSubmit={handleSubmit}
            >
              {/* Name & Email Row */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block font-cormorant text-[17px] text-[#7d7d7d] mb-1">
                    Name *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="border-0 border-b border-[#d9d9d9] rounded-xs px-0 py-2 text-[16px] font-cormorant bg-transparent focus:ring-0"
                    placeholder="Your name"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-cormorant text-[17px] text-[#7d7d7d] mb-1">
                    E-mail *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="border-0 border-b border-[#d9d9d9] rounded-xs px-0 py-2 text-[16px] font-cormorant bg-transparent focus:ring-0"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Phone & Wedding Date Row */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block font-cormorant text-[17px] text-[#7d7d7d] mb-1">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border-0 border-b border-[#d9d9d9] rounded-xs px-0 py-2 text-[16px] font-cormorant bg-transparent focus:ring-0"
                    placeholder="Your phone number"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-cormorant text-[17px] text-[#7d7d7d] mb-1">
                    Wedding Date
                  </label>
                  <Input
                    type="date"
                    name="weddingDate"
                    value={formData.weddingDate}
                    onChange={handleChange}
                    className="border-0 border-b border-[#d9d9d9] rounded-xs px-0 py-2 text-[16px] font-cormorant bg-transparent focus:ring-0"
                  />
                </div>
              </div>

              {/* Your Messages */}
              <div>
                <label className="block font-cormorant text-[17px] text-[#7d7d7d] mb-1">
                  Your Messages *
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="border-0 border-b border-[#d9d9d9] rounded-xs px-0 py-2 text-[16px] font-cormorant bg-transparent focus:ring-0 min-h-[120px] resize-none"
                  placeholder="Tell us about your wedding plans..."
                />
              </div>

              {/* Submit Button */}
              <motion.div
                className="pt-2"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#212d47] text-white px-7 py-2.5 font-cormorant font-bold text-[15px] uppercase tracking-wider rounded-xs shadow-none hover:bg-[#1a2338] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending..." : "Submit"}
                </Button>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
