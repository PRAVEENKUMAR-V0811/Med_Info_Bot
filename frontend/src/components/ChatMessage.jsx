import React from 'react';
import { motion } from 'framer-motion';


export default function ChatMessage({ message }) {
    const isUser = message.from === 'user';
    return (
        <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={`max-w-[72%] p-4 rounded-lg ${isUser ? 'bg-primary text-primary-content rounded-br-none' : 'bg-base-200'}`}
            >
                <div className="whitespace-pre-wrap">{message.text}</div>
                <div className="text-xs opacity-60 mt-2 text-right">{new Date(message.time).toLocaleTimeString()}</div>
            </motion.div>
        </div>
    );
}