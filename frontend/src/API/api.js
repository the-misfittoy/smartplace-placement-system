/**
 * src/API/api.js
 * Strictly secured Axios instance mapping to FastAPI endpoints.
 */

import axios from "axios";
import useAuthStore from "@/store/authStore";

// ─── 1. SECURE API CONFIGURATION ───
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL && import.meta.env.PROD) {
  // Hard crash in production to prevent silent localhost failures
  throw new Error("CRITICAL: VITE_API_URL is missing in production environment!");
} else if (!API_URL) {
  console.warn("VITE_API_URL is missing. Defaulting to local backend.");
}

// ── Secure Axios Instance ─────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Security Interceptor: Request ─────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ── Security Interceptor: Response ────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clean delegation: Auth store handles the token clearing AND the redirect
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATION (Signatures aligned with Auth components)
// ─────────────────────────────────────────────────────────────────────────────
export const login = (username, password) =>
  api.post("/login", { username, password }).then((r) => r.data);

export const requestPasswordReset = (email) => 
  api.post("/forgot-password", { email }).then((r) => r.data);

export const resetPassword = (token, new_password) => 
  api.post("/reset-password", { token, new_password }).then((r) => r.data);

// ─────────────────────────────────────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────────────────────────────────────
export const getStudents = () => api.get("/students").then((r) => r.data);
export const getStudent = (id) => api.get(`/students/${id}`).then((r) => r.data);
export const createStudent = (body) => api.post("/students", body).then((r) => r.data);
export const updateStudent = ({ id, ...body }) => api.put(`/update-student/${id}`, body).then((r) => r.data);
export const updateStudentProfile = ({ id, ...body }) => api.put(`/students/${id}/profile`, body).then((r) => r.data);
export const deleteStudent = (id) => api.delete(`/students/${id}`).then((r) => r.data);

// ─────────────────────────────────────────────────────────────────────────────
// COMPANIES
// ─────────────────────────────────────────────────────────────────────────────
export const getCompanies = () => api.get("/companies").then((r) => r.data);
export const getCompany = (id) => api.get(`/companies/${id}`).then((r) => r.data);
export const createCompany = (body) => api.post("/companies", body).then((r) => r.data);
export const updateCompany = ({ id, ...body }) => api.put(`/companies/${id}`, body).then((r) => r.data);
export const deleteCompany = (id) => api.delete(`/companies/${id}`).then((r) => r.data);

// ─────────────────────────────────────────────────────────────────────────────
// DRIVES
// ─────────────────────────────────────────────────────────────────────────────
export const getDrives = () => api.get("/drives").then((r) => r.data);
export const createDrive = (body) => api.post("/drives", body).then((r) => r.data);

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const getApplications = (params = {}) => api.get("/applications", { params }).then((r) => r.data);
export const applyForDrive = (body) => api.post("/apply", body).then((r) => r.data);
export const updateApplication = ({ id, ...body }) => api.put(`/applications/${id}`, body).then((r) => r.data);

// ─────────────────────────────────────────────────────────────────────────────
// RESULTS & OFFERS
// ─────────────────────────────────────────────────────────────────────────────
export const getResults = () => api.get("/results").then((r) => r.data);
export const addResult = (body) => api.post("/results", body).then((r) => r.data);

export const getOffers = () => api.get("/offers").then((r) => r.data);
export const createOffer = (body) => api.post("/offers", body).then((r) => r.data);
export const updateOffer = ({ id, ...body }) => api.put(`/offers/${id}`, body).then((r) => r.data);

export const getStudentOffers = () => api.get("/student-offers").then((r) => r.data);
export const requestOfferOTP = (offerId) => api.post(`/offers/${offerId}/request-acceptance-otp`).then((r) => r.data);
export const confirmOfferOTP = (offerId, otpCode) => api.post(`/offers/${offerId}/confirm-acceptance`, { otp_code: otpCode }).then((r) => r.data);

// ─────────────────────────────────────────────────────────────────────────────
// PLACED STUDENTS
// ─────────────────────────────────────────────────────────────────────────────
export const getPlacedStudents = () => api.get("/placed-students").then((r) => r.data);

