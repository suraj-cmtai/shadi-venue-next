"use client";

import React from "react";
import { useEffect, useState } from "react";

const Popup: React.FC = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Set a timer to show the popup after 30 seconds
    const timer = setTimeout(() => {
      setShow(true);
    }, 30000); // 30 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would add your API call or logic to send the OTP
    console.log("Form Submitted:", { name, phone });
    setSubmitted(true);

    // Hide the popup after showing the success message
    setTimeout(() => {
      setShow(false);
      // Optional: reset form after closing
      setSubmitted(false);
      setName("");
      setPhone("");
    }, 1000); // Show success message for 3 seconds
  };

  // If the show state is false, render nothing
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9999,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Cinzel', serif",
        animation: "popup-fade-in 0.5s ease-out",
      }}
    >
      <div
        style={{
          background: "#e7c1c2",
          borderRadius: 12,
          boxShadow: "0px 4px 15px rgba(0,0,0,0.3)",
          maxWidth: 400,
          width: "90%",
          padding: 30,
          position: "relative",
          textAlign: "center",
        }}
      >
        <button
          onClick={() => setShow(false)}
          style={{
            position: "absolute",
            top: 10,
            right: 15,
            background: "none",
            border: "none",
            fontSize: 28,
            color: "#212d47", // Dark color for visibility on pink bg
            cursor: "pointer",
            fontWeight: 400,
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          &times;
        </button>
        {submitted ? (
          <div
            style={{
              color: "#212d47",
              fontWeight: 600,
              fontSize: 18,
              textAlign: "center",
              padding: "2rem 0",
            }}
          >
            Thank you!
            <br />
            <p
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: 14,
                marginTop: "8px",
                fontWeight: 400,
              }}
            >
              We have sent the OTP to your WhatsApp.
            </p>
          </div>
        ) : (
          <>
            <h2
              style={{
                marginTop: 0,
                fontSize: 22,
                marginBottom: 10,
                color: "#212d47",
              }}
            >
              Let’s make your wedding planning effortless 💍
            </h2>
            <p
              style={{
                fontSize: 14,
                marginBottom: 20,
                color: "#333",
                fontFamily: "Arial, sans-serif",
                lineHeight: 1.5,
              }}
            >
              <strong>Register in seconds 💬</strong>
              <br />
              Just verify via WhatsApp OTP — your number stays private, no
              calls, no spam.
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px",
                  marginBottom: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontFamily: "Arial, sans-serif",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <input
                type="tel"
                placeholder="+91 Phone Number"
                value={phone}
                required
                pattern="^\+?[0-9\s-]{7,15}$"
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px",
                  marginBottom: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontFamily: "Arial, sans-serif",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: "#212d47",
                  color: "#fff",
                  padding: "12px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  width: "100%",
                  fontFamily: "'Cinzel', serif",
                  fontWeight: "bold",
                  fontSize: 16,
                  transition: "background 0.2s",
                }}
              >
                Send OTP via WhatsApp
              </button>
            </form>
          </>
        )}
      </div>
      <style>{`
        @keyframes popup-fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Popup;