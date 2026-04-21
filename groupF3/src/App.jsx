import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// Keeping your logic exactly as is
const socket = io("http://localhost:5000", {
  auth: { token: "deepak" },
  autoConnect: false,
});

const MY_USER_ID = "deepak";

function App() {
  const [message, setMessage] = useState("");
  const [received, setReceived] = useState([]);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("join_group", { groupId: "messages" });
    });

    socket.on("receive_message", (data) => {
      if (data.userId === MY_USER_ID) return;
      setReceived((prev) => [...prev, data]);
    });

    socket.on("get_message", (data) => {
      setReceived(data);
    });

    socket.on("error_message", (err) => {
      setError(err);
    });

    socket.connect();

    return () => {
      socket.off("connect");
      socket.off("receive_message");
      socket.off("get_message");
      socket.off("error_message");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [received]);

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMsg = { userId: MY_USER_ID, message };
    setReceived((prev) => [...prev, newMsg]);
    socket.emit("private_message", {
      message,
      groupId: "messages",
    });
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (error) return <div style={styles.error}>⚠️ {error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.statusDot}></div>
        <h2 style={styles.headerTitle}>Global Chat</h2>
      </div>

      <div style={styles.chatBox}>
        {received.map((msg, index) => {
          const isMe = msg.userId === MY_USER_ID;
          return (
            <div
              key={index}
              style={{
                ...styles.messageWrapper,
                alignItems: isMe ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.message,
                  backgroundColor: isMe ? "#0084ff" : "#e4e6eb",
                  color: isMe ? "#fff" : "#000",
                  borderRadius: isMe ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                }}
              >
                {!isMe && <strong style={styles.sender}>{msg.userId}</strong>}
                <p style={styles.msgText}>{msg.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Aa"
        />
        <button 
          style={{...styles.button, opacity: message.trim() ? 1 : 0.5}} 
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;

const styles = {
  container: {
    width: "100%",
    maxWidth: "450px",
    margin: "40px auto",
    backgroundColor: "#18191a", // Darker background
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    height: "85vh",
    fontFamily: "Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    boxShadow: "0 12px 36px rgba(0,0,0,0.3)",
    overflow: "hidden",
  },
  header: {
    padding: "15px 20px",
    backgroundColor: "#242526",
    borderBottom: "1px solid #3e4042",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  headerTitle: {
    fontSize: "18px",
    margin: 0,
    fontWeight: "700",
    color: "#e4e6eb",
  },
  statusDot: {
    width: "10px",
    height: "10px",
    backgroundColor: "#31a24c",
    borderRadius: "50%",
    boxShadow: "0 0 8px rgba(49, 162, 76, 0.5)",
  },
  chatBox: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "#18191a",
  },
  messageWrapper: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  message: {
    maxWidth: "75%",
    padding: "10px 14px",
    fontSize: "15px",
    lineHeight: "1.4",
  },
  sender: {
    fontSize: "12px",
    fontWeight: "700",
    display: "block",
    marginBottom: "4px",
    color: "#45bdff", // Bright Blue/Cyan so it's readable on gray/black
    textTransform: "capitalize",
  },
  msgText: {
    margin: 0,
    wordWrap: "break-word",
  },
  inputContainer: {
    padding: "15px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#242526",
    borderTop: "1px solid #3e4042",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "20px",
    border: "none",
    backgroundColor: "#3a3b3c",
    color: "#e4e6eb",
    fontSize: "15px",
    outline: "none",
  },
  button: {
    padding: "8px 16px",
    border: "none",
    backgroundColor: "transparent",
    color: "#2e89ff",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
  },
  error: {
    color: "#f35369",
    backgroundColor: "rgba(243, 83, 105, 0.1)",
    padding: "15px",
    margin: "20px auto",
    borderRadius: "8px",
    width: "fit-content",
    border: "1px solid #f35369",
  },
};