// ─────────────────────────────────────────────────────────────────────────────
// SMART FEATURES & AI
// ─────────────────────────────────────────────────────────────────────────────
export const getStrategy = (studentId) => api.get(`/placement-strategy/${studentId}`).then((r) => r.data);
export const getSimulator = (studentId, targetCgpa) => api.get(`/whatif-simulator/${studentId}`, { params: { target_cgpa: targetCgpa } }).then((r) => r.data);
export const getRejectionAnalysis = (studentId) => api.get(`/rejection-analysis/${studentId}`).then((r) => r.data);

// ── Strict Dream Company Workflow ──
export const getDreamApplications = (studentId) => api.get(`/dream-applications/${studentId}`).then((r) => r.data);
export const getDreamEligibleDrives = (studentId) => api.get(`/dream-eligible-drives/${studentId}`).then((r) => r.data);
export const applyDreamCompany = (body) => api.post("/apply-dream-company", body).then((r) => r.data);

export const sendChatMessage = (body) => api.post("/voice-chat", body).then((r) => r.data);

// ─────────────────────────────────────────────────────────────────────────────
// AI PLACEMENT COACH
// ─────────────────────────────────────────────────────────────────────────────
export const analyzeResume = ({ resume_text, company_id }) =>
  api.post("/resume-feedback", { resume_text, company_id }).then((r) => r.data);

export const forwardResumeToTPO = ({ company_name, role, ats_score }) => 
  api.post("/resume-feedback/forward-tpo", { company_name, role, ats_score }).then((r) => r.data);

// ─────────────────────────────────────────────────────────────────────────────
// FILE UPLOADS
// ─────────────────────────────────────────────────────────────────────────────
export const uploadResume = (formData) =>
  api.post("/upload-resume", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Crucial for binary files!
    },
  }).then((r) => r.data);

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARDS & ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────
export const getTpoDashboard = () => api.get("/tpo-dashboard").then((r) => r.data);
export const getStudentDashboard = (studentId) => api.get(`/student-dashboard/${studentId}`).then((r) => r.data);
export const getCompanyDashboard = () => api.get("/company-dashboard").then((r) => r.data);
export const getDashboardSummary = () => api.get("/dashboard-summary").then((r) => r.data);

// ─────────────────────────────────────────────────────────────────────────────
// SECURE RESUME DOWNLOAD
// ─────────────────────────────────────────────────────────────────────────────
// Note: We use responseType: 'blob' here because the backend returns a physical PDF file
export const downloadResume = (filename) => 
  api.get(`/resumes/${filename}`, { responseType: 'blob' }).then((r) => r.data);

export const triggerResumeDownload = async (filename) => {
  try {
    const blob = await downloadResume(filename);
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    
    // Crucial Memory Cleanup Fix
    link.remove();
    window.URL.revokeObjectURL(url); 
  } catch (error) {
    console.error("Failed to download resume securely:", error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DIRECT MESSAGES (DMs)
// ─────────────────────────────────────────────────────────────────────────────
export const getDmContacts = () => api.get("/dms/contacts").then((r) => r.data);
export const getDmHistory = (contactId) => api.get(`/dms/${contactId}`).then((r) => r.data);
export const sendDmMessage = ({ receiver_id, message_text }) => api.post("/dms/send", { receiver_id, message_text }).then((r) => r.data);

// ─────────────────────────────────────────────────────────────────────────────
// ADVANCED AI/ML SERVICES
// ─────────────────────────────────────────────────────────────────────────────
export const getTpoPlacementRisk = () => api.get("/tpo/placement-risk").then((r) => r.data);
export const generateCoachingStrategy = (studentId) => api.post(`/tpo/students/${studentId}/coaching-strategy`).then((r) => r.data);
export const hrSemanticSearch = (query) => api.post("/hr/semantic-search", { query }).then((r) => r.data);
export const submitMockAnswer = (payload) => api.post("/mock-interview/next-question", payload).then((r) => r.data);