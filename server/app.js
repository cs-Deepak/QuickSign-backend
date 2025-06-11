

require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const userdb = require("./model/userSchema");
const connectDB = require('./db/conn');
const manualAuthRoutes = require("./routes/manualAuthRoutes");
const Todo = require("./model/Todo");  // ✅ Required for Todo APIs

// ✅ CORS for both apps
app.use(cors({
  origin: [
    "https://todo-ugwc.vercel.app",
    "https://quicksign3.netlify.app"
  ],
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

// Connect to MongoDB once at startup
connectDB()
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use("/auth/manual", manualAuthRoutes);
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "1245644298hniyrcoiuqn",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ✅ Passport Google Strategy
passport.use(new OAuth2Strategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://todo-backend-steel-six.vercel.app/auth/google/callback",
  passReqToCallback: true,
  scope: ['profile', 'email']
}, async (request, accessToken, refreshToken, profile, done) => {
  try {
    let user = await userdb.findOne({ googleId: profile.id });

    if (!user) {
      user = new userdb({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        image: profile.photos?.[0]?.value || ''
      });
      await user.save();
    } else {
      if (!user.image && profile.photos?.[0]?.value) {
        user.image = profile.photos[0].value;
        await user.save();
      }
    }

    return done(null, user);
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userdb.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Auth Routes
app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

// ✅ Dynamic redirect based on `state`
// app.get("/auth/google/callback",
//   passport.authenticate("google", {
//     failureRedirect: "https://todo-ugwc.vercel.app/login"
//   }),
//   (req, res) => {
//     const redirectBase = req.query.state === "signature"                  // changed here
//       ? "https://quicksign3.netlify.app/dashboard"
//       : "https://todo-ugwc.vercel.app/dashboard";
      
//     res.redirect(redirectBase);
//   }
// );





app.get("/auth/google/callback", 
  passport.authenticate("google", {
    failureRedirect: "https://todo-ugwc.vercel.app/login"
  }),
  (req, res) => {
    const referer = req.headers.referer || "";

    // Dynamically redirect based on origin
    if (referer.includes("quicksign3.netlify.app")) {
      res.redirect("https://quicksign3.netlify.app/dashboard");
    } else {
      res.redirect("https://todo-ugwc.vercel.app/dashboard");
    }
  }
);


// Get Authenticated User Info
app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  }
  return res.status(401).json({
    success: false,
    message: "Not authenticated"
  });
});

// Logout
app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log("Error during logout:", err);
      return res.status(500).send("Error during logout.");
    }
    res.clearCookie("connect.sid");
    res.redirect("https://todo-ugwc.vercel.app/login");
  });
});

// Extra logout
app.get("/logout", (req, res, next) => {
  req.logOut(function (err) {
    if (err) return next(err);
    res.redirect("https://todo-ugwc.vercel.app");
  });
});

app.get("/login/success", async (req, res) => {
  if (req.user) {
    res.status(200).json({ message: "user Login", user: req.user });
  } else {
    res.status(400).json({ message: "Not Authorized" });
  }
});

// Basic route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running!");
});

// API placeholder
app.post("/api/v2/addTask", (req, res) => {
  console.log("Request received:", req.body);
  res.send({ success: true });
});

// Todo CRUD APIs
app.post("/api/todos", async (req, res) => {
  const { title, body } = req.body;
  const userEmail = req.user?.email;
  if (!userEmail) return res.status(401).send("Not logged in");

  try {
    const todo = new Todo({ title, body, userEmail });
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).send("Error saving todo");
  }
});

app.get("/api/todos", async (req, res) => {
  const userEmail = req.user?.email;
  if (!userEmail) return res.status(401).send("Unauthorized");

  const todos = await Todo.find({ userEmail });
  res.json(todos);
});

app.delete("/api/todos/:id", async (req, res) => {
  const userEmail = req.user?.email;

  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, userEmail });
    if (!todo) return res.status(404).send("Not found");
    res.send("Deleted");
  } catch {
    res.status(500).send("Error deleting todo");
  }
});

app.put("/api/todos/:id", async (req, res) => {
  const userEmail = req.user?.email;
  const { title, body } = req.body;

  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userEmail },
      { title, body },
      { new: true }
    );
    if (!todo) return res.status(404).send("Not found");
    res.json(todo);
  } catch {
    res.status(500).send("Error updating todo");
  }
});

// Start Server
const PORT = process.env.PORT || 6006;
module.exports = app;
