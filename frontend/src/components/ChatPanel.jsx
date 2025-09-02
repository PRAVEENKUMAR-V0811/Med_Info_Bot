import React, { useRef } from 'react';
import ChatMessage from './ChatMessage';


export default function ChatPanel({ activeConv, sendMessage }) {
    const inputRef = useRef();
    return (
        <div className="col-span-1 md:col-span-2 flex flex-col h-[70vh] bg-white rounded-lg shadow p-4">
            <div className="flex-1 overflow-auto space-y-4 p-2">
                {activeConv?.messages?.length ? (
                    activeConv.messages.map((m) => <ChatMessage key={m.id} message={m} />)
                ) : (
                    <div className="opacity-60 text-center mt-8">Say hi 👋 — ask questions about uploaded PDFs</div>
                )}
            </div>
            <div className="mt-4">
                <div className="form-control">
                    <div className="input-group">
                        <input ref={inputRef} type="text" placeholder="Ask something..." className="input input-bordered flex-1" onKeyDown={(e) => { if (e.key === 'Enter') { sendMessage(e.target.value); e.target.value = ''; } }} />
                        <button className="btn btn-primary" onClick={() => { const v = inputRef.current.value; sendMessage(v); inputRef.current.value = ''; }}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
}