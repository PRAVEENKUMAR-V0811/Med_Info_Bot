import React from 'react';


export default function Sidebar({ role, setRole, onNewChat, conversations, setActiveConvId, activeConvId }) {
    return (
        <aside className="w-72 bg-base-100 border-r border-gray-200 p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">MyChat</h2>
                <div className="badge">{role === 'admin' ? 'Admin' : 'User'}</div>
            </div>
            <button className="btn btn-ghost btn-block" onClick={onNewChat}>+ New chat</button>
            <div className="flex-1 overflow-auto mt-2">
                {conversations.length === 0 ? (
                    <div className="text-sm opacity-60">No conversations yet. Start a new chat.</div>
                ) : (
                    conversations.map((c) => (
                        <div
                            key={c.id}
                            onClick={() => setActiveConvId(c.id)}
                            className={`p-3 rounded-md cursor-pointer mb-2 ${activeConvId === c.id ? 'bg-primary text-primary-content' : 'hover:bg-gray-100'}`}
                        >
                            <div className="font-medium truncate">{c.title || 'Untitled'}</div>
                            <div className="text-xs opacity-60">{c.lastUpdated && new Date(c.lastUpdated).toLocaleString()}</div>
                        </div>
                    ))
                )}
            </div>
            <div className="pt-2 border-t">
                <div className="form-control">
                    <label className="label"><span className="label-text">Role</span></label>
                    <div className="btn-group">
                        <button className={`btn ${role === 'user' ? 'btn-active' : ''}`} onClick={() => setRole('user')}>User</button>
                        <button className={`btn ${role === 'admin' ? 'btn-active' : ''}`} onClick={() => setRole('admin')}>Admin</button>
                    </div>
                </div>
            </div>
        </aside>
    );
}