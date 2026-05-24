/**
 * src/components/student/ResumeUploadCard.jsx
 */
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadResume } from "@/API/api";
import useAuthStore from "@/store/authStore";
import { T, getTheme } from "@/tokens";

export default function ResumeUploadCard({ dark = true }) {
  const th = getTheme(dark);
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isHovered, setIsHovered] = useState(false);
  
  // Get the logged-in student's ID from our global auth store
  const { user } = useAuthStore();

  const { mutate: submitFile, isPending } = useMutation({
    mutationFn: uploadResume,
    onSuccess: () => {
      setStatus({ type: "success", message: "Resume uploaded successfully!" });
      setFile(null); 
      // FIX: Clear the hidden input to allow re-uploading the same file
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    },
    onError: (error) => { /* ... */ }
  });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setStatus({ type: "", message: "" });

    if (!selected) return;

    // FIX: Spoof protection. Check actual extension, not just MIME type
    const ext = selected.name.split(".").pop()?.toLowerCase();
    
    if (selected.type !== "application/pdf" || ext !== "pdf") {
      setStatus({ type: "error", message: "Please select a valid PDF file." });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    
    if (selected.size > 5 * 1024 * 1024) {
      setStatus({ type: "error", message: "File size must be under 5MB." });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFile(selected);
  };

  const handleUpload = () => {
    if (!file) return; // Only block if there's no file selected

    // 1. Pack the physical file into a FormData "box"
    const formData = new FormData();
    formData.append("file", file);
    
    // ❌ We deleted formData.append("student_id", user.student_id);
    // ✅ The backend will securely identify the user via their JWT instead!

    // 2. Ship it to FastAPI
    submitFile(formData);
  };

  return (
    <div style={{
      background: th.surface,
      border: `1px solid ${th.border}`,
      borderRadius: 14,
      padding: 24,
      fontFamily: T.font
    }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontFamily: T.fontSerif, fontSize: 20, color: th.textPrimary, margin: "0 0 4px 0" }}>
          Upload Resume
        </h3>
        <p style={{ fontSize: 13.5, color: th.textSecondary, margin: 0 }}>
          Upload your latest resume in PDF format for companies to review.
        </p>
      </div>

      {status.message && (
        <div style={{
          padding: "10px 14px",
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 13.5,
          fontWeight: 500,
          background: status.type === "success" ? T.successDim : T.dangerDim,
          color: status.type === "success" ? T.success : T.danger,
        }}>
          {status.message}
        </div>
      )}

      {/* The visible drop zone */}
      <div 
        onClick={() => !isPending && fileInputRef.current.click()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          border: `2px dashed ${file ? T.amber : (isHovered ? T.amber : th.borderUp)}`,
          borderRadius: 12,
          padding: "32px 20px",
          textAlign: "center",
          cursor: isPending ? "not-allowed" : "pointer",
          background: file ? T.amberDim : (isHovered ? th.surfaceUp : "transparent"),
          transition: "all 0.2s ease",
          opacity: isPending ? 0.5 : 1
        }}
      >
        <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>{file ? "📄" : "📥"}</span>
        <p style={{ fontSize: 14, fontWeight: 500, color: th.textPrimary, margin: "0 0 4px 0" }}>
          {file ? file.name : "Click to select a PDF"}
        </p>
        <p style={{ fontSize: 12, color: th.textMuted, margin: 0 }}>Maximum file size: 5MB</p>
      </div>

      {/* The hidden actual HTML input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        style={{ display: "none" }}
      />

      <button
        onClick={handleUpload}
        disabled={!file || isPending}
        style={{
          width: "100%",
          marginTop: 16,
          padding: "12px",
          background: (!file || isPending) ? th.surfaceUp : T.amber,
          color: (!file || isPending) ? th.textMuted : "#1C1917",
          border: (!file || isPending) ? `1px solid ${th.border}` : "none",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          cursor: (!file || isPending) ? "not-allowed" : "pointer",
          fontFamily: T.font,
          transition: "background 0.2s",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8
        }}
      >
        {isPending ? "Uploading..." : "Save Resume"}
      </button>
    </div>
  );
}