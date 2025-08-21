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
        fontFamily: "'Cinzel', serif",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #212d47, #e7c1c2)",
          borderRadius: 10,
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          color: "#fff",
          maxWidth: 300,
          width: "100%",
          padding: 20,
          position: "relative",
          animation: "popup-fade-in 0.7s cubic-bezier(.4,2,.6,1)",
        }}
      >
        <button
          onClick={() => setShow(false)}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "none",
            border: "none",
            fontSize: 22,
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>
        <h2 style={{ marginTop: 0, fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 26, marginBottom: 8 }}>
          Quick Booking
        </h2>
        <p style={{ marginBottom: 18, color: "#fff", fontWeight: 400 }}>
          Experience your dream wedding with us. Fill the form and our team will reach out!
        </p>
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
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              required
              onChange={e => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                border: "none",
                borderRadius: "5px",
                fontFamily: "'Cinzel', serif",
                fontSize: 15,
                fontWeight: 500,
                background: "#fff",
                color: "#212d47",
                outline: "none",
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
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                border: "none",
                borderRadius: "5px",
                fontFamily: "'Cinzel', serif",
                fontSize: 15,
                fontWeight: 500,
                background: "#fff",
                color: "#212d47",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#e7c1c2",
                color: "#212d47",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                width: "100%",
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: 16,
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