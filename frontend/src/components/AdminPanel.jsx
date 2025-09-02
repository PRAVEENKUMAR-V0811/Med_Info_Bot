import React, { useState } from "react";
import { FiUploadCloud, FiTrash2 } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function AdminPanel() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFile = (file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed!");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be less than 10MB");
      return;
    }
    if (files.some((f) => f.name === file.name)) {
      toast.error(`${file.name} is already added!`);
      return;
    }

    setFiles((prev) => [...prev, file]);
    toast.success(`${file.name} added!`);
  };

  const handleFileInput = (e) => {
    Array.from(e.target.files).forEach(handleFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    Array.from(e.dataTransfer.files).forEach(handleFile);
  };

  const handleRemove = (fileName) => {
    setFiles(files.filter((f) => f.name !== fileName));
    toast("File removed", { icon: "🗑️" });
  };

  const handleProcess = async () => {
  if (files.length === 0) {
    toast.error("No files selected!");
    return;
  }

  setLoading(true);
  toast.loading("Processing files...", { id: "processToast" });

  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);

    toast.dismiss("processToast");

    if (data.success) {
      toast.success(data.message);
      setFiles([]);
    } else {
      toast.error("Failed to process files.");
    }
  } catch (err) {
    toast.dismiss("processToast");
    toast.error("Error uploading files.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  const handleTryChatbot = () => {
    // Redirect to chatbot page or open modal
    window.location.href = "/chat"; // change route as needed
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-[#38BDF8] text-white text-lg font-bold py-4 px-6 shadow-md flex justify-between items-center">
        <span>Smart Chatbot – Admin Panel</span>
        <button
          onClick={handleTryChatbot}
          className="bg-white text-[#38BDF8] font-semibold px-4 py-1.5 rounded-md hover:bg-gray-100 transition cursor-pointer"
        >
          Try Chatbot
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Drop Box */}
        {files.length === 0 && !loading && (
          <div
            className="border-2 border-dashed border-gray-300 bg-white p-10 rounded-xl cursor-pointer hover:border-[#38BDF8] transition text-center w-full max-w-xl"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("fileInput").click()}
          >
            <FiUploadCloud className="text-4xl text-[#38BDF8] mx-auto mb-3" />
            <p className="text-base font-medium text-gray-600">
              Drag & drop your PDF files
            </p>
            <p className="text-sm text-gray-500">
              or click to browse (multiple, max 10MB each)
            </p>
            <input
              id="fileInput"
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="h-10 w-10 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#38BDF8]">
              Processing files...
            </p>
          </div>
        )}

        {/* Selected Files */}
        {files.length > 0 && !loading && (
          <div className="mt-6 w-full max-w-xl text-center">
            <h3 className="font-medium text-gray-700 mb-3">Selected Files:</h3>
            <ul className="space-y-2 text-left">
              {files.map((file, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center bg-white px-4 py-2 rounded-lg shadow-sm border"
                >
                  <span className="text-sm text-gray-700">
                    {file.name}{" "}
                    <span className="text-xs text-gray-400">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </span>
                  <button
                    onClick={() => handleRemove(file.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>

            <button
              onClick={handleProcess}
              disabled={loading}
              className={`mt-6 px-6 py-2 rounded-lg bg-[#38BDF8] text-white font-medium shadow-md hover:bg-[#0ea5e9] transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Processing..." : "Upload & Process"}
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-10 max-w-xl text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-1">Disclaimer:</h3>
          <p>
            Uploaded PDF files are used only for processing and are not stored
            permanently. Please do not upload sensitive or confidential
            documents.
          </p>
        </div>
      </main>
    </div>
  );
}
