"use client"

import React, { useEffect, useState } from "react";

const Popup: React.FC = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 30000); // 30 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can add your API call or logic to handle the booking
    setSubmitted(true);
    setTimeout(() => setShow(false), 2000);
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 9999,
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, #f8fafc 60%, #fbbf24 100%)",
          borderRadius: "1.5rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          padding: "2.5rem 2rem",
          minWidth: 340,
          maxWidth: "90vw",
          border: "2px solid #fbbf24",
          position: "relative",
          animation: "popup-fade-in 0.7s cubic-bezier(.4,2,.6,1)",
        }}
      >
        <button
          onClick={() => setShow(false)}
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            background: "none",
            border: "none",
            fontSize: 22,
            color: "#fbbf24",
            cursor: "pointer",
            fontWeight: 700,
          }}
          aria-label="Close"
        >
          ×
        </button>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#fbbf24",
              letterSpacing: 1,
              fontFamily: "inherit",
              marginBottom: 6,
              textShadow: "0 2px 8px #fbbf2433",
            }}
          >
            Get Quick Booking
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#222",
              marginBottom: 18,
              fontWeight: 500,
              opacity: 0.85,
            }}
          >
            Book your dream stay in seconds!<br />
            Enter your details and our team will contact you.
          </div>
        </div>
        {submitted ? (
          <div
            style={{
              color: "#16a34a",
              fontWeight: 700,
              fontSize: 18,
              textAlign: "center",
              padding: "1.5rem 0",
            }}
          >
            Thank you!<br />We will contact you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              required
              onChange={e => setName(e.target.value)}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: 8,
                border: "1.5px solid #fbbf24",
                fontSize: 16,
                outline: "none",
                marginBottom: 4,
                background: "#fffbe9",
                fontWeight: 500,
              }}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              required
              pattern="[0-9+\s()-]{7,}"
              onChange={e => setPhone(e.target.value)}
              style={{
                padding: "0.75rem 1rem",
                borderRadius: 8,
                border: "1.5px solid #fbbf24",
                fontSize: 16,
                outline: "none",
                background: "#fffbe9",
                fontWeight: 500,
              }}
            />
            <button
              type="submit"
              style={{
                marginTop: 8,
                background: "linear-gradient(90deg, #fbbf24 60%, #f59e42 100%)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                border: "none",
                borderRadius: 8,
                padding: "0.75rem 0",
                cursor: "pointer",
                boxShadow: "0 2px 8px #fbbf2433",
                letterSpacing: 1,
                transition: "background 0.2s",
              }}
            >
              Book Now
            </button>
          </form>
        )}
      </div>
      <style>{`
        @keyframes popup-fade-in {
          from { transform: scale(0.85) translateY(40px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Popup;