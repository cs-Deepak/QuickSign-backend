// require("dotenv").config();
// const express = require("express");
// const app = express();
// const cors = require("cors");
// const session = require("express-session");
// const passport = require("passport");
// const OAuth2Strategy = require("passport-google-oauth2").Strategy;
// const userdb = require("./model/userSchema");
// const connectDB = require('./db/conn');
// const manualAuthRoutes = require("./routes/manualAuthRoutes");

// // ✅ CORS for both apps
// app.use(cors({
//   origin: [
    
//     "https://quicksign3.netlify.app"
//   ],
//   methods: "GET,POST,PUT,DELETE",
//   credentials: true
// }));

// // Connect to MongoDB once at startup
// connectDB()
//   .then(() => console.log("✅ MongoDB connected successfully"))
//   .catch(err => console.error("❌ MongoDB connection error:", err));

// app.use("/auth/manual", manualAuthRoutes);
// app.use(express.json());

// // Session configuration
// app.use(session({
//   secret: process.env.SESSION_SECRET || "1245644298hniyrcoiuqn",
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === "production",
//     httpOnly: true,
//     sameSite: "none",
//     maxAge: 24 * 60 * 60 * 1000
//   }
// }));

// app.use(passport.initialize());
// app.use(passport.session());

// // ✅ Passport Google Strategy
// passport.use(new OAuth2Strategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: "https://quicksign-backend.onrender.com/auth/google/callback",
//   passReqToCallback: true,
//   scope: ['profile', 'email']
// }, async (request, accessToken, refreshToken, profile, done) => {
//   try {
//     let user = await userdb.findOne({ googleId: profile.id });

//     if (!user) {
//       user = new userdb({
//         googleId: profile.id,
//         displayName: profile.displayName,
//         email: profile.emails[0].value,
//         image: profile.photos?.[0]?.value || ''
//       });
//       await user.save();
//     } else {
//       if (!user.image && profile.photos?.[0]?.value) {
//         user.image = profile.photos[0].value;
//         await user.save();
//       }
//     }

//     return done(null, user);
//   } catch (error) {
//     console.error("Error in OAuth callback:", error);
//     return done(error, null);
//   }
// }));

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await userdb.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// // Google Auth Routes
// app.get("/auth/google", passport.authenticate("google", {
//   scope: ["profile", "email"]
// }));

// // Google callback route with dynamic frontend redirect
// app.get("/auth/google/callback", 
//   passport.authenticate("google", {
//     failureRedirect: "https://quicksign3.netlify.app//login"
//   }),
//   (req, res) => {
//     const referer = req.headers.referer || "";

//     if (referer.includes("quicksign3.netlify.app")) {
//       res.redirect("https://quicksign3.netlify.app/dashboard");
//     } else {
//       res.redirect("https://todo-ugwc.vercel.app/dashboard");
//     }
//   }
// );

// // Get authenticated user
// app.get("/api/user", (req, res) => {
//   if (req.isAuthenticated()) {
//     return res.status(200).json({ success: true, user: req.user });
//   }
//   return res.status(401).json({ success: false, message: "Not authenticated" });
// });

// // Logout
// app.get("/auth/logout", (req, res) => {
//   req.logout((err) => {
//     if (err) {
//       console.log("Error during logout:", err);
//       return res.status(500).send("Error during logout.");
//     }
//     res.clearCookie("connect.sid");
//     res.redirect("https://todo-ugwc.vercel.app/login");
//   });
// });

// app.get("/logout", (req, res, next) => {
//   req.logOut(function (err) {
//     if (err) return next(err);
//     res.redirect("https://todo-ugwc.vercel.app");
//   });
// });

// app.get("/login/success", async (req, res) => {
//   if (req.user) {
//     res.status(200).json({ message: "user Login", user: req.user });
//   } else {
//     res.status(400).json({ message: "Not Authorized" });
//   }
// });

// // Root test route
// app.get("/", (req, res) => {
//   res.send("🚀 Backend is running!");
// });

// // Dummy API
// app.post("/api/v2/addTask", (req, res) => {
//   console.log("Request received:", req.body);
//   res.send({ success: true });
// });

// // ✅ START SERVER HERE (required by Render)
// const PORT = process.env.PORT || 6006;
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
// });





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

// ✅ CORS for QuickSign frontend only
// app.use(cors({
//   origin: "https://quicksign3.netlify.app",
//   methods: "GET,POST,PUT,DELETE",
//   credentials: true
// }));


app.use(
  cors({
    origin: "https://quicksign3.netlify.app", // your frontend
    credentials: true, // 👈 required for sending cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);


// ✅ Connect to MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

app.use("/auth/manual", manualAuthRoutes);
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "1245644298hniyrcoiuqn",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // 🔁 Force secure always for HTTPS like Render
    httpOnly: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000
  }
}));


app.use(passport.initialize());
app.use(passport.session());

// ✅ Passport Google Strategy for QuickSign
passport.use(new OAuth2Strategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://quicksign-backend.onrender.com/auth/google/callback",
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

// ✅ Google OAuth Routes
app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

app.get("/auth/google/callback", 
  passport.authenticate("google", {
    failureRedirect: "https://quicksign3.netlify.app/login"
  }),
  (req, res) => {
    res.redirect("https://quicksign3.netlify.app/dashboard");
  }
);

// ✅ Authenticated user info
app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({ success: true, user: req.user });
  }
  return res.status(401).json({ success: false, message: "Not authenticated" });
});

// ✅ Logout route
app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log("Error during logout:", err);
      return res.status(500).send("Error during logout.");
    }
    res.clearCookie("connect.sid");
    res.redirect("https://quicksign3.netlify.app/login");
  });
});

app.get("/logout", (req, res, next) => {
  req.logOut(function (err) {
    if (err) return next(err);
    res.redirect("https://quicksign3.netlify.app");
  });
});

// app.get("/login/success", async (req, res) => {
//   if (req.user) {
//     res.status(200).json({ message: "user Login", user: req.user });
//   } else {
//     res.status(400).json({ message: "Not Authorized" });
//   }
// });

app.get("/login/success", async (req, res) => {
  console.log("✅ req.user is:", req.user); // Add this
  if (req.user) {
    res.status(200).json({ message: "user Login", user: req.user });
  } else {
    res.status(400).json({ message: "Not Authorized" });
  }
});


// ✅ Root test route
app.get("/", (req, res) => {
  res.send("🚀 Backend is running for QuickSign!");
});

// Dummy API 
app.post("/api/v2/addTask", (req, res) => {
  console.log("Request received:", req.body);
  res.send({ success: true });
});

// ✅ Start server on Render-assigned port
const PORT = process.env.PORT || 6006;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

