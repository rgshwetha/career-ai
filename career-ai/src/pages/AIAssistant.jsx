import { useState } from "react";
import axios from "axios";

function AIAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await axios.post("http://localhost:5000/api/ai/chat", {
        message: input,
      });

      const botMessage = {
        role: "bot",
        text: res.data.reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Something went wrong ❌" },
      ]);
    }

    setInput("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>AI Career Assistant 🤖</h1>

      <div
        style={{
          marginBottom: "20px",
          maxHeight: "400px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong>{" "}
            {msg.text}
          </p>
        ))}
      </div>

      <input
        type="text"
        placeholder="Ask about career, jobs, skills..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "70%", padding: "10px", marginRight: "10px" }}
      />

      <button onClick={sendMessage} style={{ padding: "10px 20px" }}>
        Send
      </button>
    </div>
  );
}

export default AIAssistant;