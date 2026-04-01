import express from "express";

const router = express.Router();

router.post("/chat", (req, res) => {
  const { message } = req.body;

  console.log("🔥 MESSAGE RECEIVED:", message);

  let reply = "";

  if (message.toLowerCase().includes("career")) {
    reply =
      "You can explore careers like Software Engineer, Data Scientist, AI Engineer, or Web Developer.";
  } else if (message.toLowerCase().includes("skills")) {
    reply =
      "Focus on skills like JavaScript, Python, DSA, React, and problem-solving.";
  } else if (message.toLowerCase().includes("job")) {
    reply =
      "You can apply on platforms like LinkedIn, Indeed, and Internshala.";
  } else {
    reply = "Hello! I'm your AI assistant 🤖. Ask me about careers, skills, or jobs.";
  }

  res.json({ reply });
});

export default router;