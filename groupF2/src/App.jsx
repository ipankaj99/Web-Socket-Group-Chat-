import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: { token: "madhav" },
  autoConnect: false,
});

const MY_USER_ID = "madhav";

function App() {
  const [message, setMessage] = useState("");
  const [received, setReceived] = useState([]);
  const [error, setError] = useState(null);
  const [typing, setTyping] = useState("");

  const chatEndRef = useRef(null);
  const chatRef=useRef(false);
  const typingTimerRef = useRef(null);
  const [userOnline, setUserOnline]=useState(0);

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("join_group", {
        groupId: "messages",
        userId: MY_USER_ID,
      });
    });

    socket.on('online_count', (data)=>{
      setUserOnline(data);
    })

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

    socket.on("typing_message", (data) => {
      if (data.userId === MY_USER_ID) return;
      setTyping(`${data.userId} is typing...`);
    });

    socket.on("stop_typing", () => {
      setTyping("");
    });

    socket.connect();

    socket.on("disconnect", () => {
      console.log("disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("receive_message");
      socket.off("get_message");
      socket.off("error_message");
      socket.off("typing_message");
      socket.off("stop_typing");
      socket.off("disconnect");
      socket.off('online_count');

      socket.disconnect();

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
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

    socket.emit("stop_typing", {
      groupId: "messages",
      userId: MY_USER_ID,
    });

    setMessage("");
    setTyping("");
  };

  const handleMessage = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!value.trim()) 
    {
       socket.emit("stop_typing", {
        groupId: "messages",
        userId: MY_USER_ID,
      });
      chatRef.current=false;
    }
    if(!chatRef.current)
    {
      chatRef.current=true;
        socket.emit("typing_message", {
      groupId: "messages",
      userId: MY_USER_ID,
    });
    }

  

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    typingTimerRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        groupId: "messages",
        userId: MY_USER_ID,
      });
      chatRef.current=false;
    }, 1200);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "450px",
        margin: "40px auto",
        background: "#18191a",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        height: "85vh",
        fontFamily: "Segoe UI",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "12px",
          background: "#242526",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <h3 style={{ color: "#fff", margin: 0 }}>Global Chat</h3>
        <h4 style={{ color: "#fff", margin: 0 }}>{userOnline} are Online</h4>
      </div>

      {/* TYPING */}
      {typing && (
        <div style={{ padding: "5px 12px", color: "#45bdff", fontSize: 13 }}>
          {typing}
        </div>
      )}

      {/* CHAT AREA */}
      <div
        style={{
          flex: 1,
          padding: "12px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {received.map((msg, i) => {
          const isMe = msg.userId === MY_USER_ID;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "10px 12px",
                  borderRadius: "12px",
                  background: isMe ? "#0084ff" : "#3a3b3c",
                  color: "#fff",
                  fontSize: "14px",
                }}
              >
                {!isMe && (
                  <div style={{ fontSize: 11, opacity: 0.7 }}>
                    {msg.userId}
                  </div>
                )}
                {msg.message}
              </div>
            </div>
          );
        })}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div
        style={{
          display: "flex",
          padding: "10px",
          background: "#242526",
          gap: "10px",
        }}
      >
        <input
          value={message}
          onChange={handleMessage}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "20px",
            border: "none",
            outline: "none",
            background: "#3a3b3c",
            color: "#fff",
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            padding: "10px 15px",
            borderRadius: "20px",
            border: "none",
            background: "#0084ff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;