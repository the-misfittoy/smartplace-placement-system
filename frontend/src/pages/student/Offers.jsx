/**
 * src/pages/student/Offers.jsx
 * High-fidelity glassmorphic offer management and 2FA acceptance module.
 */
import { useState, useRef, useEffect } from "react";
import { useStudentOffers } from "@/hooks/useQueries";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Gift, AlertTriangle, ShieldCheck, Clock, RefreshCw, Send, Check } from "lucide-react";
import { T, getTheme } from "@/tokens";
import * as api from "@/API/api";
import useNotificationStore from "@/store/notificationStore";

export default function StudentOffers({ dark = true }) {
  const th = getTheme(dark);
  const addNotification = useNotificationStore(state => state.addNotification);
  const { data: offers = [], isLoading, refetch } = useStudentOffers();
  
  // Modal states
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(0);
  const [lifespanTimer, setLifespanTimer] = useState(300);

  const otpRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Countdown timer for Resend OTP & Circular Lifespan
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    let interval;
    if (showModal && lifespanTimer > 0 && !success) {
      interval = setInterval(() => {
        setLifespanTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showModal, lifespanTimer, success]);

  // Reset modal when closed
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOffer(null);
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
    setDevOtp("");
    setErrorMsg("");
    setLoading(false);
    setSuccess(false);
    setLifespanTimer(300);
  };

  // Check if student has multiple active (accepted) offers
  const hasMultipleAccepted = offers.filter(
    (o) => o.status?.toLowerCase() === "accepted"
  ).length > 1;

  // Triggers OTP request
  const handleInitiateAccept = async (offer) => {
    setSelectedOffer(offer);
    setShowModal(true);
    setLoading(true);
    setErrorMsg("");
    setLifespanTimer(300);
    
    try {
      const response = await api.requestOfferOTP(offer.offer_id);
      setOtpSent(true);
      setTimer(60);
      if (response.dev_otp) {
        setDevOtp(response.dev_otp);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to dispatch verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (timer > 0 || loading) return;
    setLoading(true);
    setErrorMsg("");
    setOtp(["", "", "", "", "", ""]);
    setLifespanTimer(300);
    
    try {
      const response = await api.requestOfferOTP(selectedOffer.offer_id);
      setOtpSent(true);
      setTimer(60);
      if (response.dev_otp) {
        setDevOtp(response.dev_otp);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  // Input transitions for the 6 separately rendered numeric inputs
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Allow numbers only
    
    const newOtp = [...otp];
    // Keep only last digit
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next field
    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: clear and focus previous
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        otpRefs[index - 1].current.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  // Confirm Verification OTP
  const handleConfirmAcceptance = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setErrorMsg("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    
    try {
      await api.confirmOfferOTP(selectedOffer.offer_id, otpCode);
      setSuccess(true);
      
      // Push real-time notifications
      addNotification({
        title: "Placement Secured! 🎉",
        message: `Your final job acceptance at ${selectedOffer.company_name} (${selectedOffer.role}) has been successfully processed.`,
        type: "success",
        link: "/student/offers"
      });
      
      addNotification({
        title: "Offer Automatic Dismissal",
        message: "All other active placement offers have been automatically declined.",
        type: "info",
        link: "/student/offers"
      });

      setTimeout(() => {
        handleCloseModal();
        refetch();
      }, 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Incorrect verification code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div style={{ color: th.textPrimary, padding: 32, fontFamily: T.font }}>Loading offers repository...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: T.font, maxWidth: 1000, margin: "0 auto" }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: T.fontSerif, fontSize: "clamp(24px, 3vw, 32px)", color: th.textPrimary, margin: "0 0 8px" }}>
          My Career Offers ✦
        </h2>
        <p style={{ fontSize: 14, color: th.textSecondary, margin: 0 }}>
          Manage your accepted and pending corporate job offers. Secure your path with 2FA verification.
        </p>
      </div>

      {/* Dual Placement Alert Banner */}
      {hasMultipleAccepted && (
        <div style={{ 
          background: "rgba(239, 68, 68, 0.08)", 
          border: `1.5px solid rgba(239, 68, 68, 0.25)`, 
          borderRadius: 14, 
          padding: "16px 20px", 
          display: "flex", 
          gap: 14, 
          alignItems: "flex-start" 
        }}>
          <AlertTriangle size={22} color={T.danger} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <h4 style={{ margin: "0 0 4px", color: T.danger, fontWeight: 600, fontSize: 15 }}>Dual Placement Conflict Detected</h4>
            <p style={{ margin: 0, fontSize: 13.5, color: th.textSecondary, lineHeight: 1.5 }}>
              Under university guidelines, you are selected at multiple corporations but **can only finalize one job**. 
              Please select one of the offers below. Confirming an offer will **automatically decline and dismiss all others** associated with your profile.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {offers.map((offer) => {
          const isAccepted = offer.status?.toLowerCase() === "accepted";
          const isDeclined = offer.status?.toLowerCase() === "declined";
          
          const offerDate = new Date(offer.offer_date);
          const expiryDate = new Date(offerDate.getTime() + 10 * 24 * 60 * 60 * 1000);
          const now = new Date();
          const msLeft = expiryDate.getTime() - now.getTime();
          const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));
          
          return (
            <div 
              key={offer.offer_id} 
              style={{ 
                background: th.surface, 
                border: isAccepted ? `1.5px solid ${T.success}` : `1px solid ${th.border}`,
                borderRadius: 16, 
                padding: "20px 24px",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                position: "relative",
                overflow: "hidden",
                transition: "border-color 0.2s"
              }}
            >
              {/* Left Side: Offer Info */}
              <div style={{ display: "flex", gap: 16, alignItems: "center", minWidth: 260 }}>
                {/* Logo mock */}
                <div style={{ 
                  width: 52, 
                  height: 52, 
                  borderRadius: 12, 
                  background: isAccepted ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.1)", 
                  color: isAccepted ? T.success : T.amber, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: 22,
                  fontFamily: T.fontSerif,
                  fontWeight: "bold",
                  flexShrink: 0
                }}>
                  {offer.company_name?.[0] || "C"}
                </div>
                
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 600, color: th.textPrimary }}>
                    {offer.company_name}
                  </h3>
                  <p style={{ margin: 0, fontSize: 13.5, color: th.textSecondary }}>
                    Role: <strong>{offer.role}</strong>
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: th.textMuted }}>
                    Offer Date: {new Date(offer.offer_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Middle Side: Key Details */}
              <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
                <div>
                  <span style={{ display: "block", fontSize: 10, textTransform: "uppercase", color: th.textMuted, letterSpacing: "0.05em", marginBottom: 2 }}>Salary Package</span>
                  <span style={{ fontSize: 20, fontWeight: "bold", color: T.success }}>₹{offer.package} LPA</span>
                </div>
                
                <div>
                  <span style={{ display: "block", fontSize: 10, textTransform: "uppercase", color: th.textMuted, letterSpacing: "0.05em", marginBottom: 2 }}>Current Status</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <StatusBadge status={offer.status} />
                    {isAccepted ? (
                      <span style={{ fontSize: 10, color: T.success, fontWeight: 500, display: "flex", alignItems: "center", gap: 3 }}>
                        ✓ Locked Choice
                      </span>
                    ) : isDeclined ? (
                      <span style={{ fontSize: 10, color: th.textMuted, fontStyle: "italic" }}>
                        Dismissed
                      </span>
                    ) : daysLeft > 0 ? (
                      <span style={{ 
                        fontSize: 10, 
                        fontWeight: 600, 
                        color: daysLeft <= 3 ? T.danger : T.amber, 
                        background: daysLeft <= 3 ? "rgba(239, 68, 68, 0.08)" : "rgba(245,158,11,0.08)",
                        border: `1px solid ${daysLeft <= 3 ? "rgba(239, 68, 68, 0.2)" : "rgba(245,158,11,0.2)"}`,
                        padding: "2px 6px",
                        borderRadius: 8,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}>
                        <Clock size={10} />
                        <span>{daysLeft} days left</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, color: T.danger, fontWeight: 500 }}>
                        Expired
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Action Button */}
              <div>
                {isAccepted && !hasMultipleAccepted ? (
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 6, 
                    color: T.success, 
                    fontWeight: 600, 
                    fontSize: 14,
                    padding: "8px 16px",
                    background: "rgba(16,185,129,0.08)",
                    border: `1px solid rgba(16,185,129,0.2)`,
                    borderRadius: 8
                  }}>
                    <ShieldCheck size={16} />
                    <span>Finalized Job</span>
                  </div>
                ) : isDeclined ? (
                  <span style={{ fontSize: 14, color: th.textMuted, fontStyle: "italic" }}>Offer Dismissed</span>
                ) : (
                  <button 
                    onClick={() => handleInitiateAccept(offer)}
                    style={{
                      background: T.amber,
                      color: "#1C1917",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: 8,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: 13.5,
                      transition: "transform 0.1s, opacity 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                    onMouseLeave={e => e.currentTarget.style.opacity = 1}
                  >
                    {isAccepted ? "Confirm as Final Job" : "Accept Offer & Dismiss Others"}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {offers.length === 0 && (
          <div style={{ 
            background: th.surface, 
            border: `1px dashed ${th.border}`, 
            borderRadius: 16, 
            padding: "48px 24px", 
            textAlign: "center", 
            color: th.textMuted 
          }}>
            <Gift size={36} style={{ marginBottom: 12, opacity: 0.6 }} />
            <p style={{ margin: 0, fontSize: 15 }}>You do not have any job offers registered in your profile currently.</p>
          </div>
        )}
      </div>

      {/* Modern 2FA Modal */}
      {showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(12,10,9,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          padding: 16,
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: th.surface,
            border: `1.5px solid ${th.borderUp}`,
            borderRadius: 20,
            width: "100%",
            maxWidth: 460,
            padding: 32,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            position: "relative",
            animation: "modalFadeIn 0.2s ease-out"
          }}>
            
            {/* Modal animation styling */}
            <style>{`
              @keyframes modalFadeIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>

            {/* Error Message banner */}
            {errorMsg && (
              <div style={{ background: "rgba(239, 68, 68, 0.08)", borderLeft: `4px solid ${T.danger}`, padding: "10px 14px", borderRadius: 6, fontSize: 13, color: T.danger, marginBottom: 20 }}>
                {errorMsg}
              </div>
            )}

            {!success ? (
              <>
                {/* Circular SVG Timer */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <div style={{ position: "relative", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={64} height={64} style={{ transform: "rotate(-90deg)" }}>
                      <circle cx={32} cy={32} r={24} fill="none" stroke={th.border} strokeWidth={3} />
                      <circle 
                        cx={32} 
                        cy={32} 
                        r={24} 
                        fill="none" 
                        stroke={lifespanTimer > 60 ? T.amber : T.danger} 
                        strokeWidth={3} 
                        strokeDasharray={2 * Math.PI * 24} 
                        strokeDashoffset={(2 * Math.PI * 24) - (lifespanTimer / 300) * (2 * Math.PI * 24)} 
                        strokeLinecap="round" 
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                    </svg>
                    <div style={{ position: "absolute", fontSize: 11, fontWeight: "bold", color: lifespanTimer > 60 ? th.textPrimary : T.danger }}>
                      {`${String(Math.floor(lifespanTimer / 60)).padStart(2, "0")}:${String(lifespanTimer % 60).padStart(2, "0")}`}
                    </div>
                  </div>
                </div>

                <h3 style={{ fontFamily: T.fontSerif, fontSize: 22, color: th.textPrimary, margin: "0 0 8px", textAlign: "center" }}>
                  2-Factor Authentication
                </h3>
                <p style={{ margin: "0 0 24px", fontSize: 13.5, color: th.textSecondary, textAlign: "center", lineHeight: 1.5 }}>
                  A secure 6-digit transaction authorization code has been dispatched. Enter it below to make final acceptance of the offer from <strong>{selectedOffer?.company_name}</strong>.
                </p>

                {lifespanTimer === 0 && (
                  <div style={{ background: "rgba(239, 68, 68, 0.08)", borderLeft: `4px solid ${T.danger}`, padding: "10px 14px", borderRadius: 6, fontSize: 13, color: T.danger, marginBottom: 20, textAlign: "center" }}>
                    Verification code expired. Please click "Resend Verification Code" below to generate a new 2FA code.
                  </div>
                )}

                {/* OTP Input Fields */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 24 }}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={otpRefs[i]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      style={{
                        width: 48,
                        height: 52,
                        borderRadius: 10,
                        background: th.surfaceUp,
                        border: digit ? `2px solid ${T.amber}` : `1px solid ${th.border}`,
                        color: th.textPrimary,
                        fontSize: 22,
                        fontWeight: "bold",
                        textAlign: "center",
                        fontFamily: T.font,
                        outline: "none",
                        transition: "border-color 0.15s"
                      }}
                      disabled={loading}
                    />
                  ))}
                </div>

                {/* Resend & Timer */}
                <div style={{ display: "flex", justifyContent: "center", gap: 4, fontSize: 13, color: th.textSecondary, marginBottom: 28 }}>
                  {timer > 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: th.textMuted }}>
                      <Clock size={13} />
                      <span>Resend code in {timer}s</span>
                    </div>
                  ) : (
                    <button 
                      onClick={handleResendOtp}
                      disabled={loading}
                      style={{ background: "none", border: "none", color: T.amber, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
                    >
                      <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                      <span>Resend Verification Code</span>
                    </button>
                  )}
                </div>

                {/* Dev Sandbox Helper Banner */}
                {devOtp && (
                  <div style={{ 
                    marginTop: -12, 
                    marginBottom: 24, 
                    padding: "10px 14px", 
                    background: "rgba(245,158,11,0.1)", 
                    border: "1px dashed rgba(245,158,11,0.3)", 
                    borderRadius: 8, 
                    fontSize: 13, 
                    color: T.amber, 
                    textAlign: "center" 
                  }}>
                    ⚙️ <strong>[Dev Sandbox]</strong> Intercepted Verification Code: <strong style={{ letterSpacing: 2, fontSize: 15 }}>{devOtp}</strong>
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={handleCloseModal}
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: "none",
                      border: `1px solid ${th.border}`,
                      color: th.textSecondary,
                      padding: "12px",
                      borderRadius: 10,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: 14
                    }}
                  >
                    Cancel
                  </button>
                         <button
                    onClick={handleConfirmAcceptance}
                    disabled={loading || lifespanTimer === 0}
                    style={{
                      flex: 1,
                      background: lifespanTimer === 0 ? th.surfaceUp : T.success,
                      color: lifespanTimer === 0 ? th.textMuted : "#FFFFFF",
                      border: "none",
                      padding: "12px",
                      borderRadius: 10,
                      fontWeight: 600,
                      cursor: lifespanTimer === 0 ? "not-allowed" : "pointer",
                      fontSize: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8
                    }}
                  >
                    {loading ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Confirm Acceptance</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Verification Success State */
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                padding: "24px 0 12px",
                animation: "successScale 0.3s ease-out" 
              }}>
                <style>{`
                  @keyframes successScale { from { transform: scale(0.9); } to { transform: scale(1); } }
                  .animate-spin { animation: spin 1s linear infinite; }
                  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
                
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(16,185,129,0.15)",
                  color: T.success,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20
                }}>
                  <Check size={36} strokeWidth={3} />
                </div>
                
                <h3 style={{ fontFamily: T.fontSerif, fontSize: 22, color: th.textPrimary, margin: "0 0 8px", textAlign: "center" }}>
                  Selection Successful!
                </h3>
                <p style={{ margin: 0, fontSize: 13.5, color: th.textSecondary, textAlign: "center", lineHeight: 1.5 }}>
                  Congratulations! Your offer from <strong>{selectedOffer?.company_name}</strong> has been secured. 
                  All other corporate offers have been successfully dismissed.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
