const express = require("express");
const router = express.Router();
const ManualUser = require("../model/manualUserSchema");

// POST route to register new user
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await ManualUser.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const newUser = new ManualUser({ username, password }); // You should hash the password in real apps
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST route to login user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await ManualUser.findOne({ username, password });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;