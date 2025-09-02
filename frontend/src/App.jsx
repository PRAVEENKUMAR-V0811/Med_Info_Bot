import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatbotLanding from "./components/LandingPage.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import AdminPanel from "./components/AdminPanel";
import ContactForm from "./components/ContactForm.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatbotLanding />} />
        <Route path="/chat" element={<ChatPanel />} />
        <Route path="/admin-panel" element={<AdminPanel />} />
        <Route path="/support" element={<ContactForm />} />
      </Routes>
    </Router>
  );
}
