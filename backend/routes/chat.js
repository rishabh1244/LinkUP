const express = require("express");
const router = express.Router();

const Message = require("../models/Message");

router.post("/text", async (req, res) => {
    const { Sender, Reciver, Content } = req.body;
    await Message.create({
        Sender,
        Reciver,
        Content
    });

    res.json({ Sender, Reciver, Content });
})

router.post("/getText", async (req, res) => {
   const { user1, user2 } = req.body;

  if (!user1 || !user2) {
    return res.status(400).json({ error: "Both usernames are required." });
  }

  try {
    const chats = await Message.find({
      $or: [
        { Sender: user1, Reciver: user2 },
        { Sender: user2, Reciver: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router