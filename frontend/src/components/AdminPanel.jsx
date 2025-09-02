import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';


export default function AdminPanel({ API_BASE }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);


    function onFilesSelected(e) {
        setFiles(Array.from(e.target.files));
    }


    async function upload() {
        if (files.length === 0) return toast('No files selected');
        setUploading(true);
        const form = new FormData();
        files.forEach((f) => form.append('files', f));
        try {
            const res = await axios.post(`${API_BASE}/upload`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success(res?.data?.message || 'Upload successful');
            setFiles([]);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    }


    return (
        <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Upload PDFs</h3>
            <input type="file" accept=".pdf" multiple onChange={onFilesSelected} className="file-input file-input-bordered w-full max-w-xs" />
            {files.length > 0 && (
                <ul className="mt-4 space-y-2">
                    {files.map((f, idx) => <li key={idx} className="text-sm">{f.name}</li>)}
                </ul>
            )}
            <div className="flex gap-2 mt-4">
                <button className={`btn btn-primary ${uploading ? 'loading' : ''}`} onClick={upload}>Upload</button>
                <button className="btn btn-ghost" onClick={() => setFiles([])}>Clear</button>
            </div>
        </div>
    );
}