/**
 * src/pages/student/MockInterview.jsx
 * Premium AI Voice & Text Mock Interview Simulator with real-time ATS scoring.
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Play, Mic, MicOff, Send, RefreshCw, X, Award, CheckCircle2, ChevronRight, Volume2, VolumeX } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { useSubmitMockAnswer } from "@/hooks/useQueries";
import { T, getTheme } from "@/tokens";
import { useOutletContext } from "react-router-dom";

export default function MockInterview() {
  const { dark = true } = useOutletContext() || {};
  const th = getTheme(dark);
  
  const [step, setStep] = useState("setup"); // setup | interview | feedback
  const [company, setCompany] = useState("Google");
  const [role, setRole] = useState("Software Development Engineer (SDE)");
  
  const [customCompany, setCustomCompany] = useState("");
  const [customRole, setCustomRole] = useState("");

  const [voicesList, setVoicesList] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answerInput, setAnswerInput] = useState("");
  const [round, setRound] = useState(1);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sttTranscript, setSttTranscript] = useState("");

  const [evaluation, setEvaluation] = useState(null);

  const { mutate: submitAnswer, isPending: submittingAnswer } = useSubmitMockAnswer();

  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  const targetCompany = company === "Custom" ? customCompany : company;
  const targetRole = role === "Custom" ? customRole : role;

  // Load voices asynchronously
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const loadVoices = () => {
      setVoicesList(window.speechSynthesis.getVoices() || []);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Cleanup synthesis and speech recognition on unmount
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Speech Synthesis Helper (tts)
  const speakQuestion = useCallback((text) => {
    if (!("speechSynthesis" in window) || !ttsEnabled) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.pitch = 1.05;

    if (voicesList && voicesList.length > 0) {
      const premiumVoice = 
        voicesList.find(v => (v.lang === "en-IN" || v.lang === "en_IN") && v.name.includes("Google")) ||
        voicesList.find(v => (v.lang === "en-IN" || v.lang === "en_IN") && v.name.includes("Natural")) ||
        voicesList.find(v => (v.lang === "en-IN" || v.lang === "en_IN") && v.name.includes("Online")) ||
        voicesList.find(v => (v.lang === "en-IN" || v.lang === "en_IN")) ||
        voicesList.find(v => (v.lang === "en-US" || v.lang === "en_US") && v.name.includes("Google")) ||
        voicesList.find(v => v.lang.startsWith("en"));
        
      if (premiumVoice) {
        utterance.voice = premiumVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  }, [ttsEnabled]);

  // Speech Recognition Helper (stt)
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please try Chrome.");
      return;
    }
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
      setSttTranscript("Listening...");
    };

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join("");
      setSttTranscript(transcript);
      setAnswerInput(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Start the simulated interview
  const handleStart = () => {
    if (company === "Custom" && !customCompany) return;
    if (role === "Custom" && !customRole) return;

    setStep("interview");
    setRound(1);
    setHistory([]);
    setAnswerInput("");
    setEvaluation(null);

    const payload = {
      company: targetCompany,
      role: targetRole,
      question: null,
      answer: null,
      history: []
    };

    submitAnswer(payload, {
      onSuccess: (data) => {
        setCurrentQuestion(data.question);
        setHistory(data.history);
        speakQuestion(data.question);
      }
    });
  };

  // Submit current answer and load next question
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const ans = answerInput.trim();
    if (!ans || submittingAnswer) return;

    stopListening();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const payload = {
      company: targetCompany,
      role: targetRole,
      question: currentQuestion,
      answer: ans,
      history: history
    };

    submitAnswer(payload, {
      onSuccess: (data) => {
        if (data.done) {
          setEvaluation(data);
          setHistory(data.history);
          setStep("feedback");
        } else {
          setCurrentQuestion(data.question);
          setHistory(data.history);
          setAnswerInput("");
          setRound(prev => prev + 1);
          speakQuestion(data.question);
        }
      }
    });
  };

  // Skip / reset mock interview session
  const handleReset = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    stopListening();
    setStep("setup");
    setHistory([]);
    setCurrentQuestion("");
    setAnswerInput("");
    setRound(1);
    setEvaluation(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: 32, fontFamily: T.font, maxWidth: 900, margin: "0 auto" }}>
      
      {/* STEP 1: SETUP CONSOLE */}
      {step === "setup" && (
        <div style={{
          background: th.surface, border: `1px solid ${th.border}`,
          borderRadius: 20, padding: 40, display: "flex", flexDirection: "column", gap: 32,
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, background: T.amberDim,
                border: `1px solid ${T.amberBorder}`, display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Sparkles size={18} color={T.amber} />
              </div>
              <h2 style={{ fontFamily: T.fontSerif, fontSize: 24, fontWeight: 700, color: th.textPrimary, margin: 0 }}>
                AI Voice Mock Interview Sandbox
              </h2>
            </div>
            <p style={{ color: th.textSecondary, fontSize: 14, margin: 0 }}>
              Practice voice or text technical interviews tailored directly to your dream companies. Our Gemini AI behaves as a real recruiter, asking targeted questions and assessing your responses.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {/* Company Selection */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: th.textMuted }}>Target Company</label>
              <select
                value={company}
                onChange={e => setCompany(e.target.value)}
                style={{
                  padding: 12, background: th.surfaceUp, border: `1.5px solid ${th.borderUp}`,
                  borderRadius: 10, color: th.textPrimary, outline: "none", fontSize: 14, fontFamily: T.font
                }}
              >
                {["Google", "Microsoft", "Amazon", "Deloitte", "TCS", "Infosys", "Accenture", "Custom"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {company === "Custom" && (
                <input
                  value={customCompany}
                  onChange={e => setCustomCompany(e.target.value)}
                  placeholder="Enter custom company name..."
                  style={{
                    padding: 12, background: th.surfaceUp, border: `1.5px solid ${th.borderUp}`,
                    borderRadius: 10, color: th.textPrimary, outline: "none", fontSize: 13.5, fontFamily: T.font, marginTop: 6
                  }}
                />
              )}
            </div>

            {/* Role Selection */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: th.textMuted }}>Target Position / Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                style={{
                  padding: 12, background: th.surfaceUp, border: `1.5px solid ${th.borderUp}`,
                  borderRadius: 10, color: th.textPrimary, outline: "none", fontSize: 14, fontFamily: T.font
                }}
              >
                {[
                  "Software Development Engineer (SDE)",
                  "Frontend Engineer",
                  "Backend Engineer",
                  "Data Scientist",
                  "Machine Learning Engineer",
                  "Cloud Architect",
                  "Systems Analyst",
                  "Custom"
                ].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {role === "Custom" && (
                <input
                  value={customRole}
                  onChange={e => setCustomRole(e.target.value)}
                  placeholder="Enter custom job title..."
                  style={{
                    padding: 12, background: th.surfaceUp, border: `1.5px solid ${th.borderUp}`,
                    borderRadius: 10, color: th.textPrimary, outline: "none", fontSize: 13.5, fontFamily: T.font, marginTop: 6
                  }}
                />
              )}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={submittingAnswer}
            style={{
              padding: "14px 28px", borderRadius: 12, background: T.amber, color: T.amberText,
              border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            <Play size={16} fill="currentColor" /> {submittingAnswer ? "Spinning up simulator..." : "Begin Simulated Interview"}
          </button>
        </div>
      )}

      {/* STEP 2: ACTIVE INTERVIEW SANDBOX */}
      {step === "interview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Header Dashboard status */}
          <div style={{
            background: th.surface, border: `1px solid ${th.border}`, borderRadius: 16,
            padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: 12, color: th.textMuted, fontWeight: 600, textTransform: "uppercase" }}>Current Session</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: th.textPrimary }}>
                {targetCompany} • {targetRole}
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: th.textSecondary, fontWeight: 600, background: th.surfaceUp, border: `1px solid ${th.borderUp}`, padding: "6px 12px", borderRadius: 20 }}>
                Question {round} of 3
              </span>
              <button
                onClick={handleReset}
                style={{
                  background: "none", border: "none", color: T.danger, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600
                }}
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </div>

          {/* AI Interviewer Avatar Card */}
          <div style={{
            background: th.surface, border: `1px solid ${th.border}`, borderRadius: 20,
            padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", position: "relative"
          }}>
            {/* Audio configuration toggles */}
            <button
              onClick={() => {
                const next = !ttsEnabled;
                setTtsEnabled(next);
                if (!next && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                } else if (next && currentQuestion) {
                  speakQuestion(currentQuestion);
                }
              }}
              style={{
                position: "absolute", right: 20, top: 20, background: th.surfaceUp, border: `1px solid ${th.borderUp}`,
                borderRadius: "50%", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: ttsEnabled ? T.amber : th.textMuted
              }}
            >
              {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Glowing Sound Orb */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 100, height: 100, borderRadius: "50%",
                background: isSpeaking ? "radial-gradient(circle, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.02) 70%)" : isListening ? "radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.02) 70%)" : "radial-gradient(circle, rgba(120,113,108,0.15) 0%, rgba(120,113,108,0.01) 70%)",
                display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
                animation: isSpeaking ? "speakOrbPulse 1.5s infinite" : isListening ? "listenOrbPulse 1.5s infinite" : "none"
              }}>
                <div style={{
                  width: 54, height: 54, borderRadius: "50%",
                  background: isSpeaking ? T.amber : isListening ? T.danger : th.borderUp,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: isSpeaking ? "0 0 20px rgba(245,158,11,0.4)" : isListening ? "0 0 20px rgba(239,68,68,0.4)" : "none",
                  transition: "all 0.3s ease"
                }}>
                  <Sparkles size={20} color={isSpeaking || isListening ? "#fff" : th.textMuted} />
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
                color: isSpeaking ? T.amber : isListening ? T.danger : th.textMuted
              }}>
                {isSpeaking ? "AI Interviewer Speaking" : isListening ? "Microphone Active" : "Simulator Ready"}
              </span>
            </div>

            {/* Question Text block */}
            <div style={{ textAlign: "center", maxWidth: 640 }}>
              {submittingAnswer && !currentQuestion ? (
                <div style={{ color: th.textMuted, fontSize: 15, fontStyle: "italic" }}>
                  Generating target interview questions...
                </div>
              ) : (
                <p style={{
                  fontSize: 16.5, fontWeight: 500, color: th.textPrimary, lineHeight: 1.6,
                  margin: 0, padding: "0 10px"
                }}>
                  {currentQuestion}
                </p>
              )}
            </div>
          </div>

          {/* User Response block */}
          <div style={{
            background: th.surface, border: `1px solid ${th.border}`, borderRadius: 20,
            padding: 24, display: "flex", flexDirection: "column", gap: 16
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: th.textMuted }}>Your Response</span>
              <span style={{ fontSize: 11.5, color: th.textMuted }}>You can type or speak your answer</span>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <textarea
                value={answerInput}
                onChange={e => setAnswerInput(e.target.value)}
                placeholder={isListening ? "Listening... Speak clearly into your mic." : "Type your response or click the microphone to dictate..."}
                rows={4}
                style={{
                  width: "100%", padding: 16, background: th.surfaceUp, border: `1.5px solid ${th.borderUp}`,
                  borderRadius: 12, color: th.textPrimary, fontSize: 14, outline: "none",
                  fontFamily: T.font, resize: "none", lineHeight: 1.6
                }}
                onFocus={e => e.target.style.borderColor = T.amber}
                onBlur={e => e.target.style.borderColor = th.borderUp}
              />

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                {/* Voice mic toggle */}
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  style={{
                    width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                    background: isListening ? T.dangerDim : T.amberDim, border: `1.5px solid ${isListening ? T.dangerBorder : T.amberBorder}`,
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {isListening ? <MicOff size={18} color={T.danger} /> : <Mic size={18} color={T.amber} />}
                </button>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!answerInput.trim() || submittingAnswer}
                  style={{
                    padding: "0 24px", height: 44, borderRadius: 10, background: answerInput.trim() && !submittingAnswer ? T.amber : th.surfaceUp,
                    border: "none", color: answerInput.trim() && !submittingAnswer ? T.amberText : th.textMuted,
                    fontWeight: 700, fontSize: 14, cursor: answerInput.trim() && !submittingAnswer ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", gap: 8, transition: "background 0.2s"
                  }}
                >
                  {submittingAnswer ? (
                    "Processing..."
                  ) : (
                    <>
                      {round === 3 ? "Submit & Finish" : "Next Question"} <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Keyframe Orb animations */}
          <style>{`
            @keyframes speakOrbPulse {
              0% { box-shadow: 0 0 20px rgba(245,158,11,0.1); transform: scale(1); }
              50% { box-shadow: 0 0 40px rgba(245,158,11,0.3); transform: scale(1.04); }
              100% { box-shadow: 0 0 20px rgba(245,158,11,0.1); transform: scale(1); }
            }
            @keyframes listenOrbPulse {
              0% { box-shadow: 0 0 20px rgba(239,68,68,0.1); transform: scale(1); }
              50% { box-shadow: 0 0 40px rgba(239,68,68,0.3); transform: scale(1.04); }
              100% { box-shadow: 0 0 20px rgba(239,68,68,0.1); transform: scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* STEP 3: INTERVIEW REPORT (ATS Score & Feedback) */}
      {step === "feedback" && evaluation && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Main Assessment card */}
          <div style={{
            background: th.surface, border: `1px solid ${th.border}`, borderRadius: 20,
            padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 32,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
          }}>
            
            {/* Target Header */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                padding: "4px 12px", background: T.amberDim, color: T.amber, fontSize: 11.5,
                fontWeight: "bold", borderRadius: 20, display: "inline-block", marginBottom: 8
              }}>
                ASSESSMENT COMPLETE
              </div>
              <h2 style={{ fontFamily: T.fontSerif, fontSize: 24, fontWeight: 700, color: th.textPrimary, margin: 0 }}>
                {targetCompany} Mock Interview Report
              </h2>
              <p style={{ fontSize: 14, color: th.textSecondary, marginTop: 4, margin: 0 }}>
                Targeting Role: {targetRole}
              </p>
            </div>

            {/* Circular Gauge Score */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 130, height: 130, borderRadius: "50%",
                border: `6px solid ${th.borderUp}`, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", position: "relative",
                boxShadow: "0 0 30px rgba(0,0,0,0.1)"
              }}>
                <div style={{
                  position: "absolute", inset: -6, borderRadius: "50%",
                  border: `6px solid ${evaluation.score >= 80 ? T.success : evaluation.score >= 60 ? T.amber : T.danger}`,
                  clipPath: `polygon(50% 50%, -50% -50%, 150% -50%, ${evaluation.score > 75 ? "150% 150%" : "150% -50%"}, ${evaluation.score > 50 ? "50% 150%" : "150% -50%"}, ${evaluation.score > 25 ? "-50% 150%" : "150% -50%"}, -50% -50%)`
                }} />
                <span style={{ fontSize: 36, fontWeight: 900, color: th.textPrimary }}>
                  {evaluation.score}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: th.textMuted, textTransform: "uppercase" }}>
                  ATS Match Score
                </span>
              </div>
            </div>

            {/* Dual Panel Feedback Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, width: "100%" }}>
              {/* Strengths */}
              <div style={{
                background: th.surfaceUp, border: `1px solid ${th.borderUp}`,
                borderRadius: 14, padding: 20
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <CheckCircle2 size={16} color={T.success} />
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: th.textPrimary }}>Primary Strengths</span>
                </div>
                <p style={{ fontSize: 13.5, color: th.textSecondary, margin: 0, lineHeight: 1.6 }}>
                  {evaluation.strengths}
                </p>
              </div>

              {/* Weaknesses */}
              <div style={{
                background: th.surfaceUp, border: `1px solid ${th.borderUp}`,
                borderRadius: 14, padding: 20
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <X size={16} color={T.danger} />
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: th.textPrimary }}>Areas to Improve</span>
                </div>
                <p style={{ fontSize: 13.5, color: th.textSecondary, margin: 0, lineHeight: 1.6 }}>
                  {evaluation.weaknesses}
                </p>
              </div>
            </div>

            {/* Strategic Coaching Feedback Card */}
            <div style={{
              background: th.surfaceUp, border: `1px solid ${th.borderUp}`,
              borderRadius: 14, padding: 20, width: "100%"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Award size={16} color={T.amber} />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: th.textPrimary }}>AI Interviewer's Feedback</span>
              </div>
              <p style={{ fontSize: 13.5, color: th.textSecondary, margin: 0, lineHeight: 1.6 }}>
                {evaluation.feedback}
              </p>
            </div>

            <button
              onClick={handleReset}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 12, background: T.amber, color: T.amberText,
                border: "none", fontWeight: 700, fontSize: 14.5, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}
            >
              <RefreshCw size={14} /> Restart Mock Sandbox
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
