import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

export default function LandingPage() {
  const [role, setRole] = useState("");
  const [showPasskey, setShowPasskey] = useState(false);
  const [passkey, setPasskey] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (role === "user") {
      navigate("/chat");
    } else if (role === "admin") {
      setShowPasskey(true);
    } else {
      toast.error("Please select a role before logging in.");
    }
  };

  const handleAdminLogin = () => {
    if (passkey === "admin123") {
      toast.success("Admin login successful!");
      navigate("/admin-panel");
    } else {
      toast.error("Invalid admin passkey!");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Toaster position="top-center" />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500 animate-pulse"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          ✨ MedXplorer ✨
        </motion.h1>

        <motion.p
          className="mt-4 text-lg md:text-xl text-gray-300 max-w-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Your intelligent assistant! Where Medical Knowledge Meets AI...
        </motion.p>

        {/* Disclaimer */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4 max-w-xl text-sm text-gray-400 border border-gray-700">
          <p>
            ⚠️ Disclaimer: For educational and informational purposes only and should not be considered medical advice. Always consult a qualified healthcare professional before making any medical decisions.
          </p>
        </div>

        {/* Login Section */}
        <div className="mt-8 flex flex-col items-center space-y-4 w-full max-w-xs mx-auto">
          <select
            className="w-40 p-3 rounded-xl bg-gray-800 border border-gray-600 text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-md transition"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">-- Select Role --</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleLogin}
            className="w-35 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl shadow-lg font-semibold text-white transition transform hover:-translate-y-1"
          >
            Login
          </button>
        </div>


        {/* Admin Passkey Modal */}
        {showPasskey && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-gray-900 p-6 rounded-xl shadow-lg w-80">
              <h2 className="text-xl font-bold mb-4">🔑 Admin Login</h2>
              <input
                type="password"
                placeholder="Enter Admin Passkey"
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 mb-4"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAdminLogin}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowPasskey(false)}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-500 text-sm border-t border-gray-800">
        © {new Date().getFullYear()} MedXplorer. All rights reserved.
      </footer>
    </div>
  );
}
