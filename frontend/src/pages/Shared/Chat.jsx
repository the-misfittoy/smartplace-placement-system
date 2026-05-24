/**
 * src/pages/shared/Chat.jsx
 * AI Assistant — text + voice input, voice output with stop button
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Send, Mic, MicOff, StopCircle, Volume2, VolumeX, RefreshCw } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { useSendChatMessage } from "@/hooks/useQueries";
import { T, getTheme } from "@/tokens"; // 1. Imported centralized tokens!

// ── Prompt chips per role ──────────────────────────────────────────────────────
const CHIPS = {
  student: [
    "Which companies am I eligible for?",
    "Show my application status",
    "What's my placement strategy?",
    "How can I improve my chances?",
  ],
  tpo: [
    "How many students are placed?",
    "Show unplaced students",
    "List active placement drives",
    "Which companies are visiting next?",
  ],
  company: [ // Matched to the exact role string in authStore
    "Show students eligible for our drive",
    "List shortlisted candidates",
    "When is our next drive scheduled?",
    "Compare student profiles",
  ],
};

// ── Waveform animation ────────────────────────────────────────────────────────
function Waveform({ active, color }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center", height: 20 }}>
      {[0.4, 0.8, 1, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
        <div
          key={i}
          style={{
            width: 3, borderRadius: 2,
            background: color || T.amber,
            height: active ? `${h * 20}px` : "4px",
            transition: active
              ? `height ${0.3 + i * 0.05}s ease-in-out`
              : "height 0.2s ease",
            animation: active ? `wave ${0.6 + i * 0.1}s ease-in-out infinite alternate` : "none",
          }}
        />
      ))}
      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1);   }
        }
      `}</style>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ msg, th, onSpeak, speaking, speakingId }) {
  const isAI = msg.role === "ai";
  const isThisSpeaking = speaking && speakingId === msg.id;
  return (
    <div style={{
      display: "flex",
      flexDirection: isAI ? "row" : "row-reverse",
      gap: 9, alignItems: "flex-end",
      maxWidth: "100%",
    }}>
      {/* AI avatar */}
      {isAI && (
        <div style={{
          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
          background: T.amberDim, border: `1px solid ${T.amberBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Sparkles size={13} color={T.amber} />
        </div>
      )}

      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 4,
        alignItems: isAI ? "flex-start" : "flex-end" }}>
        <div style={{
          padding: "10px 14px",
          // Mapped directly to centralized theme tokens
          background: isAI ? th.surfaceUp : T.amber,
          border: `1px solid ${isAI ? th.borderUp : T.amber}`,
          borderRadius: isAI ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
          fontSize: 13.5, lineHeight: 1.65,
          color: isAI ? th.textPrimary : T.amberText,
        }}>
          {msg.content}
        </div>

        {/* Speak button for AI messages */}
        {isAI && (
          <button
            onClick={() => onSpeak(msg)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: isThisSpeaking ? T.amber : th.textMuted,
              padding: "2px 4px",
              display: "flex", alignItems: "center", gap: 4,
              fontSize: 11, fontFamily: T.font,
              transition: "color 0.15s",
            }}
          >
            {isThisSpeaking ? <Volume2 size={11} /> : <VolumeX size={11} />}
            {isThisSpeaking ? "Speaking…" : "Read aloud"}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots({ th }) {
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-end" }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        background: T.amberDim, border: `1px solid ${T.amberBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Sparkles size={13} color={T.amber} />
      </div>
      <div style={{
        padding: "12px 16px",
        background: th.surfaceUp, border: `1px solid ${th.borderUp}`,
        borderRadius: "4px 12px 12px 12px",
        display: "flex", gap: 5, alignItems: "center",
      }}>
        {[0, 0.2, 0.4].map((d, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%",
            background: th.textMuted,
            animation: `typingBounce 1s ${d}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Main Chat component ───────────────────────────────────────────────────────
export default function Chat({ dark = true }) {
  const th = getTheme(dark);
  const { user } = useAuthStore();
  
  // 2. Dynamically grab the exact role from Zustand to ensure correct chips
  const role = user?.role || "student";
  const chips = CHIPS[role] || CHIPS.student;

  const [messages, setMessages]     = useState([
    {
      id: 1, role: "ai",
      content: `Hi! I'm your SmartPlace AI. Ask me anything about placements — eligible companies, application status, drive schedules, or strategy. You can type or use the mic.`,
    },
  ]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [voiceState, setVoiceState] = useState("idle"); 
  const [speakingId, setSpeakingId] = useState(null);
  const [showChips, setShowChips]   = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [liveResponse, setLiveResponse] = useState("");

  const { mutate: sendChatMutation, isPending } = useSendChatMessage();

  const messagesEndRef  = useRef(null);
  const recognitionRef  = useRef(null);
  const textareaRef     = useRef(null);
  const msgIdCounter    = useRef(2);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Hardware / Memory Cleanup ───────────────────────────────────────────────
  useEffect(() => {
    // This return function runs instantly when the component unmounts (user leaves the page)
    return () => {
      // 1. Stop AI speaking immediately
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      // 2. Shut off the microphone immediately
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // ── Pre-load Web Speech Synthesis Voices ────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Trigger voice list population
      window.speechSynthesis.getVoices();
      
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Handle toggling continuous Voice Mode
  useEffect(() => {
    if (isVoiceMode) {
      setTimeout(() => {
        startVoiceModeListening();
      }, 500);
    } else {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setVoiceState("idle");
      setLiveTranscript("");
      setLiveResponse("");
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isVoiceMode]);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback((text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading || isPending) return;

    const userMsg = { id: msgIdCounter.current++, role: "user", content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setShowChips(false);

    // 3. Removed student_id from payload; FastAPI handles it via JWT
    sendChatMutation(
      { query: trimmed },
      {
        onSuccess: (data) => {
          const reply = data.response;
          const aiMsg = { id: msgIdCounter.current++, role: "ai", content: reply };
          setMessages(prev => [...prev, aiMsg]);
          setLoading(false);
        },
        onError: () => {
          setMessages(prev => [...prev, {
            id: msgIdCounter.current++, role: "ai",
            content: "Sorry, I'm having trouble connecting to the backend. Please try again.",
          }]);
          setLoading(false);
        },
      }
    );
  }, [input, loading, isPending, sendChatMutation]);

  // ── Text-to-speech ──────────────────────────────────────────────────────────
  const speakMessage = (msg) => {
    if ("speechSynthesis" in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();
      if (voiceState === "speaking" && speakingId === msg.id) {
        setVoiceState("idle");
        setSpeakingId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(msg.content);
      utterance.rate  = 0.96;
      utterance.pitch = 1.05;
      
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const premiumVoice = 
          voices.find(v => (v.lang === "en-IN" || v.lang === "en_IN") && v.name.includes("Google")) ||
          voices.find(v => (v.lang === "en-IN" || v.lang === "en_IN") && v.name.includes("Natural")) ||
          voices.find(v => (v.lang === "en-IN" || v.lang === "en_IN") && v.name.includes("Online")) ||
          voices.find(v => (v.lang === "en-IN" || v.lang === "en_IN")) ||
          voices.find(v => (v.lang === "en-US" || v.lang === "en_US") && v.name.includes("Google")) ||
          voices.find(v => v.lang.startsWith("en"));
          
        if (premiumVoice) {
          utterance.voice = premiumVoice;
        }
      }
      utterance.onend = () => { setVoiceState("idle"); setSpeakingId(null); };
      
      setVoiceState("speaking");
      setSpeakingId(msg.id);
      
      setTimeout(() => {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.speak(utterance);
      }, 100);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setVoiceState("idle");
    setSpeakingId(null);
  };

  // ── ChatGPT/Gemini Live Voice Mode Implementation ───────────────────────────
  const startVoiceModeListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";
    
    recognition.onstart = () => {
      setVoiceState("listening");
      setLiveTranscript("Listening...");
    };
    
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setLiveTranscript(transcript);
      
      if (e.results[e.results.length - 1].isFinal) {
        setLiveTranscript(transcript);
        sendVoiceModeMessage(transcript);
      }
    };
    
    recognition.onerror = (event) => {
      console.warn("Live Voice STT Error:", event.error);
      if (event.error === "no-speech") {
        setTimeout(() => {
          if (isVoiceMode) {
            try { recognition.start(); } catch(e) {}
          }
        }, 1000);
      } else {
        setVoiceState("idle");
      }
    };
    
    recognition.onend = () => {
      setVoiceState((s) => {
        if (s === "listening") {
          setTimeout(() => {
            if (isVoiceMode) {
              try { recognition.start(); } catch(e) {}
            }
          }, 400);
        }
        return s;
      });
    };
    
    try {
      recognition.start();
    } catch(e) {
      console.warn("Live Voice mic restart bypassed", e);
    }
    recognitionRef.current = recognition;
  }, [isVoiceMode, voiceState]);

  const sendVoiceModeMessage = (text) => {
    if (!text.trim() || text === "Listening...") return;
    
    const userMsg = { id: msgIdCounter.current++, role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setVoiceState("loading");
    setLiveResponse("Processing your request...");
    
    sendChatMutation(
      { query: text },
      {
        onSuccess: (data) => {
          const reply = data.response;
          const aiMsg = { id: msgIdCounter.current++, role: "ai", content: reply };
          setMessages(prev => [...prev, aiMsg]);
          speakVoiceModeResponse(reply);
        },
        onError: () => {
          const errorText = "Sorry, I encountered an error. Please try again.";
          setMessages(prev => [...prev, { id: msgIdCounter.current++, role: "ai", content: errorText }]);
          speakVoiceModeResponse(errorText);
        }
      }
    );
  };

  const speakVoiceModeResponse = (text) => {
    if (!("speechSynthesis" in window)) return;
    
    // Safety check: ensure queue is not stuck/paused in Chrome
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    
    window.speechSynthesis.cancel();
    setVoiceState("speaking");
    setLiveResponse(text);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.pitch = 1.05;
    
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const premiumVoice = 
        voices.find(v => (v.lang === "en-IN" || v.lang === "en_IN") && v.name.includes("Google")) ||
        voices.find(v => (v.lang === "en-IN" || v.lang === "en_IN") && v.name.includes("Natural")) ||
        voices.find(v => (v.lang === "en-IN" || v.lang === "en_IN") && v.name.includes("Online")) ||
        voices.find(v => (v.lang === "en-IN" || v.lang === "en_IN")) ||
        voices.find(v => (v.lang === "en-US" || v.lang === "en_US") && v.name.includes("Google")) ||
        voices.find(v => v.lang.startsWith("en"));
        
      if (premiumVoice) {
        utterance.voice = premiumVoice;
      }
    }
    
    utterance.onend = () => {
      setLiveTranscript("Listening...");
      setLiveResponse("");
      setVoiceState("listening");
      setTimeout(() => {
        if (isVoiceMode) {
          startVoiceModeListening();
        }
      }, 500);
    };
    
    utterance.onerror = (e) => {
      console.warn("Live Voice TTS Error:", e);
      // Fallback: If synthesis is blocked/fails, automatically return to listening loop
      setLiveTranscript("Listening...");
      setLiveResponse("");
      setVoiceState("listening");
      setTimeout(() => {
        if (isVoiceMode) {
          startVoiceModeListening();
        }
      }, 500);
    };
    
    // 100ms delay solves Chrome's cancel-to-speak race condition freeze!
    setTimeout(() => {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  // ── Voice recognition ────────────────────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Voice input not supported in this browser. Try Chrome."); return; }
    if (voiceState === "speaking") stopSpeaking();

    const recognition = new SpeechRecognition();
    recognition.continuous      = false;
    recognition.interimResults  = true;
    recognition.lang            = "en-IN";

    recognition.onstart = () => setVoiceState("listening");

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
      setInput(transcript);
      if (e.results[e.results.length - 1].isFinal) {
        sendMessage(transcript);
        setVoiceState("idle");
      }
    };

    recognition.onerror = () => setVoiceState("idle");
    recognition.onend   = () => {
      setVoiceState(s => s === "listening" ? "idle" : s);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setVoiceState("idle");
  };

  const handleMicClick = () => {
    if (voiceState === "listening") stopListening();
    else startListening();
  };

  // ── Keyboard send ────────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Auto-resize textarea ─────────────────────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "calc(100vh - 120px)", minHeight: 500,
      background: th.surface, border: `1px solid ${th.border}`,
      borderRadius: 14, overflow: "hidden", fontFamily: T.font,
      position: "relative"
    }}>

      {/* Header */}
      <div style={{
        padding: "16px 20px", borderBottom: `1px solid ${th.border}`,
        display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: T.amberDim, border: `1px solid ${T.amberBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Sparkles size={15} color={T.amber} />
        </div>
        <div>
          <div style={{ fontFamily: T.fontSerif, fontSize: 17, color: th.textPrimary, lineHeight: 1 }}>
            AI Assistant
          </div>
          <div style={{ fontSize: 11, color: th.textMuted, marginTop: 2 }}>Powered by Gemini · Text + Voice</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {/* Voice state indicator */}
          {voiceState === "listening" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6,
              padding: "4px 10px", borderRadius: 20,
              background: T.dangerDim, border: `1px solid ${T.dangerBorder}` }}>
              <Waveform active color={T.danger} />
              <span style={{ fontSize: 11.5, color: T.danger, fontWeight: 500 }}>Listening…</span>
            </div>
          )}
          {voiceState === "speaking" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6,
              padding: "4px 10px", borderRadius: 20,
              background: T.amberDim, border: `1px solid ${T.amberBorder}` }}>
              <Waveform active color={T.amber} />
              <span style={{ fontSize: 11.5, color: T.amber, fontWeight: 500 }}>Speaking…</span>
            </div>
          )}
          {/* ChatGPT/Gemini-like Live Voice Mode Toggle */}
          <button
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            style={{
              background: isVoiceMode ? "rgba(245,158,11,0.15)" : th.surfaceUp,
              border: `1.5px solid ${isVoiceMode ? T.amberBorder : th.border}`,
              borderRadius: 20,
              padding: "4px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: isVoiceMode ? T.amber : th.textSecondary,
              fontFamily: T.font,
              transition: "all 0.2s"
            }}
          >
            <Mic size={12} color={isVoiceMode ? T.amber : th.textMuted} />
            <span>Voice Mode</span>
          </button>

          <button
            onClick={() => setMessages([{ id: 1, role: "ai", content: "Conversation cleared. How can I help you?" }])}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: th.textMuted, padding: 4, display: "flex",
            }}
            title="Clear chat"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map(msg => (
          <Bubble
            key={msg.id} msg={msg} th={th}
            onSpeak={speakMessage}
            speaking={voiceState === "speaking"}
            speakingId={speakingId}
          />
        ))}
        {loading && <TypingDots th={th} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom area */}
      <div style={{ padding: "12px 20px 16px", borderTop: `1px solid ${th.border}`, flexShrink: 0 }}>

        {/* Stop speaking — appears only when AI is reading aloud */}
        {voiceState === "speaking" && (
          <button
            onClick={stopSpeaking}
            style={{
              width: "100%", marginBottom: 10,
              padding: "9px 0", borderRadius: 9,
              background: T.dangerDim, border: `1px solid ${T.dangerBorder}`,
              color: T.danger, fontSize: 13, fontWeight: 600,
              fontFamily: T.font, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              transition: "opacity 0.15s",
            }}
          >
            <StopCircle size={15} /> Stop speaking
          </button>
        )}

        {/* Suggestion chips */}
        {showChips && (
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>
            {chips.map(chip => (
              <button
                key={chip}
                onClick={() => { setInput(chip); textareaRef.current?.focus(); }}
                style={{
                  padding: "5px 11px", borderRadius: 20,
                  background: th.surfaceUp, border: `1px solid ${th.borderUp}`,
                  color: th.textSecondary, fontSize: 12,
                  cursor: "pointer", fontFamily: T.font,
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={e => e.target.style.borderColor = T.amberBorder}
                onMouseLeave={e => e.target.style.borderColor = th.borderUp}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={voiceState === "listening" ? "Listening… speak now" : "Ask anything about placements…"}
            rows={1}
            style={{
              flex: 1, resize: "none", overflowY: "auto",
              padding: "10px 14px",
              background: th.surfaceUp, border: `1.5px solid ${th.borderUp}`,
              borderRadius: 10, fontSize: 13.5, lineHeight: 1.5,
              color: th.textPrimary, fontFamily: T.font,
              outline: "none", transition: "border-color 0.18s",
              minHeight: 42, maxHeight: 120,
            }}
            onFocus={e => e.target.style.borderColor = T.amber}
            onBlur={e => e.target.style.borderColor = th.borderUp}
          />

          {/* Mic button */}
          <button
            onClick={handleMicClick}
            title={voiceState === "listening" ? "Stop recording" : "Start voice input"}
            style={{
              width: 42, height: 42, borderRadius: 10, flexShrink: 0,
              background: voiceState === "listening" ? T.dangerDim : T.amberDim,
              border: `1.5px solid ${voiceState === "listening" ? T.dangerBorder : T.amberBorder}`,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}
          >
            {voiceState === "listening"
              ? <MicOff size={17} color={T.danger} />
              : <Mic    size={17} color={T.amber}  />
            }
          </button>

          {/* Send button */}
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: 42, height: 42, borderRadius: 10, flexShrink: 0,
              background: input.trim() && !loading ? T.amber : th.surfaceUp,
              border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
            }}
          >
            <Send size={16} color={input.trim() && !loading ? T.amberText : th.textMuted} />
          </button>
        </div>

        <div style={{ fontSize: 11, color: th.textMuted, marginTop: 8, textAlign: "center" }}>
          Press <kbd style={{ fontSize: 10, padding: "1px 4px", borderRadius: 3, border: `1px solid ${th.border}`, color: th.textMuted }}>Enter</kbd> to send · <kbd style={{ fontSize: 10, padding: "1px 4px", borderRadius: 3, border: `1px solid ${th.border}`, color: th.textMuted }}>Shift+Enter</kbd> for new line
        </div>
      </div>

      {/* Immersive ChatGPT/Gemini Live Voice Mode Overlay */}
      {isVoiceMode && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: th.page, // Dark overlay
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "48px 24px",
          backdropFilter: "blur(20px)",
          animation: "fadeIn 0.25s ease-out"
        }}>
          {/* Custom Voice Orb Keyframe styles */}
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes orbListeningPulse {
              0% { transform: scale(1); box-shadow: 0 0 40px rgba(239, 68, 68, 0.2), inset 0 0 20px rgba(239, 68, 68, 0.1); }
              50% { transform: scale(1.06); box-shadow: 0 0 80px rgba(239, 68, 68, 0.5), inset 0 0 30px rgba(239, 68, 68, 0.3); }
              100% { transform: scale(1); box-shadow: 0 0 40px rgba(239, 68, 68, 0.2), inset 0 0 20px rgba(239, 68, 68, 0.1); }
            }
            @keyframes orbSpeakingPulse {
              0% { transform: scale(1); box-shadow: 0 0 40px rgba(245, 158, 11, 0.2), inset 0 0 20px rgba(245, 158, 11, 0.1); }
              50% { transform: scale(1.08); box-shadow: 0 0 85px rgba(245, 158, 11, 0.5), inset 0 0 35px rgba(245, 158, 11, 0.35); }
              100% { transform: scale(1); box-shadow: 0 0 40px rgba(245, 158, 11, 0.2), inset 0 0 20px rgba(245, 158, 11, 0.1); }
            }
            @keyframes orbLoadingPulse {
              0% { transform: scale(1); box-shadow: 0 0 30px rgba(79, 70, 229, 0.2); }
              50% { transform: scale(1.04); box-shadow: 0 0 70px rgba(79, 70, 229, 0.4); }
              100% { transform: scale(1); box-shadow: 0 0 30px rgba(79, 70, 229, 0.2); }
            }
          `}</style>

          {/* Top segment: Title and status */}
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              <Sparkles size={18} color={T.amber} />
              <span style={{ fontFamily: T.fontSerif, fontSize: 20, color: th.textPrimary, letterSpacing: "-0.01em" }}>SmartPlace Live Voice</span>
            </div>
            <div style={{ 
              fontSize: 12, 
              textTransform: "uppercase", 
              fontWeight: 700, 
              letterSpacing: "0.1em",
              color: voiceState === "listening" ? T.danger : voiceState === "speaking" ? T.amber : "#818CF8" 
            }}>
              ✦ {voiceState === "listening" ? "Listening..." : voiceState === "speaking" ? "Speaking..." : voiceState === "loading" ? "Processing..." : "Ready"}
            </div>
          </div>

          {/* Middle segment: Glowing Orb */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40, width: "100%", maxWidth: 360 }}>
            {/* The Visual Orb */}
            <div 
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: voiceState === "listening" 
                  ? "radial-gradient(circle, rgba(239,68,68,0.25) 0%, rgba(239,68,68,0.03) 70%)"
                  : voiceState === "speaking"
                  ? "radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(245,158,11,0.03) 70%)"
                  : "radial-gradient(circle, rgba(79,70,229,0.25) 0%, rgba(79,70,229,0.03) 70%)",
                border: `2px solid ${
                  voiceState === "listening" 
                    ? T.dangerBorder 
                    : voiceState === "speaking" 
                    ? T.amberBorder 
                    : "rgba(79, 70, 229, 0.4)"
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: voiceState === "listening" 
                  ? "orbListeningPulse 2s infinite ease-in-out" 
                  : voiceState === "speaking" 
                  ? "orbSpeakingPulse 1.6s infinite ease-in-out" 
                  : "orbLoadingPulse 1.8s infinite ease-in-out",
                transition: "all 0.4s ease"
              }}
            >
              {voiceState === "listening" ? (
                <Mic size={40} color={T.danger} style={{ opacity: 0.85 }} />
              ) : voiceState === "speaking" ? (
                <Volume2 size={40} color={T.amber} style={{ opacity: 0.85 }} />
              ) : (
                <RefreshCw size={40} color="#818CF8" className="animate-spin" style={{ opacity: 0.85 }} />
              )}
            </div>

            {/* Real-time transcribed text boxes */}
            <div style={{ width: "100%", textAlign: "center", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Question transcription */}
              {liveTranscript && (
                <div style={{ animation: "fadeIn 0.2s" }}>
                  <span style={{ fontSize: 10, textTransform: "uppercase", color: th.textMuted, fontWeight: 700, letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>You said</span>
                  <p style={{ margin: 0, fontSize: 15, color: th.textSecondary, fontStyle: "italic", lineHeight: 1.4 }}>
                    "{liveTranscript}"
                  </p>
                </div>
              )}

              {/* Answer transcription */}
              {liveResponse && voiceState === "speaking" && (
                <div style={{ animation: "fadeIn 0.3s", maxHeight: 110, overflowY: "auto", padding: "4px 8px" }}>
                  <span style={{ fontSize: 10, textTransform: "uppercase", color: T.amber, fontWeight: 700, letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>SmartPlace Coach</span>
                  <p style={{ margin: 0, fontSize: 14.5, color: th.textPrimary, lineHeight: 1.5, fontWeight: 500 }}>
                    {liveResponse}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom segment: Exit button */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            {voiceState === "speaking" && (
              <button
                onClick={() => {
                  window.speechSynthesis.cancel();
                  setLiveTranscript("Listening...");
                  setLiveResponse("");
                  setVoiceState("listening");
                  setTimeout(() => {
                    if (isVoiceMode) startVoiceModeListening();
                  }, 400);
                }}
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: `1.5px solid rgba(239, 68, 68, 0.2)`,
                  borderRadius: 10,
                  padding: "8px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.danger,
                  cursor: "pointer",
                  fontFamily: T.font,
                  transition: "background 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"}
              >
                Interrupt AI Voice
              </button>
            )}

            <button
              onClick={() => setIsVoiceMode(false)}
              style={{
                background: th.surfaceUp,
                border: `1.5px solid ${th.borderUp}`,
                borderRadius: 12,
                padding: "12px 28px",
                fontSize: 13.5,
                fontWeight: 600,
                color: th.textPrimary,
                cursor: "pointer",
                fontFamily: T.font,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transition: "transform 0.15s, background 0.2s"
              }}
              onMouseEnter={e => e.currentTarget.style.background = th.surface}
              onMouseLeave={e => e.currentTarget.style.background = th.surfaceUp}
            >
              Switch to Text Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
}