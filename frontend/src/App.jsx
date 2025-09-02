import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import AdminPanel from './components/AdminPanel';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function App() {
  const [role, setRole] = useState("user");
  const [conversations, setConversations] = useState([
    { id: "c1", title: "New Chat", messages: [], lastUpdated: Date.now() },
  ]);
  const [activeConvId, setActiveConvId] = useState("c1");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
    localStorage.getItem("isAdmin") === "true"
  );
  const [password, setPassword] = useState("");

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  function updateActiveConv(callback) {
    setConversations((convs) =>
      convs.map((c) =>
        c.id === activeConvId ? callback(c) : c
      )
    );
  }

  async function sendMessage(text) {
    if (!text?.trim()) return;
    const userMsg = { id: `m_${Date.now()}`, from: "user", text, time: Date.now() };
    updateActiveConv((conv) => ({
      ...conv,
      messages: [...conv.messages, userMsg],
      lastUpdated: Date.now(),
    }));
    const toastId = toast.loading("Thinking...");
    try {
      const res = await axios.post(`${API_BASE}/chat`, { query: text });
      const botText = res?.data?.answer || res?.data?.message || JSON.stringify(res.data);
      const botMsg = { id: `m_${Date.now() + 1}`, from: "bot", text: botText, time: Date.now() };
      updateActiveConv((conv) => ({
        ...conv,
        messages: [...conv.messages, botMsg],
        lastUpdated: Date.now(),
      }));
      toast.success("Response received", { id: toastId });
    } catch (err) {
      const botMsg = { id: `m_${Date.now() + 2}`, from: "bot", text: "Error: " + err.message, time: Date.now() };
      updateActiveConv((conv) => ({
        ...conv,
        messages: [...conv.messages, botMsg],
        lastUpdated: Date.now(),
      }));
      toast.error("Failed to get response", { id: toastId });
    }
  }

  function tryAdminLogin(e) {
    e.preventDefault();
    if (password === "admin123") {
      localStorage.setItem("isAdmin", "true");
      setIsAdminLoggedIn(true);
      toast.success("Admin logged in");
    } else {
      toast.error("Wrong password");
    }
  }

  return (
    <div className="h-screen flex bg-base-200">
      <Toaster position="top-right" />
      <Sidebar
        role={role}
        setRole={setRole}
        onNewChat={() =>
          setConversations((prev) => [
            ...prev,
            { id: `c_${Date.now()}`, title: "New Chat", messages: [], lastUpdated: Date.now() },
          ])
        }
        conversations={conversations}
        setActiveConvId={setActiveConvId}
        activeConvId={activeConvId}
      />

      <main className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-base-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{activeConv?.title || "Chat"}</h3>

          {role === "admin" && !isAdminLoggedIn && (
            <form onSubmit={tryAdminLogin} className="flex items-center gap-2">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Admin password"
                className="input input-sm input-bordered"
              />
              <button className="btn btn-sm" type="submit">Login</button>
            </form>
          )}

          {role === "admin" && isAdminLoggedIn && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                localStorage.removeItem("isAdmin");
                setIsAdminLoggedIn(false);
                toast("Logged out");
              }}
            >
              Logout
            </button>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <ChatPanel activeConv={activeConv} sendMessage={sendMessage} />
          {role === "admin" && isAdminLoggedIn ? (
            <AdminPanel API_BASE={API_BASE} />
          ) : (
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="font-medium">Tips</h4>
              <ul className="list-disc ml-5 mt-2 text-sm opacity-80">
                <li>Ask questions about uploaded PDFs.</li>
                <li>Admins can upload documents for improved context.</li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
