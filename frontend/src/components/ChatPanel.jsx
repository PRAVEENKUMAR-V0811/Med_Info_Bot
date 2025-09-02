import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // React Router for navigation
import MedLogo from "../assets/MedLogo.png"

const LOCAL_STORAGE_KEY = "chatbot_conversations";

export default function ChatPanel() {
  const [conversations, setConversations] = useState([
    { title: "Chat 1", messages: [] }, // default chat
  ]);
  const [activeChatIndex, setActiveChatIndex] = useState(0);
  const [inputMessage, setInputMessage] = useState("");
  const [botThinking, setBotThinking] = useState(false);

  const chatEndRef = useRef(null);
  const sidePanelRef = useRef(null);

  const BACKEND_URL = "http://127.0.0.1:8000/chat"; // Update if backend is hosted elsewhere

  // Load conversations from localStorage
  useEffect(() => {
    const savedConversations = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_KEY)
    );
    if (savedConversations) {
      setConversations(savedConversations);
      setActiveChatIndex(0);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  // Scroll chat to bottom whenever messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatIndex, conversations, botThinking]);

  const handleNewChat = () => {
    const newChat = {
      title: `Chat ${conversations.length + 1}`,
      messages: [],
    };
    setConversations([newChat, ...conversations]);
    setActiveChatIndex(0);
  };

  const handleDeleteChat = (index) => {
    const updated = conversations.filter((_, i) => i !== index);
    setConversations(updated);
    if (activeChatIndex === index) setActiveChatIndex(null);
    else if (activeChatIndex > index) setActiveChatIndex(activeChatIndex - 1);
  };

  const handleClearChat = () => {
    if (activeChatIndex === null) return;
    const updatedConversations = [...conversations];
    updatedConversations[activeChatIndex].messages = [];
    setConversations(updatedConversations);
  };

  const handleSelectChat = (index) => {
    setActiveChatIndex(index);
  };

  // Send message to backend
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || activeChatIndex === null) return;

    const updatedConversations = [...conversations];
    const userMessage = { type: "user", text: inputMessage };
    updatedConversations[activeChatIndex].messages.push(userMessage);
    setConversations(updatedConversations);
    setInputMessage("");
    setBotThinking(true);

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.text }),
      });

      const data = await response.json();
      const botMessage = {
        type: "bot",
        text: data.answer || "Sorry, no response from server.",
      };

      const updated = [...updatedConversations];
      updated[activeChatIndex].messages.push(botMessage);
      setConversations(updated);
    } catch (error) {
      console.error("Error contacting backend:", error);
      const botMessage = {
        type: "bot",
        text: "There was an error contacting the server. Please try again.",
      };
      const updated = [...updatedConversations];
      updated[activeChatIndex].messages.push(botMessage);
      setConversations(updated);
    } finally {
      setBotThinking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div className="min-h-screen flex flex-col font-['Urbanist'] bg-[#FDFEFE]">
      {/* Header */}
      <header className="bg-[#38BDF8] text-white text-xl font-bold py-4 px-6 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/">
                      <img 
                        src={MedLogo} 
                        alt="MedXplorer Logo" 
                        className="h-8 w-auto cursor-pointer"
                      />
                    </Link>
                    <Link to="/">
                      <span>MedXplorer – Admin Panel</span>
                    </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white text-sm font-normal">
            To add a new drug in our documentation, please contact us
          </span>
          <Link
            to="/support"
            className="bg-white text-[#38BDF8] px-3 py-1 rounded-md font-medium hover:bg-gray-100 transition"
          >
            Contact
          </Link>
        </div>
      </header>



      <div className="flex flex-1 overflow-hidden">
        {/* Side Panel */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 flex flex-col flex-1 overflow-hidden">
            <div className="flex flex-col mb-4">
              <button
                onClick={handleNewChat}
                className="mb-2 p-2 bg-[#38BDF8] text-white rounded-md hover:bg-[#0ea5e9] transition"
              >
                + New Chat
              </button>
              {activeChatIndex !== null && (
                <button
                  onClick={handleClearChat}
                  className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                >
                  Clear Chat
                </button>
              )}
            </div>
            <div
              className="flex-1 overflow-y-auto"
              ref={sidePanelRef}
              style={{ scrollbarWidth: "thin" }}
            >
              {conversations.length === 0 && (
                <p className="text-gray-400 text-center mt-10">
                  No chats yet.
                </p>
              )}
              <ul>
                {conversations.map((chat, index) => (
                  <li
                    key={index}
                    className={`flex justify-between items-center cursor-pointer px-4 py-2 border-b border-gray-100 ${
                      index === activeChatIndex
                        ? "bg-[#E0F2FE]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span onClick={() => handleSelectChat(index)}>
                      {chat.title}
                    </span>
                    <button
                      onClick={() => handleDeleteChat(index)}
                      className="text-red-500 text-xs hover:text-red-700"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-3 text-sm text-gray-500 border-t border-gray-200 text-center">
              ⚠️ Disclaimer : For informational purposes only. Not a substitute for professional medical advice.
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {activeChatIndex === null ? (
              <p className="text-gray-400 text-center mt-20">
                Select a chat or start a new conversation.
              </p>
            ) : (
              <>
                {conversations[activeChatIndex].messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg max-w-xs break-words ${
                        msg.type === "user"
                          ? "bg-[#38BDF8] text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {botThinking && (
                  <div className="flex justify-start">
                    <div className="flex items-center px-4 py-2 bg-gray-100 rounded-lg gap-1 animate-pulse">
                      <div className="h-2 w-2 bg-gray-400 rounded-full" />
                      <div className="h-2 w-2 bg-gray-400 rounded-full" />
                      <div className="h-2 w-2 bg-gray-400 rounded-full" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {activeChatIndex !== null && (
            <div className="p-4 border-t border-gray-200 flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#38BDF8]"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#38BDF8] text-white px-4 py-2 rounded-md hover:bg-[#0ea5e9] transition"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center text-gray-400 text-xs py-2 border-t border-gray-200">
        © 2025 MedXplorer. All rights reserved.
      </footer>
    </div>
  );
}
