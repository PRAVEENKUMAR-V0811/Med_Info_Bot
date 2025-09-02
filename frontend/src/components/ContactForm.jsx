import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import emailjs from "@emailjs/browser";
import { useNavigate, Link } from "react-router-dom";
import ContactImage from '../assets/image.png'; // replace with your image path
import MedLogo from '../assets/MedLogo.png';

export default function ContactForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  // Load environment variables (Vite requires prefix VITE_)
  const SERVICE_ID = import.meta.env.VITE_SERVICE_ID;
  const TEMPLATE_ID = import.meta.env.VITE_TEMPLATE_ID;
  const PUBLIC_KEY = import.meta.env.VITE_PUBLIC_KEY;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill all required fields!");
      return;
    }

    setLoading(true);
    toast.loading("Sending message...", { id: "sendToast" });

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        formData,
        PUBLIC_KEY
      );
      toast.dismiss("sendToast");
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.dismiss("sendToast");
      toast.error("Failed to send message. Try again later.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-['Urbanist'] bg-[#FDFEFE]">
      <Toaster position="top-right" />

      {/* Header with Try Bot Button */}
      <header className="bg-[#38BDF8] text-white flex justify-between items-center px-6 py-4 shadow-md">
      <div className="flex items-center gap-2">
        <Link to="/">
            <img 
              src={MedLogo} 
              alt="MedXplorer Logo" 
              className="h-8 w-auto cursor-pointer"
            />
          </Link>
        <h1 className="text-xl font-bold">Contact Us</h1>
      </div>

      <button
        onClick={() => navigate("/chat")}
        className="bg-white text-[#38BDF8] px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
      >
        Try Bot
      </button>
    </header>


      <div className="flex flex-1 overflow-hidden p-6 gap-6">
        {/* Left: Contact Form */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-md flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 cursor-pointer">Send us a message</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="form-input border border-gray-300 rounded-md px-3 py-2"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="form-input border border-gray-300 rounded-md px-3 py-2"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="subject"
              placeholder="Subject (optional)"
              className="form-input border border-gray-300 rounded-md px-3 py-2"
              value={formData.subject}
              onChange={handleChange}
            />
            <textarea
              name="message"
              rows="5"
              placeholder="Your Message"
              className="form-input border border-gray-300 rounded-md px-3 py-2 resize-none flex-1"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>

            <button
              type="submit"
              disabled={loading}
              className={`bg-[#38BDF8] text-white px-4 py-2 rounded-md font-medium hover:bg-[#0ea5e9] transition mt-2 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Right: Image + Disclaimer */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-md flex flex-col justify-between items-center">
          {/* Image */}
          <img
            src={ContactImage}
            alt="Contact Illustration"
            className="max-h-100 object-contain mb-4"
          />

          {/* Disclaimer at bottom */}
          <div className="text-gray-500 text-sm text-center">
            <p>This form is for submitting new drug suggestions or queries.</p>
            <p>Responses may not be immediate. Use responsibly.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-xs py-2 border-t border-gray-200">
        © 2025 MedXplorer. All rights reserved.
      </footer>
    </div>
  );
}
