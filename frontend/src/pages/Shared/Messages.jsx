import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, User, Search, RefreshCw, Circle } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { useDmContacts, useDmHistory, useSendDmMessage } from "@/hooks/useQueries";
import { T, getTheme } from "@/tokens";
import { useOutletContext } from "react-router-dom";

export default function Messages() {
  const { dark } = useOutletContext() || { dark: true };
  const th = getTheme(dark);
  const { user } = useAuthStore();
  
  const [activeContact, setActiveContact] = useState(null);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: contactsData, isLoading: loadingContacts, isError: errorContacts, refetch: refetchContacts } = useDmContacts();
  const contacts = contactsData?.contacts || [];

  const { data: historyData, isLoading: loadingHistory } = useDmHistory(activeContact?.id);
  const messages = historyData?.messages || [];

  const { mutate: sendMessage, isPending: sending } = useSendDmMessage();

  const messagesEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    const txt = input.trim();
    if (!txt || sending || !activeContact) return;

    sendMessage({ receiver_id: activeContact.id, content: txt }, {
      onSuccess: () => {
        setInput("");
      }
    });
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      display: "flex", 
      height: "calc(100vh - 120px)", minHeight: 500,
      background: th.surface, border: `1px solid ${th.border}`,
      borderRadius: 14, overflow: "hidden", fontFamily: T.font
    }}>
      
      {/* LEFT PANE - CONTACTS */}
      <div style={{
        width: 320, borderRight: `1px solid ${th.border}`,
        display: "flex", flexDirection: "column",
        background: th.surfaceDown
      }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${th.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 18, color: th.textPrimary, display: "flex", alignItems: "center", gap: 8 }}>
              <MessageSquare size={18} color={T.amber} /> Messages
            </div>
            <button onClick={() => refetchContacts()} style={{ background: "none", border: "none", color: th.textMuted, cursor: "pointer" }}>
              <RefreshCw size={15} />
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={14} color={th.textMuted} style={{ position: "absolute", left: 12, top: 10 }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              style={{
                width: "100%", padding: "8px 12px 8px 34px",
                background: th.surfaceUp, border: `1px solid ${th.borderUp}`,
                borderRadius: 8, color: th.textPrimary, fontSize: 13,
                outline: "none", fontFamily: T.font
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
          {loadingContacts ? (
            <div style={{ padding: 20, textAlign: "center", color: th.textMuted, fontSize: 13 }}>Loading contacts...</div>
          ) : errorContacts ? (
            <div style={{ padding: 20, textAlign: "center", color: T.danger, fontSize: 13 }}>Failed to load contacts.</div>
          ) : filteredContacts.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: th.textMuted, fontSize: 13 }}>No contacts found.</div>
          ) : (
            filteredContacts.map(contact => {
              const isActive = activeContact?.id === contact.id;
              return (
                <div
                  key={contact.id}
                  onClick={() => setActiveContact(contact)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 10,
                    background: isActive ? th.surfaceUp : "transparent",
                    border: `1px solid ${isActive ? th.borderUp : "transparent"}`,
                    cursor: "pointer", marginBottom: 4,
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = th.surfaceUp)}
                  onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: T.amberDim, border: `1px solid ${T.amberBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "center", color: T.amber, fontWeight: 600, fontSize: 14
                  }}>
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: th.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {contact.name}
                      </div>
                      <div style={{ fontSize: 11, color: th.textMuted }}>
                        {contact.role.toUpperCase()}
                      </div>
                    </div>
                    {contact.last_message && (
                      <div style={{ fontSize: 12, color: th.textSecondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>
                        {contact.last_message}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE - CHAT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: th.surface }}>
        {activeContact ? (
          <>
            {/* Header */}
            <div style={{
              padding: "16px 24px", borderBottom: `1px solid ${th.border}`,
              display: "flex", alignItems: "center", gap: 14
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: T.amberDim, border: `1px solid ${T.amberBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center", color: T.amber, fontWeight: 600, fontSize: 16
              }}>
                {activeContact.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: th.textPrimary }}>{activeContact.name}</div>
                <div style={{ fontSize: 12, color: th.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                  <Circle size={8} fill={T.amber} color={T.amber} /> {activeContact.role.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
              {loadingHistory ? (
                <div style={{ textAlign: "center", color: th.textMuted, fontSize: 13, marginTop: 40 }}>Loading messages...</div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", color: th.textMuted, fontSize: 13, marginTop: 40 }}>No messages yet. Send a message to start the conversation!</div>
              ) : (
                messages.map(msg => {
                  // If it's sent by me (assuming user.id matching msg.sender_id)
                  // Wait, authStore user may not have an exact matching id structure depending on role.
                  // We can infer sender is ME if sender_id !== activeContact.id
                  const isMe = msg.sender_id !== activeContact.id;
                  
                  return (
                    <div key={msg.id} style={{
                      alignSelf: isMe ? "flex-end" : "flex-start",
                      maxWidth: "70%", display: "flex", flexDirection: "column", gap: 4,
                      alignItems: isMe ? "flex-end" : "flex-start"
                    }}>
                      <div style={{
                        padding: "10px 14px", fontSize: 13.5, lineHeight: 1.5,
                        background: isMe ? T.amber : th.surfaceUp,
                        color: isMe ? T.amberText : th.textPrimary,
                        border: `1px solid ${isMe ? T.amber : th.borderUp}`,
                        borderRadius: isMe ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: 10, color: th.textMuted }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ padding: "16px 24px", borderTop: `1px solid ${th.border}`, display: "flex", gap: 10 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message ${activeContact.name}...`}
                style={{
                  flex: 1, padding: "12px 16px",
                  background: th.surfaceUp, border: `1px solid ${th.borderUp}`,
                  borderRadius: 10, color: th.textPrimary, fontSize: 14, outline: "none",
                  fontFamily: T.font
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: input.trim() && !sending ? T.amber : th.surfaceUp,
                  border: "none", cursor: input.trim() && !sending ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s", color: input.trim() && !sending ? T.amberText : th.textMuted
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: th.textMuted }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: th.surfaceUp, border: `1px solid ${th.borderUp}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <MessageSquare size={28} color={T.amber} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: th.textPrimary }}>Your Direct Messages</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Select a contact from the left pane to start chatting.</div>
          </div>
        )}
      </div>

    </div>
  );
}
